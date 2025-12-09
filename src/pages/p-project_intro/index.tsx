

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AchievementService } from '../../lib/achievementService';
import { AchievementType, User } from '../../types/achievement';
import { uploadToAchievementImagesBucket, uploadToAchievementVideosBucket, checkAchievementImagesBucket, createAchievementImagesBucket } from '../../services/supabaseStorageService';
import styles from './styles.module.css';

interface Collaborator {
  id: string;
  name: string;
}

interface Attachment {
  id: string;
  file: File;
  name: string;
  type: string;
}

interface Photo {
  id: string;
  file: File;
  url: string;
  description: string;
}

interface Video {
  id: string;
  file: File;
  url: string;
  duration: number;
}

// 自动消失的成功提示
const showSuccessToast = (message: string) => {
  // 创建toast元素
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // 添加到页面
  document.body.appendChild(toast);

  // 2秒后自动消失
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 300);
  }, 2000);
};

const ProjectIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // 用户信息状态
  const [userName, setUserName] = useState<string>('用户');
  
  // 表单状态
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [projectName, setProjectName] = useState('');
  const [projectLeader, setProjectLeader] = useState('');
  const [projectType, setProjectType] = useState('');
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  const [projectDescription, setProjectDescription] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [collaboratorUsers, setCollaboratorUsers] = useState<User[]>([]);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [studentUsers, setStudentUsers] = useState<User[]>([]); // 所有学生用户（role=1）
  const [projectLeaderId, setProjectLeaderId] = useState(''); // 项目负责人ID
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string>('');
  

  
  // 页面标题设置
  useEffect(() => {
    const originalTitle = document.title;
    document.title = isEditMode ? '软院项目通 - 编辑成果' : '软院项目通 - 学生端成果发布';
    return () => { document.title = originalTitle; };
  }, [isEditMode]);
  
  // 加载成果类型和教师列表
  useEffect(() => {
    const editId = searchParams.get('edit');
    
    if (editId) {
      setIsEditMode(true);
      setEditingAchievementId(editId);
      console.log('检测到编辑模式，成果ID:', editId);
    }
    
    fetchUserInfo();
    loadAchievementTypes();
    loadInstructors();
    loadCollaboratorUsers();
    loadStudentUsers();
    
    // 如果是编辑模式，在加载完成果类型后再加载成果数据
    if (editId) {
      setTimeout(() => {
        loadEditAchievement(editId);
      }, 800); // 等待类型加载完成
    }
  }, [searchParams]);
  
  const loadAchievementTypes = async () => {
    try {
      const result = await AchievementService.getAchievementTypes();
      if (result.success && result.data) {
        setAchievementTypes(result.data);
      }
    } catch (error) {
      console.error('加载成果类型失败:', error);
    }
  };

  const loadInstructors = async () => {
    try {
      const result = await AchievementService.getUsersByRole(2); // 2 是教师角色
      if (result.success && result.data) {
        setInstructors(result.data);
        // 默认选择第一个教师
        if (result.data.length > 0) {
          setSelectedInstructorId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('加载教师列表失败:', error);
    }
  };

  const loadCollaboratorUsers = async () => {
    try {
      const result = await AchievementService.getUsersForCollaborators(); // 获取所有用户（排除role=3）
      if (result.success && result.data) {
        setCollaboratorUsers(result.data);
      }
    } catch (error) {
      console.error('加载协作用户列表失败:', error);
    }
  };

  const loadStudentUsers = async () => {
    try {
      const result = await AchievementService.getUsersByRole(1); // 获取所有学生用户（role=1）
      if (result.success && result.data) {
        setStudentUsers(result.data);
        // 如果没有选择项目负责人，默认设置为当前用户
        // 强制设置为当前学生用户
        if (user?.id) {
          setProjectLeaderId(user.id);
          setProjectLeader(user?.full_name || user?.username || '当前学生');
        }
      }
    } catch (error) {
      console.error('加载学生用户列表失败:', error);
    }
  };

  // 加载要编辑的成果数据
  const loadEditAchievement = async (achievementId: string) => {
    try {
      console.log('正在加载成果数据:', achievementId);
      const result = await AchievementService.getAchievementById(achievementId);
      if (result.success && result.data) {
        const achievement = result.data;
        console.log('加载到的成果数据:', achievement);
        
        // 设置基本信息
        setProjectName(achievement.title || '');
        setProjectDescription(achievement.description || '');
        setProjectLeader(user?.full_name || user?.username || '');
        setProjectLeaderId(achievement.publisher_id || user?.id || '');
        
        // 设置项目类型
        if (achievement.type_id && achievementTypes.length > 0) {
          const type = achievementTypes.find(t => t.id === achievement.type_id);
          if (type) {
            setProjectType(type.name);
          }
        }
        
        // 设置指导老师
        if (achievement.instructor_id) {
          setSelectedInstructorId(achievement.instructor_id);
        }
        
        // 设置协作者
        if (achievement.parents_id) {
          setSelectedCollaboratorId(achievement.parents_id);
        }
        
        // 设置封面图片
        if (achievement.cover_url) {
          const photo: Photo = {
            id: 'edit-cover',
            file: new File([], 'cover.jpg'),
            url: achievement.cover_url,
            description: ''
          };
          setPhotos([photo]);
        }
        
        // 设置视频
        if (achievement.video_url) {
          const video: Video = {
            id: 'edit-video',
            file: new File([], 'video.mp4'),
            url: achievement.video_url,
            duration: 0
          };
          setVideos([video]);
        }
        
        // 设置需求文档
        if (achievement.attachments && achievement.attachments.length > 0) {
          const attachment = achievement.attachments[0]; // 只显示第一个附件
          // 设置文档URL用于查看
          setDocumentUrl(attachment.file_url);
          // 从URL创建文件对象（用于显示）
          fetch(attachment.file_url)
            .then(response => response.blob())
            .then(blob => {
              const file = new File([blob], attachment.file_name, { type: attachment.file_url.includes('pdf') ? 'application/pdf' : 'application/octet-stream' });
              setDocumentFile(file);
            })
            .catch(error => {
              console.error('加载附件文件失败:', error);
              // 即使加载失败，也设置文件名用于显示
              const fileName = attachment.file_name;
              setDocumentFile(new File([], fileName));
            });
        }
        
        // 如果富文本编辑器已渲染，设置内容
        setTimeout(() => {
          if (richTextEditorRef.current) {
            richTextEditorRef.current.innerHTML = achievement.description || '';
          }
        }, 100);
        
        console.log('成果数据加载完成');
      } else {
        console.error('加载成果数据失败:', result.message);
        alert('加载成果数据失败: ' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('加载成果数据失败:', error);
      alert('加载成果数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 响应式侧边栏处理
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('#sidebar');
      const mainContent = document.querySelector('#main-content');
      
      if (window.innerWidth >= 1024) {
        if (sidebar) sidebar.classList.remove('-translate-x-full');
        if (mainContent) mainContent.classList.add('ml-64');
      } else {
        if (mainContent) mainContent.classList.remove('ml-64');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化

    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Refs
  const richTextEditorRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const documentUploadRef = useRef<HTMLInputElement>(null);
  const imageInsertRef = useRef<HTMLInputElement>(null);

  // 处理富文本编辑器内容变化
  const handleRichTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const originalContent = target.innerHTML;
    
    // 实时清理内容，只保留img标签
    const cleanedContent = AchievementService.cleanDescriptionForStorage(originalContent);
    
    // 更新编辑器内容为清理后的内容
    if (cleanedContent !== originalContent) {
      // 设置光标位置（尽量保持用户体验）
      const selection = window.getSelection();
      const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset || 0;
      
      target.innerHTML = cleanedContent;
      
      // 尝试恢复光标位置
      try {
        if (range) {
          const newRange = document.createRange();
          const textNode = target.firstChild;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        }
      } catch (error) {
        // 如果恢复光标失败，简单设置焦点
        target.focus();
      }
    }
    
    setProjectDescription(cleanedContent);
  };

  // 富文本编辑器工具栏操作
  const handleEditorCommand = (command: string, _value?: string) => {
    switch (command) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'insertHeading2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'insertParagraph':
        document.execCommand('insertParagraph', false, null);
        break;
      case 'justifyLeft':
        document.execCommand('justifyLeft', false, null);
        break;
      case 'justifyCenter':
        document.execCommand('justifyCenter', false, null);
        break;
      case 'justifyRight':
        document.execCommand('justifyRight', false, null);
        break;
      case 'insertLink':
        const url = prompt('请输入链接地址：', 'https://');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'insertImage':
        if (imageInsertRef.current) {
          imageInsertRef.current.click();
        }
        break;
    }
    richTextEditorRef.current?.focus();
  };

  // 处理图片选择（用于富文本编辑器中的图片插入）
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件');
        return;
      }
      
      // 检查文件大小
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }
      
      // 立即上传图片到achievement-images桶
      uploadRichTextImage(file);
      
      // 清空文件输入
      if (imageInsertRef.current) {
        imageInsertRef.current.value = '';
      }
    }
  };

  // 跳过存储桶检查的标志
  const [skipBucketCheck, setSkipBucketCheck] = useState(false);
  const [forceSkipCheck, setForceSkipCheck] = useState(false);
  const [directUseBucket, setDirectUseBucket] = useState(true); // 直接使用存储桶，不检查

  // 上传富文本中的图片到achievement-images桶
  const uploadRichTextImage = async (file: File) => {
    try {
      // 上传图片到achievement-images桶（使用当前用户ID）
      const fileName = `richtext_${Date.now()}_${file.name}`;
      const filePath = `achievements/${user?.id}/${fileName}`;
      const uploadResult = await uploadToAchievementImagesBucket(file, fileName, filePath, directUseBucket);
      
      if (uploadResult.success && uploadResult.url) {
        // 使用Supabase URL插入图片，按照要求的格式
        if (richTextEditorRef.current) {
          // 按照要求的格式插入：<br><img src="..."><br>
          const imgHtml = `<br><img src="${uploadResult.url}"><br>`;
          
          // 插入HTML内容
          if (window.getSelection) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = imgHtml;
              const frag = document.createDocumentFragment();
              let node;
              while ((node = tempDiv.firstChild)) {
                frag.appendChild(node);
              }
              range.insertNode(frag);
            } else {
              // 如果没有选区，直接在末尾插入
              richTextEditorRef.current.innerHTML += imgHtml;
            }
          } else {
            // 兼容IE等其他浏览器
            richTextEditorRef.current.innerHTML += imgHtml;
          }
          
          // 更新项目描述
          const currentContent = richTextEditorRef.current.innerHTML;
          setProjectDescription(currentContent);
          
          console.log('已插入Supabase图片:', uploadResult.url);
        }
      } else {
        console.error('富文本图片上传失败:', uploadResult.error);
        alert('图片上传失败，请重试');
      }
    } catch (error) {
      console.error('上传富文本图片时发生错误:', error);
      alert('图片上传失败，请重试');
    }
  };

  // 调试存储桶状态
  const debugStorageBucket = async () => {
    console.log('=== 调试achievement-images存储桶 ===');
    
    try {
      // 检查存储桶
      const bucketExists = await checkAchievementImagesBucket();
      console.log('存储桶检查结果:', bucketExists);
      
      if (!bucketExists) {
        console.log('尝试创建存储桶...');
        const created = await createAchievementImagesBucket();
        console.log('创建结果:', created);
      }
      
      // 重新检查
      const finalCheck = await checkAchievementImagesBucket();
      console.log('最终检查结果:', finalCheck);
      
      // 列出所有存储桶
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('所有存储桶:', buckets?.map(b => ({ name: b.name, id: b.id })));
      
      alert(`存储桶状态: ${finalCheck ? '存在' : '不存在'}\\n请查看控制台获取详细信息`);
    } catch (error) {
      console.error('调试存储桶时发生错误:', error);
      alert(`调试失败: ${error}`);
    }
  };

  // 测试封面图片上传
  const testCoverUpload = async () => {
    console.log('=== 测试封面图片上传 ===');
    
    if (photos.length === 0) {
      alert('请先选择一张封面图片');
      return;
    }
    
    const coverPhoto = photos[0];
    const fileName = `test_cover_${Date.now()}_${coverPhoto.id}.jpg`;
    const filePath = `achievements/${user.id}/${fileName}`;
    
    console.log('测试上传参数:');
    console.log('- 文件:', coverPhoto.file);
    console.log('- 文件名:', fileName);
    console.log('- 文件路径:', filePath);
    
    const uploadResult = await uploadToAchievementImagesBucket(coverPhoto.file, fileName, filePath);
    
    if (uploadResult.success && uploadResult.url) {
      console.log('✅ 测试上传成功:', uploadResult.url);
      console.log('URL验证:');
      console.log('- 以https开头:', uploadResult.url.startsWith('https://'));
      console.log('- 包含项目ID:', uploadResult.url.includes('vntvrdkjtfdcnvwgrubo.supabase.co'));
      console.log('- 包含存储桶:', uploadResult.url.includes('achievement-images'));
      console.log('- 包含文件路径:', uploadResult.url.includes(filePath));
      
      alert(`测试上传成功！\\n\\nURL: ${uploadResult.url}\\n\\n请查看控制台验证格式`);
    } else {
      console.error('❌ 测试上传失败:', uploadResult.error);
      alert(`测试上传失败: ${uploadResult.error}`);
    }
  };

  // 添加协作者（下拉选择方式）
  const addCollaborator = () => {
    if (selectedCollaboratorId) {
      const selectedUser = collaboratorUsers.find(user => user.id === selectedCollaboratorId);
      if (selectedUser && !collaborators.find(c => c.id === selectedUser.id)) {
        const newCollaborator: Collaborator = {
          id: selectedUser.id,
          name: selectedUser.full_name || selectedUser.username
        };
        setCollaborators([...collaborators, newCollaborator]);
        setSelectedCollaboratorId(''); // 清空选择
      }
    }
  };

  // 删除协作者
  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  // 照片上传（封面图片，只处理第一张图片）
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // 只取第一个文件
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件（JPG、PNG、GIF、WebP格式）');
        return;
      }
      
      // 检查文件大小
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          file,
          url: event.target?.result as string,
          description: ''
        };
        setPhotos([newPhoto]); // 替换现有照片，只保留一张
        console.log('已选择封面图片，将在发布时上传到achievement-images桶');
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除照片
  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  // 更新照片描述
  const updatePhotoDescription = (id: string, description: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, description } : p));
  };

  // 视频上传（项目演示视频，只处理第一个视频）
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // 只取第一个文件
      
      // 检查文件类型
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!allowedVideoTypes.includes(file.type)) {
        alert('只能上传视频文件（MP4、WebM、OGG、MOV格式）');
        return;
      }
      
      // 检查文件大小
      if (file.size > 100 * 1024 * 1024) {
        alert('视频大小不能超过100MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const video = document.createElement('video');
        video.src = event.target?.result as string;
        video.onloadedmetadata = () => {
          const newVideo: Video = {
            id: Date.now().toString(),
            file,
            url: event.target?.result as string,
            duration: video.duration
          };
          setVideos([newVideo]); // 替换现有视频，只保留一个
          console.log('已选择演示视频，将在发布时上传到achievement-videos桶');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 删除视频
  const removeVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  // 文档上传
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentUrl(''); // 清除编辑模式的URL，使用新上传的文件
    }
  };

  // 清除文档
  const clearDocument = () => {
    setDocumentFile(null);
    setDocumentUrl('');
    if (documentUploadRef.current) {
      documentUploadRef.current.value = '';
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    console.log('🔍 验证数据:');
    console.log('  projectName:', projectName);
    console.log('  projectLeader:', projectLeader);
    console.log('  projectLeaderId:', projectLeaderId);
    console.log('  studentUsers:', studentUsers.length);
    
    if (!projectName || !projectLeaderId) {
      alert('请输入项目名称和负责人');
      return;
    }

    if (!selectedInstructorId) {
      alert('请选择指导老师');
      return;
    }

    if (!user?.id) {
      alert('用户未登录，请先登录');
      return;
    }

    setIsSubmitting(true);

    try {
      // 处理富文本中的图片（如果有base64或blob URL，转换为Supabase URL）
      let processedDescription = projectDescription;
      if (projectDescription) {
        const imageProcessResult = await AchievementService.processRichTextImages(projectDescription, user.id);
        if (imageProcessResult.success && imageProcessResult.processedContent) {
          // 清理HTML内容，只保留img标签
          processedDescription = AchievementService.cleanDescriptionForStorage(imageProcessResult.processedContent);
        } else {
          // 如果图片处理失败，直接清理原始内容
          processedDescription = AchievementService.cleanDescriptionForStorage(projectDescription);
        }
      }

      // 上传封面图片到achievement-images桶（使用publisher_id分类）
      let coverUrl = '';
      if (photos.length > 0) {
        const coverPhoto = photos[0];
        const fileName = `cover_${Date.now()}_${coverPhoto.id}.jpg`;
        const filePath = `achievements/${projectLeaderId || user.id}/${fileName}`; // 使用publisher_id分类
        
        console.log('=== 封面图片上传开始 ===');
        console.log('项目负责人ID:', projectLeaderId || user.id);
        console.log('文件名:', fileName);
        console.log('文件路径:', filePath);
        console.log('封面图片对象:', coverPhoto);
        console.log('封面图片文件类型:', coverPhoto.file?.type);
        console.log('封面图片文件大小:', (coverPhoto.file?.size / 1024 / 1024).toFixed(2) + 'MB');
        console.log('封面图片是否为File对象:', coverPhoto.file instanceof File);
        
        if (!coverPhoto.file) {
          console.error('❌ 封面图片file对象不存在');
          return;
        }
        
        const uploadResult = await uploadToAchievementImagesBucket(coverPhoto.file, fileName, filePath, directUseBucket);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
          console.log('✅ 封面图片上传成功:', coverUrl);
          console.log('URL格式检查:', coverUrl.includes('https://'));
          console.log('桶名称检查:', coverUrl.includes('achievement-images'));
        } else {
          console.warn('❌ 封面图片上传失败:', uploadResult.error);
        }
      } else {
        console.log('没有选择封面图片');
      }

      // 上传演示视频到achievement-videos桶（使用publisher_id分类）
      let videoUrl = '';
      if (videos.length > 0) {
        const demoVideo = videos[0];
        const fileName = `video_${Date.now()}_${demoVideo.id}.mp4`;
        const filePath = `achievements/${projectLeaderId || user.id}/${fileName}`; // 使用publisher_id分类
        
        console.log('=== 演示视频上传开始 ===');
        console.log('视频文件:', demoVideo.file);
        console.log('视频文件类型:', demoVideo.file?.type);
        console.log('视频文件大小:', (demoVideo.file?.size / 1024 / 1024).toFixed(2) + 'MB');
        console.log('视频文件名:', fileName);
        console.log('视频文件路径:', filePath);
        console.log('是否使用直接模式:', directUseBucket);
        
        if (!demoVideo.file) {
          console.error('❌ 视频file对象不存在');
          return;
        }
        
        const uploadResult = await uploadToAchievementVideosBucket(demoVideo.file, fileName, filePath, directUseBucket);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
          console.log('✅ 演示视频上传成功:', videoUrl);
          console.log('URL格式检查:', videoUrl.includes('https://'));
          console.log('桶名称检查:', videoUrl.includes('achievement-videos'));
        } else {
          console.warn('❌ 演示视频上传失败:', uploadResult.error);
          
          // 如果是RLS策略错误且在直接使用模式，提供帮助信息
          if (directUseBucket && uploadResult.error?.includes('row-level security policy')) {
            console.warn(`
🚨 RLS策略阻止了achievement-videos桶的上传！

🔧 解决方案：
1. 打开 Supabase 控制台: https://supabase.com/dashboard/project/vntvrdkjtfdcnvwgrubo/storage
2. 点击 "New bucket"
3. 桶名: achievement-videos
4. Public bucket: ✅
5. File size limit: 200MB
6. Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime
7. 点击 "Save"

💻 或者使用 🎬 橙色按钮复制SQL代码执行

✅ 创建完成后，上传功能将正常工作
            `);
          }
        }
      }

      let finalDescription = processedDescription || '暂无项目描述';

      // 查找项目类型ID
      const selectedType = achievementTypes.find(type => type.name === projectType);
      const typeId = selectedType ? selectedType.id : achievementTypes[0]?.id;

      if (!typeId) {
        throw new Error('未找到可用的项目类型');
      }

      // 创建草稿数据 - 使用正确的数据库字段结构
      const draftData = {
        title: projectName,
        description: finalDescription,
        type_id: typeId,
        cover_url: coverUrl,
        video_url: videoUrl,
        publisher_id: projectLeaderId || user.id, // 使用选中的项目负责人ID
        instructor_id: selectedInstructorId || user.id // 使用选中的指导老师，如果没有选中则使用学生自己
      };

      // 保存草稿
      const result = await AchievementService.saveDraft(draftData);
      
      if (result.success) {
        // 上传需求文档（如果有的话）
        if (documentFile && result.data?.id) {
          const attachmentResult = await AchievementService.uploadAndSaveAttachment(result.data.id, documentFile);
          if (!attachmentResult.success) {
            console.warn('需求文档上传失败:', attachmentResult.message);
            // 不影响主要流程，但给出提示
            alert(`草稿保存成功！但需求文档上传失败：${attachmentResult.message}`);
          } else {
            console.log('需求文档上传成功:', attachmentResult.data);
          }
        }
        
        alert('草稿保存成功！');
      } else {
        alert(`保存草稿失败: ${result.message}`);
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      alert(`保存草稿失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 项目上传
  const handleUploadProject = async () => {
    console.log('🔍 上传项目验证数据:');
    console.log('  projectName:', projectName);
    console.log('  projectLeader:', projectLeader);
    console.log('  projectLeaderId:', projectLeaderId);
    
    if (!projectName || !projectLeaderId) {
      alert('请输入项目名称和负责人');
      return;
    }

    if (!projectType) {
      alert('请选择项目类型');
      return;
    }

    if (!selectedInstructorId) {
      alert('请选择指导老师');
      return;
    }

    if (!user?.id) {
      alert('用户未登录，请先登录');
      return;
    }

    setIsSubmitting(true);

    try {
      // 处理富文本中的图片（如果有base64或blob URL，转换为Supabase URL）
      let processedDescription = projectDescription;
      if (projectDescription) {
        const imageProcessResult = await AchievementService.processRichTextImages(projectDescription, user.id);
        if (imageProcessResult.success && imageProcessResult.processedContent) {
          // 清理HTML内容，只保留img标签
          processedDescription = AchievementService.cleanDescriptionForStorage(imageProcessResult.processedContent);
        } else {
          // 如果图片处理失败，直接清理原始内容
          processedDescription = AchievementService.cleanDescriptionForStorage(projectDescription);
        }
      }

      // 上传封面图片到achievement-images桶（使用publisher_id分类）
      let coverUrl = '';
      if (photos.length > 0) {
        const coverPhoto = photos[0];
        const fileName = `cover_${Date.now()}_${coverPhoto.id}.jpg`;
        const filePath = `achievements/${projectLeaderId || user.id}/${fileName}`; // 使用publisher_id分类
        
        console.log('=== 封面图片上传开始 ===');
        console.log('项目负责人ID:', projectLeaderId || user.id);
        console.log('文件名:', fileName);
        console.log('文件路径:', filePath);
        console.log('封面图片对象:', coverPhoto);
        console.log('封面图片文件类型:', coverPhoto.file?.type);
        console.log('封面图片文件大小:', (coverPhoto.file?.size / 1024 / 1024).toFixed(2) + 'MB');
        console.log('封面图片是否为File对象:', coverPhoto.file instanceof File);
        
        if (!coverPhoto.file) {
          console.error('❌ 封面图片file对象不存在');
          return;
        }
        
        const uploadResult = await uploadToAchievementImagesBucket(coverPhoto.file, fileName, filePath, directUseBucket);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
          console.log('✅ 封面图片上传成功:', coverUrl);
          console.log('URL格式检查:', coverUrl.includes('https://'));
          console.log('桶名称检查:', coverUrl.includes('achievement-images'));
        } else {
          console.warn('❌ 封面图片上传失败:', uploadResult.error);
        }
      } else {
        console.log('没有选择封面图片');
      }

      // 上传演示视频到achievement-videos桶（使用publisher_id分类）
      let videoUrl = '';
      if (videos.length > 0) {
        const demoVideo = videos[0];
        const fileName = `video_${Date.now()}_${demoVideo.id}.mp4`;
        const filePath = `achievements/${projectLeaderId || user.id}/${fileName}`; // 使用publisher_id分类
        
        console.log('=== 演示视频上传开始 ===');
        console.log('视频文件:', demoVideo.file);
        console.log('视频文件类型:', demoVideo.file?.type);
        console.log('视频文件大小:', (demoVideo.file?.size / 1024 / 1024).toFixed(2) + 'MB');
        console.log('视频文件名:', fileName);
        console.log('视频文件路径:', filePath);
        console.log('是否使用直接模式:', directUseBucket);
        
        if (!demoVideo.file) {
          console.error('❌ 视频file对象不存在');
          return;
        }
        
        const uploadResult = await uploadToAchievementVideosBucket(demoVideo.file, fileName, filePath, directUseBucket);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
          console.log('✅ 演示视频上传成功:', videoUrl);
          console.log('URL格式检查:', videoUrl.includes('https://'));
          console.log('桶名称检查:', videoUrl.includes('achievement-videos'));
        } else {
          console.warn('❌ 演示视频上传失败:', uploadResult.error);
          
          // 如果是RLS策略错误且在直接使用模式，提供帮助信息
          if (directUseBucket && uploadResult.error?.includes('row-level security policy')) {
            console.warn(`
🚨 RLS策略阻止了achievement-videos桶的上传！

🔧 解决方案：
1. 打开 Supabase 控制台: https://supabase.com/dashboard/project/vntvrdkjtfdcnvwgrubo/storage
2. 点击 "New bucket"
3. 桶名: achievement-videos
4. Public bucket: ✅
5. File size limit: 200MB
6. Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime
7. 点击 "Save"

💻 或者使用 🎬 橙色按钮复制SQL代码执行

✅ 创建完成后，上传功能将正常工作
            `);
          }
        }
      }

      let finalDescription = processedDescription || '暂无项目描述';

      // 查找项目类型ID
      const selectedType = achievementTypes.find(type => type.name === projectType);
      if (!selectedType) {
        throw new Error('未找到对应的项目类型');
      }

      // 创建成果数据 - 使用正确的数据库字段结构
      const achievementData = {
        title: projectName,
        description: finalDescription,
        type_id: selectedType.id,
        cover_url: coverUrl,
        video_url: videoUrl,
        publisher_id: projectLeaderId || user.id, // 使用选中的项目负责人ID
        instructor_id: selectedInstructorId || user.id, // 使用选中的指导老师，如果没有选中则使用学生自己
        parents_id: selectedCollaboratorId || null, // 添加协作者ID
        status: 'pending' as const
      };

      let result;
      let achievementId: string;
      
      if (isEditMode) {
        // 更新成果
        result = await AchievementService.updateAchievement(editingAchievementId, achievementData);
        achievementId = editingAchievementId;
      } else {
        // 创建成果
        result = await AchievementService.createAchievement(achievementData);
        achievementId = result.data?.id || '';
      }
      
      if (result.success) {
        // 上传需求文档（如果有的话）
        if (documentFile && achievementId) {
          const attachmentResult = await AchievementService.uploadAndSaveAttachment(achievementId, documentFile);
          if (!attachmentResult.success) {
            console.warn('需求文档上传失败:', attachmentResult.message);
            // 不影响主要流程，但给出提示
            alert(`项目${isEditMode ? '更新' : '发布'}成功！但需求文档上传失败：${attachmentResult.message}`);
          } else {
            console.log('需求文档上传成功:', attachmentResult.data);
          }
        }
        
        // 显示自动消失的成功提示
        showSuccessToast(isEditMode ? '项目更新成功！' : '项目发布成功！');
        
        if (!isEditMode) {
          // 只在非编辑模式下重置表单
          setProjectName('');
          // 负责人保持为当前学生，不重置
          setProjectType('');
          setProjectDescription('');
          setCollaborators([]);
          setSelectedCollaboratorId('');
          setPhotos([]);
          setVideos([]);
          setDocumentFile(null);
          if (richTextEditorRef.current) {
            richTextEditorRef.current.innerHTML = '';
          }
        }
        
        // 跳转到成果列表页面
        navigate('/business-process');
      } else {
        alert(`发布失败: ${result.message}`);
      }
    } catch (error) {
      console.error('发布项目失败:', error);
      alert(`发布失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('获取用户信息失败:', error);
        return;
      }

      if (data) {
        setUserName(data.full_name || data.username || '用户');
      }
    } catch (error) {
      console.error('获取用户信息异常:', error);
    }
  };

  // 退出登录
  const handleLogout = () => {
    navigate('/login');
  };

  // 渲染协作者标签
  const renderCollaboratorTags = () => {
    return collaborators.map(collaborator => (
      <div key={collaborator.id} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
        <span>{collaborator.name}</span>
        <button 
          onClick={() => removeCollaborator(collaborator.id)}
          className="ml-2 text-text-muted hover:text-secondary"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    ));
  };

  // 渲染照片预览（只显示一张封面图片）
  const renderPhotoPreviews = () => {
    if (photos.length === 0) return null;
    
    const photo = photos[0]; // 只显示第一张图片
    return (
      <div key={photo.id} className="flex flex-col gap-2">
        <div className="relative">
          <img src={photo.url} className="w-full h-48 object-cover rounded-lg" alt="项目封面预览" />
          <button 
            onClick={() => removePhoto(photo.id)}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-text-muted hover:text-secondary"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  };

  // 渲染视频预览（只显示一个视频）
  const renderVideoPreviews = () => {
    if (videos.length === 0) return null;
    
    const video = videos[0]; // 只显示第一个视频
    return (
      <div key={video.id} className="relative mb-4">
        <video controls className="w-full rounded-lg" alt="项目视频预览">
          <source src={video.url} type={video.file.type} />
          您的浏览器不支持视频播放。
        </video>
        <button 
          onClick={() => removeVideo(video.id)}
          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-text-muted hover:text-secondary"
        >
          <i className="fas fa-times"></i>
        </button>
        {video.duration > 300 && (
          <div className="mt-2 text-xs text-red-500">
            <i className="fas fa-exclamation-circle mr-1"></i>视频时长超过5分钟，请上传更短的视频
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-bg-light border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* 左侧Logo区域 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">河北师范大学软件学院</h1>
                <p className="text-xs text-text-muted">软院项目通</p>
              </div>
            </div>
          </div>
          
          {/* 中间搜索区域 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索项目..." 
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <Link to="/personal-center" className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
              <img 
                src="https://s.coze.cn/image/JXMwnXlo9Gs/" 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">{userName}</span>
              <i className="fas fa-chevron-down text-xs text-text-muted"></i>
            </div>
          </Link>
        </div>
      </header>

      {/* 左侧导航栏 */}
      <aside id="sidebar" className={`fixed left-0 top-16 bottom-0 w-64 bg-bg-light border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-home text-lg"></i>
                <span className="font-medium">首页</span>
              </Link>
            </li>
            <li>
              <Link to="/project-intro" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
                <i className="fas fa-graduation-cap text-lg"></i>
                <span className="font-medium">成果发布</span>
              </Link>
            </li>
            <li>
              <Link to="/business-process" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-sitemap text-lg"></i>
                <span className="font-medium">成果管理</span>
              </Link>
            </li>
            <li>
              <Link to="/student-info" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-users text-lg"></i>
                <span className="font-medium">数据看板</span>
              </Link>
            </li>

            <li>
              <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500 w-full text-left">
                <i className="fas fa-sign-out-alt text-lg"></i>
                <span className="font-medium">退出登录</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区域 */}
      <main id="main-content" className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {isEditMode ? '编辑成果' : '学生端成果发布'}
              </h2>
              <nav className="text-sm text-text-muted">
                <Link to="/home" className="hover:text-orange-500">首页</Link>
                <span className="mx-2">/</span>
                <span className="text-text-primary">{isEditMode ? '编辑成果' : '成果发布'}</span>
              </nav>
            </div>
          </div>
        </div>
        
        {/* 项目编辑区域 */}
        <div className="bg-bg-light rounded-2xl shadow-card mb-8">
          {/* 编辑/预览切换标签 */}
          <div className="flex border-b border-border-light">
            <button 
              onClick={() => setActiveTab('edit')}
              className={`px-6 py-4 font-medium ${activeTab === 'edit' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-muted'}`}
            >
              编辑
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-4 font-medium ${activeTab === 'preview' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-muted'}`}
            >
              预览
            </button>
          </div>
          
          {/* 编辑区域 */}
          {activeTab === 'edit' && (
            <div className="p-6">
              {/* 第一行：项目名称、负责人、项目类型 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-text-secondary mb-2">项目名称</label>
                  <input 
                    type="text" 
                    id="project-name"
                    value={projectName}
                    onChange={(e) => {
                      console.log('🔄 项目名称输入:', e.target.value);
                      setProjectName(e.target.value);
                    }}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入项目名称"
                  />
                </div>
                <div>
                  <label htmlFor="project-leader" className="block text-sm font-medium text-text-secondary mb-2">项目负责人</label>
                  <input 
                    type="text" 
                    id="project-leader"
                    value={projectLeader || (user?.full_name || user?.username || '当前学生')}
                    readOnly
                    className="w-full px-4 py-3 border border-border-light rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="项目负责人"
                  />
                </div>
                <div>
                  <label htmlFor="project-type" className="block text-sm font-medium text-text-secondary mb-2">项目类型</label>
                  <select 
                    id="project-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus} ${styles.customSelect}`}
                  >
                    <option value="">请选择项目类型</option>
                    {achievementTypes.map(type => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* 第二行：协作者 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">协作者</label>
                <div className="flex space-x-2">
                  <select 
                    value={selectedCollaboratorId}
                    onChange={(e) => setSelectedCollaboratorId(e.target.value)}
                    className={`flex-1 px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus} ${styles.customSelect}`}
                  >
                    <option value="">请选择协作者</option>
                    {collaboratorUsers
                      .filter(user => user.id !== projectLeaderId) // 排除当前用户和项目负责人
                      .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={addCollaborator}
                    className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    disabled={!selectedCollaboratorId}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {renderCollaboratorTags()}
                </div>
              </div>

              {/* 第三行：指导老师 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">指导老师</label>
                <select 
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                  className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus} ${styles.customSelect}`}
                >
                  <option value="">请选择指导老师</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.full_name || instructor.username} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 第三行：富文本编辑窗口 */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-text-secondary">项目描述</label>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors">
                      <i className="fas fa-magic mr-1"></i>一键布局
                    </button>
                    <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors">
                      <i className="fas fa-wand-magic-sparkles mr-1"></i>一键润色
                    </button>
                  </div>
                </div>
                <div className="border border-border-light rounded-lg overflow-hidden">
                  {/* 富文本编辑器工具栏 */}
                  <div className="flex flex-wrap items-center p-2 bg-gray-50 border-b border-border-light">
                    <button 
                      onClick={() => handleEditorCommand('bold')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-bold"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('italic')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-italic"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('underline')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-underline"></i>
                    </button>
                    <div className="w-px h-6 bg-border-light mx-1"></div>
                    <button 
                      onClick={() => handleEditorCommand('insertUnorderedList')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-list-ul"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('insertOrderedList')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-list-ol"></i>
                    </button>
                    <div className="w-px h-6 bg-border-light mx-1"></div>
                    <button 
                      onClick={() => handleEditorCommand('justifyLeft')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-align-left"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('justifyCenter')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-align-center"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('justifyRight')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-align-right"></i>
                    </button>
                    <div className="w-px h-6 bg-border-light mx-1"></div>
                    <button 
                      onClick={() => {
                        // 插入换行符
                        if (richTextEditorRef.current) {
                          const selection = window.getSelection();
                          const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
                          if (range) {
                            range.deleteContents();
                            const br = document.createElement('br');
                            range.insertNode(br);
                            range.setStartAfter(br);
                            range.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          }
                        }
                      }}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                      title="插入换行"
                    >
                      <i className="fas fa-level-down-alt"></i>
                    </button>
                    <div className="w-px h-6 bg-border-light mx-1"></div>
                    <button 
                      onClick={() => handleEditorCommand('insertImage')}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                    <div className="w-px h-6 bg-border-light mx-1"></div>








                  </div>
              {/* 富文本编辑区域 */}
              <div 
                ref={richTextEditorRef}
                className="p-4 min-h-[300px] focus:outline-none"
                contentEditable="true"
                onInput={handleRichTextChange}
                suppressContentEditableWarning={true}
              ></div>

                  <input 
                    ref={imageInsertRef}
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>
              
              {/* 第四行：项目封面照片 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">项目封面照片</label>
                <div 
                  onClick={() => photoUploadRef.current?.click()}
                  className="border-2 border-dashed border-border-light rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <i className="fas fa-image text-4xl text-text-muted mb-3"></i>
                  <p className="text-sm text-text-muted">点击上传封面图片</p>
                  <p className="text-xs text-text-muted mt-1">支持 JPG、PNG 格式，建议尺寸 1200x675px，最大 5MB</p>
                  <input 
                    ref={photoUploadRef}
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png"
                    onChange={handlePhotoUpload}
                  />
                </div>
                {photos.length > 0 && (
                  <div className="mt-4">
                    {renderPhotoPreviews()}
                  </div>
                )}
              </div>
              
              {/* 第五行：项目演示视频 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">项目演示视频</label>
                <div 
                  onClick={() => videoUploadRef.current?.click()}
                  className="border-2 border-dashed border-border-light rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <i className="fas fa-video text-3xl text-text-muted mb-2"></i>
                  <p className="text-sm text-text-muted">点击上传演示视频</p>
                  <p className="text-xs text-text-muted mt-1">支持 MP4、WebM 格式，最大 100MB，时长不超过5分钟</p>
                  <input 
                    ref={videoUploadRef}
                    type="file" 
                    className="hidden" 
                    accept="video/mp4, video/webm"
                    onChange={handleVideoUpload}
                  />
                </div>
                {videos.length > 0 && (
                  <div className="mt-4">
                    {renderVideoPreviews()}
                  </div>
                )}
              </div>
              
              {/* 第六行：需求文档 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-secondary mb-2">需求文档</label>
                <div 
                  onClick={() => documentUploadRef.current?.click()}
                  className="border-2 border-dashed border-border-light rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <i className="fas fa-file-pdf text-4xl text-text-muted mb-3"></i>
                  <p className="text-sm text-text-muted">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-text-muted mt-1">支持 PDF 格式，最大 50MB</p>
                  <input 
                    ref={documentUploadRef}
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={handleDocumentUpload}
                  />
                </div>
                {documentFile && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center flex-1">
                        <i className="fas fa-file-pdf text-red-500 text-xl mr-3"></i>
                        {(documentFile.size > 0 || documentUrl) ? (
                          <a
                            href={documentUrl || (documentFile.size > 0 ? URL.createObjectURL(documentFile) : '#')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate max-w-[300px]"
                          >
                            {documentFile.name}
                          </a>
                        ) : (
                          <span className="text-sm text-text-primary truncate max-w-[300px]">{documentFile.name}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {(documentFile.size > 0 || documentUrl) && (
                          <a
                            href={documentUrl || (documentFile.size > 0 ? URL.createObjectURL(documentFile) : '#')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="在新窗口打开PDF"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        )}
                        <button 
                          onClick={clearDocument}
                          className="text-text-muted hover:text-orange-500"
                          title="删除文档"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 底部按钮 */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-border-light">
                <button 
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  存草稿
                </button>
                <button 
                  onClick={handleUploadProject}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (isEditMode ? '更新中...' : '发布中...') : (isEditMode ? '更新' : '发布')}
                </button>
              </div>
            </div>
          )}
          
          {/* 预览区域 */}
          {activeTab === 'preview' && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                {/* 预览头部 */}
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{projectName || '未命名项目'}</h1>
                  <div className="flex justify-center items-center space-x-4 text-sm text-text-muted">
                    <span>{projectType || '未分类'}</span>
                    <span>•</span>
                    <span>负责人：{projectLeader || '未指定负责人'}</span>
                  </div>
                </div>
                
                {/* 预览信息 */}
                <div className="mb-6">
                  {collaborators.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-text-secondary">协作者：</span>
                        <div className="inline-flex flex-wrap gap-2 mt-1">
                          {collaborators.map(c => (
                            <span key={c.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{c.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 预览内容 */}
                <div className="prose max-w-none text-text-secondary mb-8">
                  <div dangerouslySetInnerHTML={{ __html: projectDescription || '<p>暂无项目描述</p>' }} />
                </div>
                
                {/* 预览封面照片 */}
                {photos.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-text-primary mb-3">项目封面</h3>
                    <div className="flex flex-col gap-6">
                      <div>
                        <img src={photos[0].url} className="w-full h-64 object-cover rounded-lg" alt="项目封面" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 预览演示视频 */}
                {videos.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-text-primary mb-3">项目演示视频</h3>
                    <div className="space-y-4">
                      <div>
                        <video controls className="w-full rounded-lg" alt="项目视频预览">
                          <source src={videos[0].url} type={videos[0].file.type} />
                          您的浏览器不支持视频播放。
                        </video>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 预览文档 */}
                {documentFile && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-text-primary mb-3">需求文档</h3>
                    <div>
                      <div className="flex items-center">
                        <i className="fas fa-file-pdf text-red-500 text-xl mr-3"></i>
                        <span className="text-sm text-text-primary truncate max-w-[200px]">{documentFile.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* 全屏加载遮罩 - 仅在发布时显示 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center">
            <i className="fas fa-spinner fa-spin text-4xl text-secondary mb-4"></i>
            <p className="text-lg font-medium text-text-primary">
              {isEditMode ? '正在更新项目...' : '正在发布项目...'}
            </p>
            <p className="text-sm text-text-muted mt-2">请耐心等待，不要关闭页面</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectIntroPage;

