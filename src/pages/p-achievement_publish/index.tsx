

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { RichTextEditor } from '../../lib/richTextEditor';
import { ACHIEVEMENT_TYPES, AchievementType, User } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import { useApproval } from '../../contexts/ApprovalContext';
import styles from './styles.module.css';

interface FileUpload {
  file: File;
  id: string;
}

interface FormData {
  title: string;
  type: string;
  coverImage: File | null;
  partners: string[];
  instructors: string[];
  content: string;
  demoVideo: File | null;
  attachments: FileUpload[];
  typeId: string; // 新增：成果类型ID
  instructorId: string; // 新增：指导老师ID
  parentsId: string; // 新增：父级成果ID（其他学生）
}

// 新增接口定义
interface UserSelectModalProps {
  isOpen: boolean;
  users: User[];
  title: string;
  selectedUserId: string;
  onSelect: (userId: string) => void;
  onClose: () => void;
}

// 用户选择模态框组件
const UserSelectModal: React.FC<UserSelectModalProps> = ({
  isOpen,
  users,
  title,
  selectedUserId,
  onSelect,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
        <div className="space-y-2 mb-6">
          {users.map(user => (
            <div key={user.id} className="flex items-center">
              <input 
                type="radio" 
                id={user.id}
                name="user-select"
                checked={selectedUserId === user.id}
                onChange={() => onSelect(user.id)}
                className="w-4 h-4 text-secondary focus:ring-secondary border-border-light rounded"
              />
              <label htmlFor={user.id} className="ml-2 text-text-primary flex-1">
                {user.full_name || user.username} ({user.email})
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-all"
          >
            取消
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};

const AchievementPublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingCount } = useApproval();
  const [currentUser, setCurrentUser] = useState(user);
  
  // 获取当前用户ID
  const currentUserId = user?.id || '';
  
  // 页面状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showSelectApproverModal, setShowSelectApproverModal] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  
  // 数据状态
  const [isLoading, setIsLoading] = useState(false);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>(ACHIEVEMENT_TYPES);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  // 用户选择模态框状态
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // 加载当前用户信息
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUserId = String(user?.id || '');
        if (currentUserId) {
          const userResult = await AchievementService.getCurrentUser(currentUserId);
          if (userResult.success && userResult.data) {
            setCurrentUser(userResult.data);
          }
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
      }
    };

    loadCurrentUser();
  }, [user]);

  // 加载数据
  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    setIsLoading(true);
    
    try {
      // 加载成果类型
      const typesResult = await AchievementService.getAchievementTypes();
      if (typesResult.success && typesResult.data) {
        setAchievementTypes(typesResult.data);
      }
      
      // 加载教师列表（role=2）
      const instructorsResult = await AchievementService.getUsersByRole(2);
      if (instructorsResult.success && instructorsResult.data) {
        setInstructors(instructorsResult.data);
      }
      
      // 加载其他学生列表（role=1，排除当前用户）
      const studentsResult = await AchievementService.getStudentsExceptCurrent(currentUserId);
      if (studentsResult.success && studentsResult.data) {
        setStudents(studentsResult.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: '',
    coverImage: null,
    partners: [''],
    instructors: ['张教授'],
    content: '',
    demoVideo: null,
    attachments: [],
    typeId: '',
    instructorId: '',
    parentsId: ''
  });
  
  // 文件输入引用
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果发布';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);
  
  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // 标签切换
  const handleTabSwitch = (tab: 'edit' | 'preview') => {
    setActiveTab(tab);
  };
  
  // 表单字段更新
  const handleFormFieldChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 成果类型变更
  const handleTypeChange = (typeId: string) => {
    const selectedType = achievementTypes.find(t => t.id === typeId);
    const typeName = selectedType ? selectedType.name : '';
    
    setFormData(prev => ({
      ...prev,
      typeId,
      type: typeName
    }));
  };
  
  // 指导老师选择
  const handleInstructorSelect = (instructorId: string) => {
    const instructor = instructors.find(u => u.id === instructorId);
    setFormData(prev => ({
      ...prev,
      instructorId,
      instructors: instructor ? [instructor.username] : ['']
    }));
  };
  
  // 其他学生选择
  const handleStudentSelect = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      parentsId: studentId
    }));
  };
  
  // 合作伙伴输入更新
  const handlePartnerChange = (index: number, value: string) => {
    const newPartners = [...formData.partners];
    newPartners[index] = value;
    setFormData(prev => ({ ...prev, partners: newPartners }));
  };
  
  // 添加合作伙伴
  const handleAddPartner = () => {
    setFormData(prev => ({
      ...prev,
      partners: [...prev.partners, '']
    }));
  };
  
  // 指导老师输入更新
  const handleInstructorChange = (index: number, value: string) => {
    const newInstructors = [...formData.instructors];
    newInstructors[index] = value;
    setFormData(prev => ({ ...prev, instructors: newInstructors }));
  };
  
  // 添加指导老师
  const handleAddInstructor = () => {
    setFormData(prev => ({
      ...prev,
      instructors: [...prev.instructors, '']
    }));
  };
  
  // 富文本内容更新
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setFormData(prev => ({ ...prev, content: target.innerHTML }));
  };
  
  // 富文本编辑器工具栏操作
  const handleEditorCommand = (command: string, _value?: string) => {
    switch (command) {
      case 'bold':
        RichTextEditor.bold();
        break;
      case 'italic':
        RichTextEditor.italic();
        break;
      case 'underline':
        RichTextEditor.underline();
        break;
      case 'heading':
        RichTextEditor.insertHeading(2);
        break;
      case 'paragraph':
        RichTextEditor.insertParagraph();
        break;
      case 'link':
        const url = prompt('请输入链接地址:', 'https://');
        if (url) {
          RichTextEditor.insertLink(url);
        }
        break;
      case 'image':
        // 触发图片文件选择
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file && contentEditableRef.current) {
            RichTextEditor.insertImage(file, contentEditableRef.current);
          }
        };
        imageInput.click();
        break;
      default:
        break;
    }
  };
  
  // 封面图上传
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFormFieldChange('coverImage', e.target.files[0]);
    }
  };
  
  // 视频上传
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFormFieldChange('demoVideo', e.target.files[0]);
    }
  };
  
  // 附件上传
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const remainingSlots = 5 - formData.attachments.length;
      const filesToAdd = Math.min(e.target.files.length, remainingSlots);
      
      const newAttachments: FileUpload[] = [];
      for (let i = 0; i < filesToAdd; i++) {
        const file = e.target.files[i];
        newAttachments.push({
          file,
          id: Math.random().toString(36).substr(2, 9)
        });
      }
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
      
      if (e.target.files.length > remainingSlots) {
        alert(`已达到附件数量上限，仅添加了${remainingSlots}个附件`);
      }
    }
  };
  
  // 移除附件
  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };
  
  // 存草稿
  const handleSaveDraft = async () => {
    setShowSaveDraftModal(false);
    
    if (!formData.title) {
      alert('请输入成果标题');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 处理封面图上传
      let coverUrl = '';
      if (formData.coverImage) {
        const fileName = `cover_${Date.now()}.${formData.coverImage.name.split('.').pop()}`;
        const filePath = `achievements/${currentUserId}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(formData.coverImage, 'achievement-images', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
        } else {
          // 显示详细错误信息
          const userChoice = confirm(`封面图上传失败！\n\n${uploadResult.message}\n\n是否仍要保存草稿（将不包含封面图）？`);
          if (!userChoice) {
            throw new Error('用户取消了草稿保存');
          }
          coverUrl = ''; // 设为空字符串，不包含封面图
        }
      }
      
      // 处理富文本中的图片
      let processedContent = formData.content;
      const imageResult = await AchievementService.processRichTextImages(formData.content, currentUserId);
      if (imageResult.success && imageResult.processedContent) {
        processedContent = imageResult.processedContent;
      } else if (imageResult.message) {
        console.warn('富文本图片处理失败:', imageResult.message);
        // 富文本图片处理失败不阻止成果发布，但显示警告
        alert(`部分图片上传失败，但成果仍会发布\n\n${imageResult.message}`);
      }
      
      // 保存草稿数据
      const draftData = {
        title: formData.title,
        description: processedContent,
        type_id: formData.typeId || ACHIEVEMENT_TYPES[0].id, // 默认第一个类型
        cover_url: coverUrl,
        video_url: '', // 暂时不处理视频
        publisher_id: currentUserId,
        instructor_id: formData.instructorId || instructors[0]?.id || '',
        parents_id: formData.parentsId || null
      };
      
      const result = await AchievementService.saveDraft(draftData);
      
      // 上传附件到草稿（如果有）
      if (result.success && result.data && formData.attachments.length > 0) {
        console.log('📎 草稿开始上传附件，数量:', formData.attachments.length);
        let uploadSuccessCount = 0;
        let uploadErrorMessages = [];
        
        for (const attachment of formData.attachments) {
          console.log('📎 草稿上传附件:', attachment.file.name);
          const attachmentResult = await AchievementService.uploadAndSaveAttachment(result.data.id, attachment.file);
          
          if (attachmentResult.success) {
            console.log('✅ 草稿附件上传成功:', attachment.file.name);
            uploadSuccessCount++;
          } else {
            console.error('❌ 草稿附件上传失败:', attachment.file.name, attachmentResult.message);
            uploadErrorMessages.push(`${attachment.file.name}: ${attachmentResult.message}`);
          }
        }
        
        if (uploadSuccessCount > 0) {
          console.log(`📎 草稿附件上传完成，成功: ${uploadSuccessCount}/${formData.attachments.length}`);
        }
        
        if (uploadErrorMessages.length > 0) {
          const errorMessage = `有 ${uploadErrorMessages.length} 个附件上传失败:\n\n${uploadErrorMessages.join('\n\n')}\n\n草稿已保存，但部分附件未上传成功`;
          alert(errorMessage);
        }
      }
      
      if (result.success) {
        alert('草稿保存成功！');
        // 可以跳转到成果管理页面
        // navigate('/achievement-management');
      } else {
        alert(result.message || '草稿保存失败');
      }
      
    } catch (error) {
      console.error('Save draft error:', error);
      alert('草稿保存失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 发布成果
  const handlePublish = () => {
    // 检查必填项
    if (!formData.title) {
      alert('请输入成果标题');
      return;
    }
    
    if (!formData.typeId) {
      alert('请选择成果类型');
      return;
    }
    
    if (!formData.coverImage) {
      alert('请上传封面图');
      return;
    }
    
    // 教师发布不需要选择指导教师，直接发布
    if (user?.role === 2) { // 教师
      handleConfirmPublish();
    } else { // 学生
      if (!formData.instructorId) {
        alert('请选择指导老师');
        return;
      }
      setShowSelectApproverModal(true);
    }
  };
  
  // 确认发布
  const handleConfirmPublish = async () => {
    // 教师直接发布，不需要审批人
    if (user?.role === 1 && selectedApprovers.length === 0) { // 学生
      alert('请至少选择一位审批人');
      return;
    }
    
    setShowSelectApproverModal(false);
    setIsLoading(true);
    
    try {
      // 处理封面图上传
      let coverUrl = '';
      if (formData.coverImage) {
        const fileName = `cover_${Date.now()}.${formData.coverImage.name.split('.').pop()}`;
        const filePath = `achievements/${currentUserId}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(formData.coverImage, 'achievement-images', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
        } else {
          // 显示详细错误信息
          const userChoice = confirm(`封面图上传失败！\n\n${uploadResult.message}\n\n是否仍要保存草稿（将不包含封面图）？`);
          if (!userChoice) {
            throw new Error('用户取消了草稿保存');
          }
          coverUrl = ''; // 设为空字符串，不包含封面图
        }
      }
      
      // 处理视频上传
      let videoUrl = '';
      if (formData.demoVideo) {
        const fileName = `video_${Date.now()}.${formData.demoVideo.name.split('.').pop()}`;
        const filePath = `achievements/${currentUserId}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(formData.demoVideo, 'achievement-videos', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          console.warn('视频上传失败:', uploadResult.message);
          // 视频上传失败不阻止成果发布，但记录警告
          alert(`视频上传失败，但成果仍会发布\n\n${uploadResult.message}`);
        }
      }
      
      // 处理富文本中的图片
      let processedContent = formData.content;
      const imageResult = await AchievementService.processRichTextImages(formData.content, currentUserId);
      if (imageResult.success && imageResult.processedContent) {
        processedContent = imageResult.processedContent;
      } else if (imageResult.message) {
        console.warn('富文本图片处理失败:', imageResult.message);
        // 富文本图片处理失败不阻止成果发布，但显示警告
        alert(`部分图片上传失败，但成果仍会发布\n\n${imageResult.message}`);
      }
      
      // 创建成果数据
      const achievementData = {
        title: formData.title,
        description: processedContent,
        type_id: formData.typeId,
        cover_url: coverUrl,
        video_url: videoUrl,
        publisher_id: currentUserId,
        instructor_id: user?.role === 2 ? currentUserId : formData.instructorId, // 教师自己是指导教师
        parents_id: formData.parentsId || null
      };
      
      // 教师直接发布，学生需要审批
      const directPublish = user?.role === 2; // 教师直接发布
      const result = await AchievementService.createAchievement(achievementData, directPublish);
      
      // 上传附件（如果有）
      if (result.success && result.data && formData.attachments.length > 0) {
        console.log('📎 开始上传附件，数量:', formData.attachments.length);
        let uploadSuccessCount = 0;
        let uploadErrorMessages = [];
        
        for (const attachment of formData.attachments) {
          console.log('📎 上传附件:', attachment.file.name);
          const attachmentResult = await AchievementService.uploadAndSaveAttachment(result.data.id, attachment.file);
          
          if (attachmentResult.success) {
            console.log('✅ 附件上传成功:', attachment.file.name);
            uploadSuccessCount++;
          } else {
            console.error('❌ 附件上传失败:', attachment.file.name, attachmentResult.message);
            uploadErrorMessages.push(`${attachment.file.name}: ${attachmentResult.message}`);
          }
        }
        
        if (uploadSuccessCount > 0) {
          console.log(`📎 附件上传完成，成功: ${uploadSuccessCount}/${formData.attachments.length}`);
        }
        
        if (uploadErrorMessages.length > 0) {
          const errorMessage = `有 ${uploadErrorMessages.length} 个附件上传失败:\n\n${uploadErrorMessages.join('\n\n')}\n\n成果已发布，但部分附件未上传成功`;
          alert(errorMessage);
        }
      }
      
      if (result.success) {
        alert('成果发布成功！');
        navigate('/achievement-management'); // 跳转到成果管理页面
      } else {
        alert(result.message || '成果发布失败');
      }
      
    } catch (error) {
      console.error('Publish achievement error:', error);
      alert('成果发布失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // AI功能
  const handleAiPolish = () => {
    alert('AI一键润色功能开发中...');
  };
  
  const handleAiLayout = () => {
    alert('AI一键布局功能开发中...');
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 获取文件图标
  const getFileIcon = (file: File): string => {
    if (file.type.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (file.type.includes('word') || file.type.includes('doc')) return 'fa-file-word text-blue-500';
    if (file.type.includes('excel') || file.type.includes('xls')) return 'fa-file-excel text-green-500';
    if (file.type.includes('powerpoint') || file.type.includes('ppt')) return 'fa-file-powerpoint text-orange-500';
    if (file.type.includes('image')) return 'fa-file-image text-purple-500';
    return 'fa-file';
  };
  
  // 获取当前日期
  const getCurrentDate = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('zh-CN', options);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <aside 
          className={`w-64 bg-white shadow-sidebar flex-shrink-0 ${
            isMobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden md:block'
          }`}
        >
          {/* 学院Logo */}
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">河北师范大学</h1>
                <p className="text-xs text-text-muted">软件学院</p>
              </div>
            </div>
          </div>
          
          {/* 导航菜单 */}
          <nav className="py-4">
            <ul>
              <li>
                <Link 
                  to="/teacher-home" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-chart-line w-6 text-center"></i>
                  <span className="ml-3">数据看板</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-approval" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-tasks w-6 text-center"></i>
                  <span className="ml-3">成果审批</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{pendingCount}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-publish" 
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                >
                  <i className="fas fa-paper-plane w-6 text-center"></i>
                  <span className="ml-3 font-medium">成果发布</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-management" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3">成果管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-view" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-eye w-6 text-center"></i>
                  <span className="ml-3">成果查看</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-sign-out-alt w-6 text-center"></i>
                  <span className="ml-3">退出登录</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto bg-bg-gray">
          {/* 顶部导航栏 */}
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
              {/* 移动端菜单按钮 */}
              <button 
                onClick={handleMobileMenuToggle}
                className="md:hidden text-text-primary"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              
              {/* 页面标题 */}
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果发布</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/Iy4-k7r4TIc/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{user?.full_name || '教师'}</p>
                    <p className="text-xs text-text-muted">计算机科学与技术系</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* 内容区域 */}
          <div className="p-6">
            {/* 页面状态切换 */}
            <div className="flex border-b border-border-light mb-6">
              <button 
                onClick={() => handleTabSwitch('edit')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'edit' ? styles.tabActive : 'text-text-secondary'
                }`}
              >
                编辑
              </button>
              <button 
                onClick={() => handleTabSwitch('preview')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'preview' ? styles.tabActive : 'text-text-secondary'
                }`}
              >
                预览
              </button>
            </div>
            
            {/* 编辑区域 */}
            {activeTab === 'edit' && (
              <div className="space-y-6">
                {/* 第一行：标题、成果类型、封面图 */}
                <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`}>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">基本信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label htmlFor="achievement-title" className="block text-sm font-medium text-text-secondary mb-1">
                          成果标题 <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          id="achievement-title"
                          value={formData.title}
                          onChange={(e) => handleFormFieldChange('title', e.target.value)}
                          className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                          placeholder="请输入成果标题"
                        />
                      </div>
                      <div>
                        <label htmlFor="achievement-type" className="block text-sm font-medium text-text-secondary mb-1">
                          成果类型 <span className="text-red-500">*</span>
                        </label>
                        <select 
                          id="achievement-type"
                          value={formData.typeId}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className={`w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${styles.customSelect}`}
                        >
                          <option value="">请选择成果类型</option>
                          {achievementTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        封面图 <span className="text-red-500">*</span>
                      </label>
                      <div 
                        onClick={() => coverImageInputRef.current?.click()}
                        className={`${styles.fileUploadArea} w-full h-40 rounded-lg flex flex-col items-center justify-center cursor-pointer`}
                      >
                        {formData.coverImage ? (
                          <img 
                            src={URL.createObjectURL(formData.coverImage)} 
                            alt="封面图" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt text-3xl text-text-muted mb-2"></i>
                            <p className="text-sm text-text-muted">点击上传封面图</p>
                            <p className="text-xs text-text-muted mt-1">支持JPG、PNG格式，建议尺寸1200×675</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={coverImageInputRef}
                          onChange={handleCoverImageUpload}
                          className="hidden" 
                          accept="image/jpeg,image/png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 第二行：合作伙伴、指导老师 */}
                <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.1s'}}>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">参与人员</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">合作伙伴</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="text" 
                            value={students.find(s => s.id === formData.parentsId)?.username || ''}
                            readOnly
                            className="flex-1 px-4 py-2 border border-border-light rounded-lg bg-bg-gray text-text-muted transition-all" 
                            placeholder="可选：从学生列表中选择合作伙伴"
                          />
                          <button 
                            onClick={() => setShowStudentModal(true)}
                            className="ml-2 px-3 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
                          >
                            <i className="fas fa-search"></i>
                          </button>
                        </div>
                        {formData.partners.map((partner, index) => (
                          <div key={index} className="flex items-center">
                            <input 
                              type="text" 
                              value={partner}
                              onChange={(e) => handlePartnerChange(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                              placeholder="输入合作伙伴姓名"
                            />
                            <button 
                              onClick={handleAddPartner}
                              className="ml-2 text-text-muted hover:text-secondary"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* 只有学生发布成果时才显示指导老师选择 */}
                    {user?.role !== 2 && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">指导老师</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="text" 
                              value={formData.instructors[0] || ''}
                              readOnly
                              className="flex-1 px-4 py-2 border border-border-light rounded-lg bg-bg-gray text-text-muted transition-all" 
                              placeholder="请从教师列表中选择"
                            />
                            <button 
                              onClick={() => setShowInstructorModal(true)}
                              className="ml-2 px-3 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
                            >
                              <i className="fas fa-search"></i>
                            </button>
                          </div>
                          {formData.instructors.slice(1).map((instructor, index) => (
                            <div key={index + 1} className="flex items-center">
                              <input 
                                type="text" 
                                value={instructor}
                                onChange={(e) => handleInstructorChange(index + 1, e.target.value)}
                                className="flex-1 px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                                placeholder="输入指导老师姓名"
                              />
                              <button 
                                onClick={handleAddInstructor}
                                className="ml-2 text-text-muted hover:text-secondary"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 第三行：富文本编辑窗口 */}
                <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">成果内容</h3>
                  {/* 工具栏 */}
                  <div className={`${styles.editorToolbar} flex flex-wrap items-center p-2 mb-2`}>
                    <button 
                      onClick={() => handleEditorCommand('bold')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="加粗"
                    >
                      <i className="fas fa-bold"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('italic')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="斜体"
                    >
                      <i className="fas fa-italic"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('underline')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="下划线"
                    >
                      <i className="fas fa-underline"></i>
                    </button>
                    <div className="h-6 w-px bg-border-light mx-1"></div>
                    <button 
                      onClick={() => handleEditorCommand('heading')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="标题"
                    >
                      <i className="fas fa-heading"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('paragraph')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="段落"
                    >
                      <i className="fas fa-paragraph"></i>
                    </button>
                    <div className="h-6 w-px bg-border-light mx-1"></div>
                    <button 
                      onClick={() => handleEditorCommand('image')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="插入图片"
                    >
                      <i className="fas fa-image"></i>
                    </button>
                    <button 
                      onClick={() => handleEditorCommand('link')}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="插入链接"
                    >
                      <i className="fas fa-link"></i>
                    </button>
                    <div className="h-6 w-px bg-border-light mx-1"></div>
                    <button 
                      onClick={handleAiPolish}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="AI一键润色"
                    >
                      <i className="fas fa-magic text-secondary"></i>
                    </button>
                    <button 
                      onClick={handleAiLayout}
                      className="p-2 rounded hover:bg-bg-gray" 
                      title="AI一键布局"
                    >
                      <i className="fas fa-th-large text-secondary"></i>
                    </button>
                  </div>
                  {/* 编辑区域 */}
                  <div 
                    ref={contentEditableRef}
                    onInput={handleContentChange}
                    className="min-h-[300px] p-4 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                    contentEditable="true" 
                    suppressContentEditableWarning={true}
                  />
                </div>
                
                {/* 第四行：成果演示视频 */}
                <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.3s'}}>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">成果演示</h3>
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className={`${styles.fileUploadArea} w-full h-60 rounded-lg flex flex-col items-center justify-center cursor-pointer`}
                  >
                    {formData.demoVideo ? (
                      <>
                        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                          <i className="fas fa-play-circle text-white text-5xl"></i>
                        </div>
                        <p className="text-xs text-text-muted mt-2">{formData.demoVideo.name}</p>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-video text-4xl text-text-muted mb-2"></i>
                        <p className="text-sm text-text-muted">点击上传演示视频</p>
                        <p className="text-xs text-text-muted mt-1">支持MP4、MOV格式，时长不超过5分钟，大小不超过200MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      className="hidden" 
                      accept="video/mp4,video/quicktime"
                    />
                  </div>
                </div>
                
                {/* 第五行：附件提交 */}
                <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.4s'}}>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">附件提交</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 附件上传按钮 */}
                    <div 
                      onClick={() => {
                        if (formData.attachments.length < 5) {
                          attachmentInputRef.current?.click();
                        } else {
                          alert('最多只能上传5个附件');
                        }
                      }}
                      className={`${styles.fileUploadArea} h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer`}
                    >
                      <i className="fas fa-plus text-xl text-text-muted"></i>
                      <p className="text-xs text-text-muted mt-1">添加附件</p>
                      <input 
                        type="file" 
                        ref={attachmentInputRef}
                        onChange={handleAttachmentUpload}
                        className="hidden" 
                        multiple
                      />
                    </div>
                    {/* 附件列表 */}
                    {formData.attachments.map((attachment) => (
                      <div 
                        key={attachment.id}
                        className={`${styles.fileItem} h-24 rounded-lg flex flex-col items-center justify-center p-2 relative`}
                      >
                        <i className={`fas ${getFileIcon(attachment.file)} text-xl mb-1`}></i>
                        <p className="text-xs text-text-primary text-center truncate w-full">{attachment.file.name}</p>
                        <p className="text-xs text-text-muted">{formatFileSize(attachment.file.size)}</p>
                        <button 
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="absolute top-2 right-2 text-text-muted hover:text-red-500"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">最多可上传5个附件，单个附件大小不超过50MB</p>
                </div>
                
                {/* 底部操作按钮 */}
                <div className={`flex justify-end space-x-4 ${styles.fadeIn}`} style={{animationDelay: '0.5s'}}>
                  <button 
                    onClick={() => setShowSaveDraftModal(true)}
                    className="px-6 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-all"
                  >
                    存草稿
                  </button>
                  <button 
                    onClick={handlePublish}
                    className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
                  >
                    发布
                  </button>
                </div>
              </div>
            )}
            
            {/* 预览区域 */}
            {activeTab === 'preview' && (
              <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`}>
                <div className="border-b border-border-light pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-text-primary">
                    {formData.title || '成果标题预览'}
                  </h1>
                  <div className="flex items-center mt-2 text-sm text-text-muted">
                    <span>
                      {formData.type 
                        ? (formData.type === 'project' ? '项目报告' : 
                           formData.type === 'paper' ? '论文' :
                           formData.type === 'software' ? '软件作品' :
                           formData.type === 'experiment' ? '实验报告' : '其他')
                        : '项目报告'
                      }
                    </span>
                    <span className="mx-2">|</span>
                    <span>{getCurrentDate()}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <img 
                    src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : 'https://s.coze.cn/image/Iy0dUYdJOE0/'} 
                    alt="成果封面图" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">参与人员</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.instructors.filter(inst => inst.trim()).map((instructor, index) => (
                      <span key={index} className="px-3 py-1 bg-bg-gray rounded-full text-sm text-text-secondary">
                        {instructor}（指导老师）
                      </span>
                    ))}
                    {formData.partners.filter(partner => partner.trim()).map((partner, index) => (
                      <span key={index} className="px-3 py-1 bg-bg-gray rounded-full text-sm text-text-secondary">
                        {partner}（合作伙伴）
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="prose max-w-none mb-6">
                  {formData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                  ) : (
                    <p>成果内容预览将在这里显示...</p>
                  )}
                </div>
                
                <div className="mt-6 mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">成果演示</h3>
                  <div className="aspect-w-16 aspect-h-9 bg-bg-gray rounded-lg flex items-center justify-center">
                    <i className="fas fa-play-circle text-4xl text-text-muted"></i>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">附件</h3>
                  <div className="space-y-2">
                    {formData.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center p-2 bg-bg-gray rounded-lg">
                        <i className={`fas ${getFileIcon(attachment.file)} mr-3`}></i>
                        <span className="text-sm text-text-primary flex-1">{attachment.file.name}</span>
                        <span className="text-xs text-text-muted">{formatFileSize(attachment.file.size)}</span>
                      </div>
                    ))}
                    {formData.attachments.length === 0 && (
                      <div className="flex items-center p-2 bg-bg-gray rounded-lg">
                        <i className="fas fa-file-pdf text-red-500 mr-3"></i>
                        <span className="text-sm text-text-primary flex-1">项目报告.pdf</span>
                        <span className="text-xs text-text-muted">2.5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* 存草稿确认弹窗 */}
      {showSaveDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">确认保存草稿？</h3>
            <p className="text-text-secondary mb-6">草稿将保存在"成果管理-草稿箱"中，您可以随时继续编辑。</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowSaveDraftModal(false)}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-all"
              >
                取消
              </button>
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 选择审批人弹窗 - 只有学生发布时才显示 */}
      {showSelectApproverModal && user?.role !== 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">选择审批人</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="approver-1"
                  checked={selectedApprovers.includes('approver-1')}
                  onChange={(e) => setSelectedApprovers(prev => 
                    e.target.checked ? [...prev, 'approver-1'] : prev.filter(id => id !== 'approver-1')
                  )}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-border-light rounded"
                />
                <label htmlFor="approver-1" className="ml-2 text-text-primary">王院长（软件学院）</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="approver-2"
                  checked={selectedApprovers.includes('approver-2')}
                  onChange={(e) => setSelectedApprovers(prev => 
                    e.target.checked ? [...prev, 'approver-2'] : prev.filter(id => id !== 'approver-2')
                  )}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-border-light rounded"
                />
                <label htmlFor="approver-2" className="ml-2 text-text-primary">李主任（计算机科学与技术系）</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="approver-3"
                  checked={selectedApprovers.includes('approver-3')}
                  onChange={(e) => setSelectedApprovers(prev => 
                    e.target.checked ? [...prev, 'approver-3'] : prev.filter(id => id !== 'approver-3')
                  )}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-border-light rounded"
                />
                <label htmlFor="approver-3" className="ml-2 text-text-primary">赵教授（软件工程系）</label>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowSelectApproverModal(false)}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-all"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmPublish}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all"
              >
                确认发布
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 用户选择模态框 */}
      <UserSelectModal
        isOpen={showInstructorModal}
        users={instructors}
        title="选择指导老师"
        selectedUserId={formData.instructorId}
        onSelect={handleInstructorSelect}
        onClose={() => setShowInstructorModal(false)}
      />
      
      <UserSelectModal
        isOpen={showStudentModal}
        users={students}
        title="选择合作伙伴（其他学生）"
        selectedUserId={formData.parentsId}
        onSelect={handleStudentSelect}
        onClose={() => setShowStudentModal(false)}
      />
    </div>
  );
};

export default AchievementPublishPage;

