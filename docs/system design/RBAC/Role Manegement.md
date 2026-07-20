---
title: Role Manegement
createTime: 2026/04/13 13:07:32
permalink: /system-design/9cgfhp2w/
---

### 模块模型

@startuml
' 使用 entity 关键字定义角色实体
entity Role {
+Long roleId : 角色ID
+String roleCode : 角色编码
+String roleName : 角色名称
+Integer status : 状态
+String remark : 备注
}

note right of Role
状态说明:
1: 启用
0: 禁用
end note
@enduml

### 接口设计

- 新增角色
- 查找角色
- 启用/禁用角色
- 编辑角色
- 分页查询角色[进入页面时获取 | 刷新列表获取]
- 分配权限（菜单/接口）

### 组件

按钮：新增角色 | 启用/禁用 | 编辑 | 分配权限
输入框：查询角色（支持角色名称/编码模糊搜索）
表单：新增角色 | 编辑角色 | 分配权限（树形选择器）

### 功能

**新增角色**：

1. 填写角色基本信息（名称、编码、备注）。
2. 设置初始状态。
3. 提交保存至 `sys_role` 表。

**查找角色**：

- 支持根据 `roleId` 精确查找。
- 支持根据 `roleName` 或 `roleCode` 模糊查找。

**启用/禁用角色**：

- 切换角色的 `status` 字段（1: 启用, 0: 禁用）。
- 禁用后，拥有该角色的用户将暂时失去对应权限。

**编辑角色**：

- 更新角色的基本信息（名称、备注等）。
- _注意：通常不建议修改 `roleCode`，若修改需确保无关联业务冲突。_

**分配权限**：

1. 打开权限分配弹窗。
2. 远程加载所有可用的菜单和接口权限列表（树形结构）。
3. 勾选当前角色已拥有的权限。
4. 提交更新 `sys_role_menu` 和 `sys_role_permission` 关联表（事务控制）。

**分页查询角色**：

- 进入页面或点击刷新时，携带分页参数（pageNum, pageSize）及搜索条件请求后端。
- 返回角色列表及总数。
