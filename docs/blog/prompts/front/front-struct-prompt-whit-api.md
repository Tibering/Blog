---
title: front-struct-prompt-whit-api
createTime: 2026/03/22 22:08:48
permalink: /blog/6udpdyky/
---

作为一个纯后端开发者，你其实拥有**最大的优势**：你清楚数据结构、业务逻辑和接口定义。前端对你来说，本质上只是**“数据的展示层”**和**“用户操作的收集层”**。

你不需要去学深奥的 CSS 或设计模式，你的策略应该是：**“以 API 为核心，让 AI 生成胶水代码”**。

以下是专门为你定制的 **《后端驱动前端 (API-First) AI 构建指南》**，包含可以直接复制的 Prompt 模板。

---

### 核心策略：把 AI 当作“前端翻译官”

你的工作流应该是：
`API 定义 (Swagger/JSON/文档)` -> `AI 生成 TS 类型 & API 请求` -> `AI 生成 CRUD 页面` -> `联调`

---

### 第一阶段：项目脚手架（黑盒模式）

**目标**：不要纠结配置，直接要一个能跑的、配置好代理的“容器”。
**痛点**：后端最怕配 Vite、Webpack、Babel、ESLint。
**Prompt 策略**：强调“标准后台模板”和“代理配置”。

**🚀 复制这个 Prompt：**

> 我是一个后端开发者，不熟悉前端工程化。请帮我初始化一个 Vue 3 + TypeScript + Vite + Element Plus 的后台管理项目。
> **要求**：
>
> 1. 不要让我手动配置 webpack/vite，直接给出最简的 `vite.config.ts` 配置。
> 2. **关键点**：我的后端接口在 `http://localhost:8080/api`，请配置好 `server.proxy`，让前端请求 `/api` 时自动转发到后端，解决跨域问题。
> 3. 目录结构要清晰，特别是 `src/api` (放接口) 和 `src/types` (放类型定义)。
> 4. 请给出 `package.json` 的依赖安装命令。

---

### 第二阶段：API 层与类型定义（你的舒适区）

**目标**：利用你的接口文档，生成前端的“数据模型”和“请求函数”。
**痛点**：前端手写 Interface 容易和后端不一致。
**Prompt 策略**：直接投喂 Swagger 内容或接口定义。

**🚀 场景 A：你有 Swagger/OpenAPI JSON**

> 这是我的 Swagger API 定义片段（粘贴 JSON 或 YAML）。
> **任务**：
>
> 1. 请根据这个定义，生成 TypeScript 的 `Interface` 类型文件 (`src/types/user.ts`)。
> 2. 请生成对应的 API 请求函数 (`src/api/user.ts`)，使用 Axios。
> 3. 请求函数要包含：GET 列表、POST 新增、PUT 修改、DELETE 删除。
> 4. 确保请求路径和参数名与我的 API 定义完全一致。

**🚀 场景 B：你只有简单的接口文档**

> 我有一个用户管理接口，定义如下：
>
> - URL: `/api/users`
> - Method: `GET`
> - 请求参数：`page` (int), `size` (int), `keyword` (string)
> - 返回数据：`{ code: 200, data: { list: Array, total: int }, msg: "success" }`
> - 数据字段：`id`, `username`, `email`, `role`, `createTime`
>
> **任务**：
>
> 1. 请定义 TypeScript 接口 `UserVO` 和 `UserQuery`。
> 2. 请封装 `getUserList(params)` 函数，处理好参数映射和响应数据解包。

---

### 第三阶段：页面生成（CRUD 自动化）

**目标**：有了 API，让 AI 生成对应的“增删改查”页面。
**痛点**：不知道怎么写 Table、Form、Pagination 的绑定。
**Prompt 策略**：描述“标准后台页面”，让 AI 套用 Element Plus 模板。

**🚀 复制这个 Prompt：**

