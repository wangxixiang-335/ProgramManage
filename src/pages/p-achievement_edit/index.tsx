import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { RichTextEditor } from '../../lib/richTextEditor';
import { ACHIEVEMENT_TYPES, AchievementType, User, Achievement } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface FileUpload {
  file: File;
  id: string;
}

interface FormData {
  title: string;
  type: string;
  coverImage: File | null;
  coverImageUrl: string; // 现有的封面图URL
  partners: string[];
  instructors: string[];
  content: string;
  demoVideo: File | null;
  demoVideoUrl: string; // 现有的视频URL
  attachments: FileUpload[];
  typeId: string;
  instructorId: string;
  parentsId: string;
}

interface UserSelectModalProps {
  isOpen: boolean;
  users: User[];
  title: string;
  selectedUserId: string;
  onSelect: (userId: string) => void;
  onClose: () => void;
}

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
                {user.username} ({user.email})
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

const AchievementEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // 获取当前用户ID
  const currentUserId = user?.id || '';
  
  // 页面状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // 数据状态
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>(ACHIEVEMENT_TYPES);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  
  // 用户选择模态框状态
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: '',
    coverImage: null,
    coverImageUrl: '',
    partners: [''],
    instructors: [''],
    content: '',
    demoVideo: null,
    demoVideoUrl: '',
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
    document.title = '软院项目通 - 成果编辑';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);
  
  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, [id]);
  
  const loadInitialData = async () => {
    if (!id) {
      alert('缺少成果ID参数');
      navigate('/achievement-management');
      return;
    }
    
    setIsInitialLoading(true);
    
    try {
      // 并行加载数据
      const [typesResult, instructorsResult, studentsResult, achievementResult] = await Promise.all([
        AchievementService.getAchievementTypes(),
        AchievementService.getUsersByRole(2),
        AchievementService.getStudentsExceptCurrent(currentUserId),
        AchievementService.getAchievementById(id)
      ]);
      
      if (typesResult.success && typesResult.data) {
        setAchievementTypes(typesResult.data);
      }
      
      if (instructorsResult.success && instructorsResult.data) {
        setInstructors(instructorsResult.data);
      }
      
      if (studentsResult.success && studentsResult.data) {
        setStudents(studentsResult.data);
      }
      
      if (achievementResult.success && achievementResult.data) {
        const ach = achievementResult.data;
        setAchievement(ach);
        
        // 检查权限：只有发布者或管理员可以编辑
        if (ach.publisher_id !== currentUserId) {
          alert('您没有权限编辑此成果');
          navigate('/achievement-management');
          return;
        }
        
        // 填充表单数据
        const selectedType = typesResult.data?.find(t => t.id === ach.type_id);
        const selectedInstructor = instructorsResult.data?.find(u => u.id === ach.instructor_id);
        
        setFormData({
          title: ach.title,
          type: selectedType?.name || '',
          coverImage: null,
          coverImageUrl: ach.cover_url || '',
          partners: [''], // 可以根据需要从其他数据源获取
          instructors: selectedInstructor ? [selectedInstructor.username] : [''],
          content: ach.description || '',
          demoVideo: null,
          demoVideoUrl: ach.video_url || '',
          attachments: [],
          typeId: ach.type_id,
          instructorId: ach.instructor_id || '',
          parentsId: ach.parents_id || ''
        });
      } else {
        alert(achievementResult.message || '加载成果失败');
        navigate('/achievement-management');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('加载数据失败');
      navigate('/achievement-management');
    } finally {
      setIsInitialLoading(false);
    }
  };
  
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
  
  // 保存修改
  const handleSave = async () => {
    if (!id) {
      alert('缺少成果ID');
      return;
    }
    
    if (!formData.title) {
      alert('请输入成果标题');
      return;
    }
    
    if (!formData.typeId) {
      alert('请选择成果类型');
      return;
    }
    
    if (!formData.instructorId) {
      alert('请选择指导老师');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let coverUrl = formData.coverImageUrl;
      let videoUrl = formData.demoVideoUrl;
      
      // 处理新的封面图上传
      if (formData.coverImage) {
        const fileName = `cover_${Date.now()}.${formData.coverImage.name.split('.').pop()}`;
        const filePath = `achievements/${currentUserId}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(formData.coverImage, 'achievement-images', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          coverUrl = uploadResult.url;
        } else {
          const userChoice = confirm(`封面图上传失败！\n\n${uploadResult.message}\n\n是否仍要保存修改（将使用原封面图）？`);
          if (!userChoice) {
            throw new Error('用户取消了保存');
          }
        }
      }
      
      // 处理新的视频上传
      if (formData.demoVideo) {
        const fileName = `video_${Date.now()}.${formData.demoVideo.name.split('.').pop()}`;
        const filePath = `achievements/${currentUserId}/${fileName}`;
        const uploadResult = await AchievementService.uploadFile(formData.demoVideo, 'achievement-videos', filePath);
        
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url;
        } else {
          console.warn('视频上传失败:', uploadResult.message);
          alert(`视频上传失败，但成果仍会保存\n\n${uploadResult.message}`);
        }
      }
      
      // 处理富文本中的图片
      let processedContent = formData.content;
      const imageResult = await AchievementService.processRichTextImages(formData.content, currentUserId);
      if (imageResult.success && imageResult.processedContent) {
        processedContent = imageResult.processedContent;
      } else if (imageResult.message) {
        console.warn('富文本图片处理失败:', imageResult.message);
        alert(`部分图片上传失败，但成果仍会保存\n\n${imageResult.message}`);
      }
      
      // 更新成果数据
      const updateData = {
        title: formData.title,
        description: processedContent,
        type_id: formData.typeId,
        cover_url: coverUrl,
        video_url: videoUrl,
        instructor_id: formData.instructorId,
        parents_id: formData.parentsId || null
      };
      
      const result = await AchievementService.updateAchievement(id, updateData);
      
      if (result.success) {
        alert('成果修改成功！');
        navigate('/achievement-management');
      } else {
        alert(result.message || '成果修改失败');
      }
      
    } catch (error) {
      console.error('Save achievement error:', error);
      alert('成果修改失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 取消编辑
  const handleCancel = () => {
    if (confirm('确定要取消编辑吗？未保存的修改将丢失。')) {
      navigate('/achievement-management');
    }
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

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <i className="fas fa-spinner fa-spin text-secondary text-3xl mb-4"></i>
          <span className="text-text-secondary">加载中...</span>
        </div>
      </div>
    );
  }

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
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-publish" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-paper-plane w-6 text-center"></i>
                  <span className="ml-3">成果发布</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-management" 
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3 font-medium">成果管理</span>
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
            </ul>
          </nav>
          
          {/* 底部导航 */}
          <div className="mt-auto p-4 border-t border-border-light">
            <ul>
              <li>
                <button className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover} w-full text-left`}>
                  <i className="fas fa-user-cog w-6 text-center"></i>
                  <span className="ml-3">设置</span>
                </button>
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
          </div>
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
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">编辑成果</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="text-text-secondary hover:text-secondary">
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/Iy4-k7r4TIc/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{user?.full_name || '教师用户'}</p>
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
                          className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
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
                        封面图
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
                        ) : formData.coverImageUrl ? (
                          <img 
                            src={formData.coverImageUrl} 
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
                      </div>
                    </div>
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
                      </div>
                    </div>
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
                  </div>
                  {/* 编辑区域 */}
                  <div 
                    ref={contentEditableRef}
                    onInput={handleContentChange}
                    className="min-h-[300px] p-4 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all" 
                    contentEditable="true" 
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: formData.content }}
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
                    ) : formData.demoVideoUrl ? (
                      <video 
                        src={formData.demoVideoUrl} 
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
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
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        保存中...
                      </>
                    ) : (
                      '保存修改'
                    )}
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
                    <span>{formData.type || '项目报告'}</span>
                    <span className="mx-2">|</span>
                    <span>{new Date().toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  {(formData.coverImage || formData.coverImageUrl) ? (
                    <img 
                      src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.coverImageUrl}
                      alt="成果封面图" 
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-bg-gray rounded-lg flex items-center justify-center">
                      <i className="fas fa-image text-4xl text-text-muted"></i>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">参与人员</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.instructors.filter(inst => inst.trim()).map((instructor, index) => (
                      <span key={index} className="px-3 py-1 bg-bg-gray rounded-full text-sm text-text-secondary">
                        {instructor}（指导老师）
                      </span>
                    ))}
                    {formData.parentsId && (
                      <span className="px-3 py-1 bg-bg-gray rounded-full text-sm text-text-secondary">
                        {students.find(s => s.id === formData.parentsId)?.username}（合作伙伴）
                      </span>
                    )}
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
                    {(formData.demoVideo || formData.demoVideoUrl) ? (
                      formData.demoVideo ? (
                        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                          <i className="fas fa-play-circle text-white text-5xl"></i>
                        </div>
                      ) : (
                        <video 
                          src={formData.demoVideoUrl} 
                          className="w-full h-full object-cover rounded-lg"
                          controls
                        />
                      )
                    ) : (
                      <i className="fas fa-play-circle text-4xl text-text-muted"></i>
                    )}
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
                      <div className="text-center py-4 text-text-muted">
                        暂无附件
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
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

export default AchievementEditPage;