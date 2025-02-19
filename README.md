# 高校管理系统前端

## 项目介绍
本项目是高校管理系统的前端部分，基于 Vue.js 开发，提供了现代化的用户界面和丰富的数据可视化功能。

## 技术栈
- Vue.js 2.x
- Element UI
- ECharts
- Vuex
- Vue Router
- Axios

## 系统要求
- Node.js >= 12.x
- npm >= 6.x

## 安装说明

1. 克隆项目
```bash
git clone [项目地址]
cd university-management-system-front
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 文件为 `.env.development`，并根据实际情况修改配置：
```bash
VUE_APP_BASE_API='http://localhost:8080'  # 后端接口地址
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产环境
```bash
npm run build
```

## 项目结构
```
src/
├── api/                # API 接口
├── assets/            # 静态资源
├── components/        # 公共组件
├── icons/             # 图标
├── layout/           # 布局组件
├── router/           # 路由配置
├── store/            # Vuex 状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
└── views/            # 页面组件
```

## 功能模块
1. 仪表盘
   - 数据统计概览
   - 高校分布地图
   - 增长趋势图表
   - 用户活跃度分析

2. 高校管理
   - 高校信息管理
   - 高校分类管理
   - 批量导入导出

3. 用户管理
   - 用户信息管理
   - 角色权限管理
   - 用户行为分析

4. 互动管理
   - 咨询管理
   - 回复管理
   - 关注管理

## 开发指南

### 新增页面
1. 在 `views` 目录下创建页面组件
2. 在 `router` 中添加路由配置
3. 在 `api` 目录下添加相关接口
4. 如需要，在 `store` 中添加状态管理

### 开发规范
1. 组件命名采用大驼峰命名法
2. API 接口统一管理，按模块划分
3. 使用 ESLint 进行代码规范检查
4. 提交代码前进行 lint 检查

### 构建部署
1. 测试环境部署
```bash
npm run build:stage
```

2. 生产环境部署
```bash
npm run build:prod
```

## 常见问题

1. 安装依赖失败
   - 检查 Node.js 版本
   - 清除 npm 缓存：`npm cache clean --force`
   - 使用淘宝镜像：`npm config set registry https://registry.npmmirror.com`

2. 开发环境启动失败
   - 检查端口是否被占用
   - 检查环境变量配置
   - 检查后端服务是否正常运行

3. 接口调用失败
   - 检查网络连接
   - 检查接口地址配置
   - 检查跨域配置

## 更新日志
- v1.0.0
  - 初始版本发布
  - 实现基础功能模块
  - 完成数据可视化展示

## 维护者
[你的名字]

## 许可证
MIT
