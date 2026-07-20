---
title: Data Model
createTime: 2026/04/11 13:35:38
permalink: /system-design/q74rnkgi/
---

根据您的要求，以下是去除了显式索引定义和外键约束的 RBAC 核心数据模型。这种设计通常用于概念模型展示或逻辑结构设计，具体的物理索引优化将在数据库实施阶段根据查询性能需求单独配置。

### 1. 核心实体模型 (PlantUML)

@startuml
skinparam classAttributeIconSize 0
skinparam entity {
BackgroundColor White
BorderColor Black
}

' === 用户实体 ===
entity User {
+Long userId : PK
--
+String username
+String nickname
+String email
+String phone
+String password
+Integer status
+DateTime createTime
+DateTime updateTime
}

' === 角色实体 ===
entity Role {
+Long roleId : PK
--
+String roleCode
+String roleName
+Integer status
+String remark
+DateTime createTime
+DateTime updateTime
}

' === 菜单实体 (前端路由/视图权限) ===
entity Menu {
+Long menuId : PK
--
+Long parentId
+String menuName
+String path
+String component
+String perms
+String icon
+Integer sort
+Integer type
+Integer status
}

' === 接口权限实体 (后端API权限) ===
entity Permission {
+Long permId : PK
--
+String permName
+String permCode
+String apiUrl
+String method
+String description
+Integer status
}

' === 关联表 (纯ID存储，无外键/索引声明) ===

entity UserRole {
+Long userId : PK
+Long roleId : PK
}

entity RoleMenu {
+Long roleId : PK
+Long menuId : PK
}

entity RolePermission {
+Long roleId : PK
+Long permId : PK
}

' === 逻辑关系示意 ===

User ||..o{ UserRole : "Refers to"
UserRole }o..|| Role : "Refers to"

Role ||..o{ RoleMenu : "Refers to"
RoleMenu }o..|| Menu : "Refers to"

Role ||..o{ RolePermission : "Refers to"
RolePermission }o..|| Permission : "Refers to"

@enduml

### 2. 简化版表结构定义 (SQL 逻辑示意)

此处仅展示字段和主键，不包含 `INDEX` 或 `FOREIGN KEY` 语句。

#### 2.1 用户表 (`sys_user`)

```sql
CREATE TABLE sys_user (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    password VARCHAR(100) NOT NULL,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2.2 角色表 (`sys_role`)

```sql
CREATE TABLE sys_role (
    role_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(50) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    status TINYINT DEFAULT 1,
    remark VARCHAR(255),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2.3 用户-角色关联表 (`sys_user_role`)

```sql
CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
);
```

#### 2.4 菜单表 (`sys_menu`)

```sql
CREATE TABLE sys_menu (
    menu_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0,
    menu_name VARCHAR(50) NOT NULL,
    path VARCHAR(200),
    component VARCHAR(200),
    perms VARCHAR(100),
    icon VARCHAR(100),
    sort INT DEFAULT 0,
    type TINYINT DEFAULT 1,
    status TINYINT DEFAULT 1
);
```

#### 2.5 角色-菜单关联表 (`sys_role_menu`)

```sql
CREATE TABLE sys_role_menu (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id)
);
```

#### 2.6 接口权限表 (`sys_permission`)

```sql
CREATE TABLE sys_permission (
    perm_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    perm_name VARCHAR(50) NOT NULL,
    perm_code VARCHAR(100) NOT NULL,
    api_url VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    status TINYINT DEFAULT 1
);
```

#### 2.7 角色-接口权限关联表 (`sys_role_permission`)

```sql
CREATE TABLE sys_role_permission (
    role_id BIGINT NOT NULL,
    perm_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, perm_id)
);
```

### 说明：

1. **主键保留**：虽然去除了索引和外键声明，但 `PRIMARY KEY` 仍然保留，因为它是关系型数据库表结构的必要组成部分，用于唯一标识记录。
2. **逻辑关联**：表之间的关联完全依靠应用程序代码中的业务逻辑（如 Service 层的事务控制）来维护，数据库层面不做任何约束。
3. **灵活性**：这种极简模型便于快速原型开发或在 NoSQL/NewSQL 混合架构中进行映射，后续可根据实际查询瓶颈按需添加物理索引。