> 我已经有了 `src/api/user.ts` 和 `src/types/user.ts`（见上文）。
> **任务**：
> 请帮我生成一个标准的 **用户管理页面** (`src/views/user/index.vue`)。
> **功能要求**：
>
> 1. **搜索区**：包含用户名输入框、角色下拉框、搜索/重置按钮。
> 2. **表格区**：展示用户列表，支持分页。
> 3. **操作区**：每行有“编辑”和“删除”按钮。
> 4. **弹窗**：点击“新增/编辑”弹出 Dialog 表单，表单字段与 TypeScript 定义一致。
> 5. **逻辑**：请使用 `<script setup>`，调用上面的 API 函数，不要写死数据。
> 6. **样式**：使用 Element Plus 默认样式即可，不需要自定义 CSS。

---

### 第四阶段：联调与报错（后端思维调试）

**目标**：解决前后端对接时的常见问题（跨域、字段名、状态码）。
**痛点**：前端报错看不懂，或者数据对不上。
**Prompt 策略**：直接贴错误日志 + 接口预期。

**🚀 场景 A：跨域/请求发不出去**

> 我启动了前端项目，点击搜索按钮，浏览器控制台报错 `Network Error` 或 `404`。
> 我的后端地址是 `http://127.0.0.1:8080`，前端请求的是 `/api/users`。
> 请检查我的 `vite.config.ts` 代理配置，告诉我哪里写错了？

**🚀 场景 B：数据字段对不上**

> 后端返回的字段是 `create_time` (下划线)，但前端 TypeScript 定义的是 `createTime` (驼峰)。
> 页面表格显示 `undefined`。
> **任务**：
>
> 1. 请给我一个 Axios 响应拦截器的代码，自动把后端返回的下划线字段转为驼峰。
> 2. 或者告诉我如何在 Vue 表格里做字段映射。

**🚀 场景 C：登录鉴权**

> 我的后端需要 Header 里带 `Authorization: Bearer <token>`。
> 请帮我修改 `request.ts` 拦截器，从 localStorage 获取 token 并注入到 Header 中。
> 如果接口返回 401，请强制跳转回登录页。

---

### 第五阶段：进阶优化（让 AI 做脏活）

**目标**：处理后端不关心但前端必须做的事。
**Prompt 策略**：描述业务场景，让 AI 提供方案。

**🚀 复制这个 Prompt：**

> 我有一个“导出 Excel"的接口，后端返回的是二进制流 (Blob)。
> 前端 Axios 默认当 JSON 处理，导致文件损坏。
> **任务**：
>
> 1. 请告诉我 Axios 请求时 `responseType` 应该设为什么？
> 2. 请给我一段代码，如何将返回的 Blob 数据转换为文件并触发浏览器下载。

**🚀 复制这个 Prompt：**

> 我的表单里有“时间范围选择器”，前端选的是 `[startTime, endTime]` 两个值。
> 但后端接口需要两个独立的参数 `startTime` 和 `endTime`。
> 请帮我在提交表单前，写一个函数处理这个数据转换。

---

### 💡 给后端开发者的特别 Tips

1.  **关于 UI 库**：
    - 坚定选择 **Element Plus**。它的组件最像传统后台，文档最全，AI 生成的代码准确率最高。
    - 不要尝试自己写 CSS 布局，全部用 `el-row`, `el-col`, `el-form-item`。

2.  **关于状态管理 (Pinia)**：
    - 告诉 AI：“我只需要存 Token 和用户信息，其他状态不要全局化，尽量在组件内维护。”
    - 后端思维：能传参就传参，不要到处存全局变量。

3.  **关于 TypeScript**：
    - 这是你的强项。要求 AI：“所有 API 入参和出参必须定义 Interface，严禁使用 `any`。”
    - 这样如果后端改了接口，前端编译会直接报错，能帮你发现文档不同步的问题。

4.  **关于 Mock 数据**：
    - 如果后端接口还没好，直接对 AI 说：“基于这个 Interface，帮我生成 Mock 数据，使用 `vite-plugin-mock`。”
    - 你可以先写前端，等后端接口好了，把 Mock 开关一关就能连真实接口。

### 🎯 现在的行动建议

你可以直接把你的 **一个核心接口定义（比如登录或用户列表）** 发给我，我来演示如何把它变成完整的 Vue 页面代码。你想试试吗？
