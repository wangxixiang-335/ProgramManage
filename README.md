# 软院项目通

河北师范大学软件学院项目管理系统 - 一个基于React + TypeScript的现代化项目成果管理平台。

## 🎯 项目简介

软院项目通是为软件学院师生设计的项目成果管理系统，支持：
- 📊 成果发布与展示
- 🔍 成果审批与管理
- 👥 用户权限管理
- 📱 响应式设计
- 🌐 现代化UI界面

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + CSS Modules
- **路由管理**: React Router
- **后端服务**: Supabase (PostgreSQL + Storage)
- **代码规范**: ESLint + TypeScript

## 📁 项目结构

```
app/
├── docs/              # 📖 项目文档
├── src/               # 🚀 源代码
│   ├── components/    # 🧩 通用组件
│   ├── lib/          # 🔧 核心服务
│   ├── pages/        # 📄 页面组件
│   ├── router/       # 🛣️ 路由配置
│   ├── tests/        # 🧪 测试文件
│   └── types/        # 📝 类型定义
└── 配置文件          # ⚙️ 项目配置
```

详细的项目结构说明请查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🛠️ 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量模板：
```bash
cp .env.example .env.local
```

2. 配置Supabase环境变量：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📖 文档

- 📋 [项目结构说明](./PROJECT_STRUCTURE.md)
- 📖 [完整文档目录](./docs/README.md)
- 🚀 [环境设置指南](./docs/setup/)
- 🔧 [开发文档](./docs/development/)

## 🔧 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 组件使用函数式写法
- 样式使用CSS Modules

### 提交规范
- 使用语义化提交信息
- 代码review后才能合并
- 确保所有测试通过

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 📞 支持

如有问题或建议，请联系开发团队或提交Issue。

---

**开发团队**: 河北师范大学软件学院  
**最后更新**: 2025-11-29