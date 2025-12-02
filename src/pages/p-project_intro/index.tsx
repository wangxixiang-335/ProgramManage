

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementService } from '../../lib/achievementService';
import { AchievementType, User } from '../../types/achievement';
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

const ProjectIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 页面标题设置
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 学生端成果发布';
    return () => { document.title = originalTitle; };
  }, []);
  
  // 加载成果类型和教师列表
  useEffect(() => {
    loadAchievementTypes();
    loadInstructors();
    loadCollaboratorUsers();
  }, []);
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');

  // Refs
  const richTextEditorRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);
  const videoUploadRef = useRef<HTMLInputElement>(null);
  const documentUploadRef = useRef<HTMLInputElement>(null);

  // 富文本编辑器命令
  const handleEditorCommand = (command: string) => {
    if (richTextEditorRef.current) {
      document.execCommand(command, false, null);
      richTextEditorRef.current.focus();
    }
  };

  // 处理富文本编辑器内容变化
  const handleRichTextChange = () => {
    if (richTextEditorRef.current) {
      setProjectDescription(richTextEditorRef.current.innerHTML);
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

  // 照片上传（只处理第一张图片）
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // 只取第一个文件
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          file,
          url: event.target?.result as string,
          description: ''
        };
        setPhotos([newPhoto]); // 替换现有照片，只保留一张
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

  // 视频上传（只处理第一个视频）
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // 只取第一个文件
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
    }
  };

  // 清除文档
  const clearDocument = () => {
    setDocumentFile(null);
    if (documentUploadRef.current) {
      documentUploadRef.current.value = '';
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!projectName || !projectLeader) {
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
      // 处理富文本中的图片
      let processedDescription = projectDescription;
      if (projectDescription) {
        const imageProcessResult = await AchievementService.processRichTextImages(projectDescription, user.id);
        if (imageProcessResult.success && imageProcessResult.processedContent) {
          processedDescription = imageProcessResult.processedContent;
        }
      }

      // 上传封面图片（草稿也保存封面）
      let coverUrl = '';
      if (photos.length > 0) {
        const coverPhoto = photos[0];
        const fileName = `cover_${Date.now()}_${coverPhoto.id}.jpg`;
        const filePath = `achievements/${user.id}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(coverPhoto.file, 'achievement-images', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
        } else {
          console.warn('封面图片上传失败:', uploadResult.message);
        }
      }

      // 上传演示视频（草稿也保存视频）
      let videoUrl = '';
      if (videos.length > 0) {
        const demoVideo = videos[0];
        const fileName = `video_${Date.now()}_${demoVideo.id}.mp4`;
        const filePath = `achievements/${user.id}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(demoVideo.file, 'achievement-videos', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          console.warn('演示视频上传失败:', uploadResult.message);
        }
      }

      // 处理协作者信息 - 将协作者信息添加到项目描述中
      let finalDescription = processedDescription || '暂无项目描述';
      if (collaborators.length > 0) {
        const collaboratorsText = collaborators.map(c => c.name).join(', ');
        finalDescription = `<p><strong>项目成员：</strong>${projectLeader}（负责人）`;
        if (collaboratorsText) {
          finalDescription += `、${collaboratorsText}`;
        }
        finalDescription += '</p>' + finalDescription;
      }

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
        publisher_id: user.id,
        instructor_id: selectedInstructorId || user.id // 使用选中的指导老师，如果没有选中则使用学生自己
      };

      // 保存草稿
      const result = await AchievementService.saveDraft(draftData);
      
      if (result.success) {
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
    if (!projectName || !projectLeader) {
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
      // 处理富文本中的图片
      let processedDescription = projectDescription;
      if (projectDescription) {
        const imageProcessResult = await AchievementService.processRichTextImages(projectDescription, user.id);
        if (imageProcessResult.success && imageProcessResult.processedContent) {
          processedDescription = imageProcessResult.processedContent;
        }
      }

      // 上传封面图片（只使用第一张照片作为封面）
      let coverUrl = '';
      if (photos.length > 0) {
        const coverPhoto = photos[0];
        const fileName = `cover_${Date.now()}_${coverPhoto.id}.jpg`;
        const filePath = `achievements/${user.id}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(coverPhoto.file, 'achievement-images', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
        } else {
          console.warn('封面图片上传失败:', uploadResult.message);
        }
      }

      // 上传演示视频（只使用第一个视频）
      let videoUrl = '';
      if (videos.length > 0) {
        const demoVideo = videos[0];
        const fileName = `video_${Date.now()}_${demoVideo.id}.mp4`;
        const filePath = `achievements/${user.id}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(demoVideo.file, 'achievement-videos', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          console.warn('演示视频上传失败:', uploadResult.message);
        }
      }

      // 处理协作者信息 - 将协作者信息添加到项目描述中
      let finalDescription = processedDescription || '暂无项目描述';
      if (collaborators.length > 0) {
        const collaboratorsText = collaborators.map(c => c.name).join(', ');
        finalDescription = `<p><strong>项目成员：</strong>${projectLeader}（负责人）`;
        if (collaboratorsText) {
          finalDescription += `、${collaboratorsText}`;
        }
        finalDescription += '</p>' + finalDescription;
      }

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
        publisher_id: user.id,
        instructor_id: selectedInstructorId || user.id, // 使用选中的指导老师，如果没有选中则使用学生自己
        status: 'pending' as const
      };

      // 创建成果
      const result = await AchievementService.createAchievement(achievementData);
      
      if (result.success) {
        alert('项目发布成功！');
        
        // 重置表单
        setProjectName('');
        setProjectLeader('');
        setProjectType('');
        setProjectDescription('');
        setCollaborators([]);
        setPhotos([]);
        setVideos([]);
        setDocumentFile(null);
        if (richTextEditorRef.current) {
          richTextEditorRef.current.innerHTML = '';
        }
        
        // 可以跳转到成果列表页面
        // navigate('/business-process');
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
              <span className="text-sm font-medium text-text-primary">{user?.username || '用户'}</span>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">学生端成果发布</h2>
              <nav className="text-sm text-text-muted">
                <Link to="/home" className="hover:text-orange-500">首页</Link>
                <span className="mx-2">/</span>
                <span className="text-text-primary">成果发布</span>
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
                    onChange={(e) => setProjectName(e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入项目名称"
                  />
                </div>
                <div>
                  <label htmlFor="project-leader" className="block text-sm font-medium text-text-secondary mb-2">项目负责人</label>
                  <input 
                    type="text" 
                    id="project-leader"
                    value={projectLeader}
                    onChange={(e) => setProjectLeader(e.target.value)}
                    className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入项目负责人"
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
                    {collaboratorUsers.map(user => (
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
                      onClick={() => photoUploadRef.current?.click()}
                      className="p-2 text-text-secondary hover:bg-gray-200 rounded"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                  </div>
                  {/* 富文本编辑区域 */}
                  <div 
                    ref={richTextEditorRef}
                    className="p-4 min-h-[300px] focus:outline-none"
                    contentEditable="true"
                    onInput={handleRichTextChange}
                    suppressContentEditableWarning={true}
                  ></div>
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
                      <div className="flex items-center">
                        <i className="fas fa-file-pdf text-red-500 text-xl mr-3"></i>
                        <span className="text-sm text-text-primary truncate max-w-[200px]">{documentFile.name}</span>
                      </div>
                      <button 
                        onClick={clearDocument}
                        className="text-text-muted hover:text-orange-500"
                      >
                        <i className="fas fa-times"></i>
                      </button>
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
                  {isSubmitting ? '发布中...' : '发布'}
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
    </div>
  );
};

export default ProjectIntroPage;

