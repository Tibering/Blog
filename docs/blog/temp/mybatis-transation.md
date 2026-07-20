---
title: mybatis-transation
createTime: 2026/05/31 08:25:48
permalink: /blog/ysp8z75a/
---
## 核心区别

### 1️⃣ **JdbcTransaction**（JDBC 事务）

- **直接使用 JDBC 的事务管理机制**
- 由 MyBatis 直接控制连接的 **commit()** 和 **rollback()**
- 内部维护 `autoCommit` 配置，可以控制自动提交
- **适用于独立应用环境**，不使用外部容器管理事务
### 2️⃣ **ManagedTransaction**（托管事务）

- **让容器管理事务的完整生命周期**
- **commit() 和 rollback() 方法是空的**，不执行任何操作
- 由外部容器（如 **Spring**、**Java EE**）来管理事务的提交和回滚
- 多了 `closeConnection` 属性控制连接是否关闭
- **适用于集成环境**，与 Spring 等框架整合时使用

## 共同点

都用`private DataSource dataSource;  private TransactionIsolationLevel level;  private Connection connection;`三个参数，其中TransactionIsolationLevel是Connection中的四种隔离级别。

