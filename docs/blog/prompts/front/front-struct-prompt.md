---
title: front-struct-prompt
createTime: 2026/03/22 22:07:53
permalink: /blog/7g08kcq5/
---

除了你提到的 **公共 CSS/资源** 和 **Layout（布局）** 之外，一个成熟、可维护的 Vue 项目（特别是 Vue 3 + Vite + TypeScript 技术栈）还需要从以下几个维度进行工程化准备。

我将这些内容整理为 **6 大核心模块**，并附带了推荐的目录结构参考：

### 1. 核心基础设施 (Core Infrastructure)

这是项目的骨架，决定了数据如何流动、页面如何跳转。

- **路由管理 (Router)**
  - **路由配置**：定义静态路由表。
  - **路由守卫 (Guards)**：全局前置守卫（用于登录验证、权限判断）、后置守卫（用于修改页面标题）。
  - **动态路由**：根据后端返回的权限表动态生成可访问的路由（权限控制核心）。
  - **错误页**：404 页面、403 无权限页面。
- **状态管理 (State Management)**
  - **Store 配置**：推荐使用 **Pinia** (Vue 3 标配)。
  - **持久化插件**：配置 `pinia-plugin-persistedstate`，用于自动持久化用户 Token、主题设置等到 localStorage。
  - **核心 Stores**：`user` (用户信息、Token)、`app` (全局配置、侧边栏状态、主题)、`tagsView` (多标签页状态)。
- **网络请求封装 (HTTP)**
  - **Axios 实例**：创建单例，配置 `baseURL`、`timeout`。
  - **拦截器 (Interceptors)**：
    - 请求拦截：统一注入 Token、添加请求时间戳。
    - 响应拦截：统一处理业务状态码（如 401 跳转登录）、统一错误提示、数据解包。
  - **取消请求**：处理重复提交或页面切换时取消未完成的请求。

### 2. 组件体系 (Component System)

除了 Layout，还需要建立分层的组件库，避免代码重复。

- **基础组件 (Base Components)**
  - 对 Element Plus / AntDV 等 UI 库的二次封装（如统一的 `MyButton`, `MyTable`），统一项目风格。
  - 项目特有的原子组件（如：上传组件、富文本编辑器、图标选择器）。
  - **自动注册**：配置 `unplugin-vue-components` 实现按需自动导入。
- **业务组件 (Business Components)**
  - 跨页面复用的业务逻辑块（如：用户选择器、部门树选择器、商品卡片）。
- **图标管理 (Icons)**
  - 推荐使用 `unplugin-icons` 或 SVG Sprite 方案，统一管理图标资源。

### 3. 逻辑复用与工具 (Logic & Utilities)

Vue 3 的核心优势在于组合式 API，需要准备好逻辑复用的方案。

- **组合式函数 (Composables / Hooks)**
  - 放在 `src/composables` 或 `src/hooks`。
  - 例如：`useTable` (表格分页查询逻辑)、`useTheme` (主题切换)、`usePermission` (按钮级权限判断)、`useDownload` (文件下载)。
- **工具函数 (Utils)**
  - 放在 `src/utils`。
  - 例如：`request.js` (axios), `auth.js` (token 操作), `validate.js` (正则验证), `format.js` (时间、金额格式化), `storage.js` (localStorage 封装)。
- **自定义指令 (Directives)**
  - 例如：`v-permission` (按钮权限控制)、`v-loading` (指令式加载)、`v-copy` (一键复制)。
- **全局方法/属性 (Plugins)**
  - 挂载到 `app.config.globalProperties` (尽量少用，推荐用 Hooks 替代)，如 `$filters`。

### 4. 配置与环境 (Configuration & Env)

区分不同环境，保证构建的灵活性。

- **环境变量 (.env)**
  - `.env.development` (开发环境)
  - `.env.production` (生产环境)
  - `.env.staging` (测试环境)
  - 内容包含：`VITE_APP_BASE_API`, `VITE_APP_TITLE` 等。
- **构建配置 (vite.config.ts)**
  - **别名 (Alias)**：配置 `@` 指向 `src`。
  - **代理 (Proxy)**：配置 `server.proxy` 解决开发环境跨域问题。
  - **压缩与优化**：配置 `Gzip`、`Brotli` 压缩，配置 `chunk` 拆分策略。
- **TypeScript 配置 (tsconfig.json)**
  - 配置路径映射、严格模式、全局类型声明 (`src/types/*.d.ts`)。

### 5. 安全与权限 (Security & Permissions)

- **登录认证**：登录页、登出逻辑、Token 刷新机制 (Refresh Token)。
- **权限控制**：
  - **菜单权限**：路由表过滤。
  - **按钮权限**：自定义指令或 Hooks 判断。
  - **数据权限**：后端控制为主，前端配合展示。
- **安全策略**：防止 XSS（Vue 默认处理，但需注意 `v-html`）、配置 CSP（内容安全策略）。

### 6. 工程化与质量保障 (Engineering & Quality)

这部分决定了团队协作的效率和代码质量。

- **代码规范**
  - **ESLint**：代码语法检查。
  - **Prettier**：代码格式化。
  - **Stylelint**：CSS 样式检查。
  - **EditorConfig**：统一编辑器配置。
- **Git 提交规范**
  - **Husky + lint-staged**：提交前自动执行 lint 和测试。
  - **Commitlint**：规范 Commit Message 格式 (如 `feat: add login page`)。
- **Mock 数据**
  - 使用 `vite-plugin-mock` 或 `Mock.js`，在后端接口未完成时前端并行开发。
- **测试 (Testing)**
  - **单元测试**：Vitest + Vue Test Utils (测试 Utils 和 组件)。
  - **E2E 测试**：Cypress 或 Playwright (测试核心业务流程)。
- **文档 (Documentation)**
  - `README.md`：项目启动、构建、目录说明。
  - `CHANGELOG.md`：版本更新记录。
  - (可选) **Storybook**：组件文档与预览。

---

### 推荐的目录结构参考

```text
src/
├── assets/             # 静态资源 (你提到的公共资源)
│   ├── styles/         # 公共 CSS (variables.scss, mixins.scss, global.scss)
│   ├── images/
│   └── icons/
├── components/         # 组件
│   ├── base/           # 基础组件 (二次封装 UI 库)
│   └── business/       # 业务组件
├── composables/        # 组合式函数 (Hooks)
├── directives/         # 自定义指令
├── layout/             # 布局 (你提到的 Layout)
│   ├── components/     # 布局相关组件 (Header, Sidebar, TagsView)
│   └── index.vue
├── router/             # 路由
│   ├── index.ts
│   └── guards/         # 路由守卫
├── stores/             # 状态管理 (Pinia)
├── utils/              # 工具函数
├── api/                # 接口管理
│   ├── modules/        # 按模块划分接口
│   └── index.ts        # axios 实例
├── views/              # 页面文件
├── types/              # TypeScript 类型定义
├── App.vue
└── main.ts
```

### 总结建议

如果是**从 0 开始**，建议优先完成以下 **MVP (最小可行性产品) 工程化** 顺序：

1.  **基础搭建**：Vite + Vue + TS + 路由 + Pinia。
2.  **网络层**：Axios 封装 + 环境变量配置。
3.  **布局与登录**：Layout + 登录页 + Token 拦截逻辑。
4.  **规范**：ESLint + Prettier + Husky (越早配越好，否则后期改代码很痛苦)。
5.  **业务扩展**：公共组件、Hooks、权限指令。

这样能保证项目一开始就走在正确的轨道上，避免后期重构。
