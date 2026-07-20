---
title: Permission Manegement
createTime: 2026/04/13 13:19:04
permalink: /system-design/61xvtwaf/
---

### 数据模型

:::: card-grid

::: card title="Menu (菜单权限)" icon="twemoji:menu-button"

@startuml
entity Menu {
+Long menuId : 菜单ID
+Long parentId : 父菜单ID
+String menuName : 菜单名称
+String path : 路由路径
+String component : 组件路径
+String perms : 权限标识(可选)
+String icon : 图标
+Integer sort : 排序
+Integer type : 类型(0:目录 1:菜单 2:按钮)
+Integer status : 状态(1:启用 0:禁用)
}
@enduml

:::

::: card title="Permission (接口权限)" icon="twemoji:locked-with-key"

@startuml
entity Permission {
+Long permId : 权限ID
+String permName : 权限名称
+String permCode : 权限编码(唯一标识)
+String apiUrl : 接口路径
+String method : 请求方法(GET/POST等)
+String description : 描述
+Integer status : 状态(1:启用 0:禁用)
}
@enduml

:::
::::

### 接口设计

- 新增菜单/接口权限
- 查找权限（支持树形查询）
- 编辑菜单/接口权限
- 删除权限
- 分页/列表查询权限

### 组件

按钮：新增菜单 | 新增接口 | 编辑 | 删除
输入框：查询权限（支持名称/编码模糊搜索）
表单：

- **菜单表单**：上级菜单选择器、菜单名称、路由路径、组件路径、图标、排序、类型、状态。
- **接口表单**：接口名称、权限编码、API 路径、请求方法、描述、状态。
- **树形控件**：用于展示菜单层级结构或权限分配时的勾选。

### 功能

**新增菜单/接口权限**：

1. **选择类型**：决定是添加“菜单”还是“接口”。
2. **填写基本信息**：
   - 若为菜单：选择父级菜单（构建树形结构），填写名称、路由、组件等。
   - 若为接口：填写接口名称、唯一的权限编码（如 `user:add`）、API 路径及 HTTP 方法。
3. 提交保存至 `sys_menu` 或 `sys_permission` 表。

**查找权限**：

- **树形展示**：默认以树形结构加载所有启用的菜单权限，便于直观查看层级。
- **模糊搜索**：支持根据 `menuName`/`permName` 或 `perms`/`permCode` 进行过滤查找。

**编辑权限**：

- 更新菜单或接口的基本属性（如名称、路径、排序、状态等）。
- _注意_：修改菜单的 [path](file://f:\vue-project\Blog\node_modules\upath) 或接口的 `apiUrl` 可能会影响前端路由跳转或后端鉴权拦截，需谨慎操作并通知相关人员。
- _注意_：不建议修改已广泛使用的 `permCode` 或 `perms`，以免导致已有角色权限失效。

**删除权限**：

- **前置检查**：删除前需检查该权限是否已被角色关联（查询 `sys_role_menu` 或 `sys_role_permission`）。
- **逻辑删除/物理删除**：
  - 若未被引用，可直接删除。
  - 若已被引用，建议禁止删除或提示先解除角色关联。
  - 删除菜单时，通常需递归删除其所有子菜单。

**分页/列表查询**：

- 虽然菜单通常以树形展示，但在数据量极大或需要扁平化管理时，支持分页列表查询。
- 返回权限列表及总数，支持按类型（菜单/接口）筛选。

### 关联说明

- **角色-菜单关联**：通过 `sys_role_menu` 表维护，决定用户能看到哪些菜单。
- **角色-接口关联**：通过 `sys_role_permission` 表维护，决定用户能调用哪些 API。
- **权限同步**：当权限信息（如路径、编码）发生变更时，可能需要清除相关的权限缓存（如 Redis 中的用户权限集），以确保即时生效。
