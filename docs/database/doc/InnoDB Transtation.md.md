
## 数据库ACID事务
以下为数据来源[MySQL官网](https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html)

| ACID 特性               | 主要涉及                    | 相关 MySQL / InnoDB 特性（保证机制）                                                                                                                                                                                                          |     |
| :-------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| **原子性 (Atomicity)**   | InnoDB 事务               | • `autocommit` 设置<br>• `COMMIT` 语句<br>• `ROLLBACK` 语句                                                                                                                                                                               |     |
| **一致性 (Consistency)** | InnoDB 内部处理（保护数据免受崩溃影响） | • InnoDB 双写缓冲区 (Doublewrite Buffer)<br>• InnoDB 崩溃恢复 (Crash Recovery)                                                                                                                                                               |     |
| **隔离性 (Isolation)**   | InnoDB 事务及隔离级别          | • `autocommit` 设置<br>• 事务隔离级别 + `SET TRANSACTION` 语句<br>• InnoDB 锁信息（`INFORMATION_SCHEMA`、`data_locks` / `data_lock_waits`）                                                                                                         |     |
| **持久性 (Durability)**  | MySQL 软件特性 + 硬件配置交互     | • InnoDB 双写缓冲区<br>• `innodb_flush_log_at_trx_commit`<br>• `sync_binlog`<br>• `innodb_file_per_table`<br>• 存储设备写缓冲区（磁盘/SSD/RAID）<br>• 电池备份缓存<br>• 操作系统 `fsync()` 支持<br>• 不间断电源 (UPS)<br>• 备份策略（频率/类型/保留期）<br>• 数据中心特性与网络连接（分布式/托管环境） |     |

---
1. **“一致性”含义特殊**  
   在本官方文档中，**一致性（Consistency）** 特指 **InnoDB 通过双写缓冲和崩溃恢复保护数据免受物理损坏**（如页撕裂、崩溃后数据不一致），而非业务规则或约束层面的一致性（如外键、唯一约束等）。这是 MySQL 文档对 ACID 中 C 的特定归类方式，与经典数据库理论不完全相同。

2. **持久性依赖硬件与配置**  
   持久性是 ACID 中最复杂的一环，没有通用公式。具体保证程度取决于：
   - 参数设置（如 `innodb_flush_log_at_trx_commit=1` 才保证事务提交后持久化）
   - 存储设备是否有电池备份缓存或断电保护
   - 操作系统 `fsync()` 行为是否可靠
   - 是否配备 UPS、备份策略、数据中心容错等  
   文档指出，高持久性可能需要“购买新硬件”。

3. **原子性和隔离性依赖事务**  
   - 原子性要求使用 `COMMIT` / `ROLLBACK`，并注意 `autocommit` 的默认行为（自动提交每个语句作为独立事务）。
   - 隔离性需要根据业务正确设置事务隔离级别（如 `READ COMMITTED`、`REPEATABLE READ`），并理解 InnoDB 锁机制。

4. **双写缓冲区同时出现在一致性和持久性中**  
   双写缓冲区既用于保证崩溃后的一致性（防止页撕裂），也是持久性实现的一部分（确保写入的页完整）。文档在一致性和持久性中均列出该项。

5. **性能与 ACID 可权衡**  
   文档明确说明：如果应用能容忍少量数据丢失或不一致，或者有额外软件/硬件防护，可以调整 MySQL 设置（如降低 `innodb_flush_log_at_trx_commit`、关闭双写缓冲区等）来换取更高性能或吞吐量。

6. **备份与数据中心冗余属于持久性范畴**  
   备份策略（频率、类型、保留期）以及分布式数据中心的网络连接特性，被官方列为持久性的相关因素。这意味着真正的持久性不仅依赖数据库参数，还需整体基础设施保障。

## InnoDB事务

#### InnoDB锁
InnoDB的锁分为共享锁和排他锁；意向锁；记录锁；间隙锁；Next-Key 锁；插入意向锁；AUTO-INC锁；Predicate 锁。以上所有锁都是InnoDB事务使用。
前四种锁在表元数据中都有标志，属于一种锁模式。SX锁还有具体实现：记录锁和间隙锁。


##### 记录锁
只锁定索引记录，MySQL中所有表数据都存在索引中。可以通过`show engine innodb status`。查看锁。

##### 间隙锁
作用范围：索引记录之间或首条索引记录之前或末尾索引记录之后。
阻止其他事务向对应间隙内插入数据。
> 当语句通过唯一索引精准检索单条数据行并对该行加锁时，不会产生间隙锁。（若检索条件仅命中联合唯一索引中的部分列，则依旧会产生间隙锁，该情况除外。）
> 也就是说：当查询列没有索引或只有非唯一索引时，InnoDB 无法精确定位单行，为了避免幻读，会自动锁住查询值所在的前置间隙；只有唯一索引查询才不会锁间隙，只锁记录本身。

不同事务可在同一个间隙上持有互斥类型的间隙锁。也就是说，共享间隙锁和排他间隙锁不存在实质区别。
间隙锁在可重复读和序列化读下生效，如果改为读已提交，【间隙锁在RC下的表现】
1. 当 `INSERT/UPDATE` 涉及**唯一索引**（含主键）时，为避免“插入-冲突-回滚”带来的主从不一致或 binlog 问题，即使 RC 级别也需加间隙锁检查冲突；
2. `INSERT/UPDATE` 子表时，需检查父表是否存在对应记录，此过程需加间隙锁防止幻读导致约束失效；
3. MySQL 判定完`WHERE`条件后，会立即释放不满足查询条件数据行上的记录锁。执行`UPDATE`语句时，InnoDB 会采用**半一致性读**机制，向 MySQL 返回该行最新已提交的数据版本，以此协助 MySQL 判断该行数据是否符合`UPDATE`语句中的`WHERE`筛选条件。

🔑 场景 1：RC 下唯一索引/主键冲突检查仍需间隙锁

在 RC 级别，InnoDB 默认不扫描间隙，但遇到 INSERT 或 UPDATE 涉及唯一索引（含主键）时，若插入值落在已有记录的间隙中，或恰好与某记录冲突，InnoDB 会临时加 Gap Lock / Next-Key Lock 进行冲突校验。

为什么必须加？

1. 防幻插破坏唯一性：若不加间隙锁，事务 A 插入 id=10 前，事务 B 可能瞬间插入同一间隙的 id=10，导致唯一约束被绕过。
2. 保证 Binlog 主从一致性：MySQL 早期使用 STATEMENT 格式 Binlog 时，依赖锁的顺序保证主从执行结果一致。若 RC 下完全开放间隙，主库两个并发插入可能成功，但从库按 Binlog 顺序回放时可能触发主键冲突，导致主从断裂。
3. 死锁预防：间隙锁将冲突检查"原子化"，避免多个事务交叉插入同一间隙时产生隐性死锁。

执行流程示例：

sql

1

- InnoDB 定位到 id=10 所在间隙 → 加 LOCK_X | LOCK_GAP
- 检查间隙内是否已有 id=10 → 无则插入 → 提交时释放
- 若已有 → 触发 Duplicate Key Error 或走 INSERT ... ON DUPLICATE KEY UPDATE

---

🔑 场景 2：RC 下外键约束检查仍需间隙锁

子表 INSERT/UPDATE 涉及外键时，InnoDB 需到父表验证外键值是否存在。此时会在父表对应索引键值上施加 Shared Gap Lock（或 Next-Key Lock）。

为什么必须加？

1. 防"检查通过但实际已删"的竞态：若只加记录锁，事务 A 检查父表 id=5 存在后，事务 B 可能立即删除 id=5，导致子表插入成功但外键语义失效。
2. 约束检查的原子性：Gap Lock 锁定父表该键值周围的区间，确保在子事务提交前，其他事务无法删除/修改该父记录或插入会破坏约束的间隙记录。

注意：

- 此锁是 S 模式，与业务事务的 X 锁不冲突，但会阻塞 DELETE 或 UPDATE 父表记录的操作。
- 外键间隙锁在 RC 下无法关闭，这是保证引用完整性的底线。

---

🔑 场景 3：RC 下 WHERE 过滤后立即释放非匹配行记录锁

在 RC 级别执行 UPDATE/DELETE 时，InnoDB 会按索引顺序扫描。对扫描到的每一行：

1. 先加记录锁（Record Lock）
2. 将行数据交给 MySQL Server 层评估 WHERE 条件
3. 若不满足条件 → InnoDB 立即释放该行的锁
4. 若满足条件 → 保留锁至事务提交

为什么这样设计？

- RC 允许幻读，无需像 RR 那样用 Next-Key Lock 锁定整个扫描区间。
- 大幅降低锁范围：全表扫描或大范围查询时，只有真正需要修改的行会被长期锁定，其余行"扫过即放"，并发性能提升显著。
- 对比 RR：RR 级别下，即使不满足 WHERE，InnoDB 也会保留 Next-Key Lock 直到事务结束，以维护快照一致性。

示例：

sql

1

|扫描 id|是否加锁|Server 评估 WHERE|锁行为|
|---|---|---|---|
|5|加 Record Lock|id>10 ❌|立即释放|
|12|加 Record Lock|匹配 ✅|保留至 COMMIT|
|15|加 Record Lock|不匹配 ❌|立即释放|

---

🔑 场景 4：UPDATE 中的半一致性读（Semi-Consistent Read）

当 UPDATE 扫描到被其他事务锁定的行时，InnoDB 不会阻塞等待，而是：

1. 通过 MVCC + Undo Log 读取该行最新已提交版本
2. 将此版本返回给 MySQL Server 层
3. Server 层用此版本评估 WHERE 条件
4. 若匹配 → Server 请求 InnoDB 重新加锁并执行当前读，确认版本后更新
5. 若不匹配 → 直接跳过，不等待锁

为什么这样设计？

- 解决 RC 下的锁等待瓶颈：传统一致性读需等锁释放，但 RC 本身允许不可重复读，无需严格串行化。
- 读写分离优化：将"条件过滤（读）"与"数据修改（写）"解耦，避免大量无效行阻塞事务。
- 前提条件：仅在 READ COMMITTED 级别生效，且依赖参数 innodb_semi_consistent_read=ON（MySQL 8.0.16+ 默认开启）。

注意事项：

- 不破坏 RC 语义：最终更新的是当前事务可见的最新已提交版本，符合 RC 定义。
- 业务兼容性：若其他事务在你评估 WHERE 间隙修改了该行，可能导致"更新逻辑与预期不符"，但 RC 本身不保证可重复读，需业务层接受此权衡。


以下是将官方两段文档内容深度融合后的详细总结。全文不使用任何标题标签（#），采用分段与符号标识保持结构清晰，所有技术细节、底层逻辑、日志字段与SQL执行过程均已逐一对应并通俗化解释。

---

【一、Next-Key Lock（临键锁）的完整工作机制】

1. 核心定义与作用域
Next-Key Lock 是 InnoDB 在可重复读（RR）隔离级别下的默认行锁策略。它不是独立的锁类型，而是“记录锁（Record Lock）”与“前向间隙锁（Gap Lock）”的物理组合。当 InnoDB 扫描或搜索索引时，每遇到一条记录，不仅会锁住该记录本身，还会顺带锁住这条记录在索引顺序中“正前方”的空白间隙。其根本目的是在 RR 级别下彻底阻断其他事务在当前事务扫描范围内插入新数据，从而实现防幻读。

2. 区间划分规则（左开右闭）
官方文档用 `(a, b]` 的数学区间符号精确描述了锁的覆盖范围：圆括号 `(` 表示不包含该端点，方括号 `]` 表示包含该端点。假设索引中已存在四个值：10、11、13、20。InnoDB 会将整个主键空间切分为 5 个 Next-Key Lock 管辖区间：
- `(-∞, 10]`：锁住最小值 10 及其左侧所有间隙
- `(10, 11]`：锁住 10 与 11 之间的间隙，同时包含记录 11
- `(11, 13]`：锁住 11 与 13 之间的间隙，同时包含记录 13
- `(13, 20]`：锁住 13 与 20 之间的间隙，同时包含记录 20
- `(20, +∞)`：锁住最大值 20 之后的所有插入空间

通俗理解：对记录 11 加 Next-Key Lock，相当于在 11 前面竖起一道墙。别人不能修改 11，也不能在 10 和 11 之间塞入新值（比如 10.5）。

3. 边界特殊处理：Supremum 伪记录
最后一个区间 `(20, +∞)` 在底层实现上非常巧妙。InnoDB 在每个索引页的末尾放置了一个名为 `supremum` 的虚拟记录，它的逻辑值大于表中任何真实数据。因此，`(20, +∞)` 的 Next-Key Lock 实际上是加在这个伪记录上的。因为 `supremum` 不是真实数据行，所以该锁**仅锁定 20 之后的插入间隙**，不会阻塞任何真实记录的 UPDATE 或 DELETE 操作。这是 InnoDB 用统一数据结构处理边界间隙的标准设计。

4. SQL 演示与状态日志对照
```sql
CREATE TABLE t (id INT PRIMARY KEY);
INSERT INTO t VALUES (10), (11), (13), (20);

-- 事务1（RR级别默认）：
START TRANSACTION;
SELECT * FROM t WHERE id > 10 AND id < 20 FOR UPDATE;
```
执行后，InnoDB 会扫描命中 11 和 13。对这两条记录分别加上 Next-Key Lock。实际生效的锁区间覆盖了 `(10, 11]`、`(11, 13]` 以及 `(13, 20]` 的左侧部分。此时事务2尝试 `INSERT INTO t VALUES (12);` 会被直接阻塞。

查看 `SHOW ENGINE INNODB STATUS` 会输出类似如下内容：
```
RECORD LOCKS space id 58 page no 3 n bits 72 index PRIMARY of table test.t
trx id 10080 lock_mode X
Record lock, heap no 1 PHYSICAL RECORD: ... supremum
Record lock, heap no 2 PHYSICAL RECORD: ... (真实字段值)
```
- `lock_mode X`：表示排他模式的 Next-Key Lock（底层是位域组合）
- `heap no 1 ... supremum`：明确标识锁作用在索引末尾伪记录上，即保护最大值之后的间隙
- `heap no 2`：指向真实数据行的记录锁部分

---

【二、Insert Intention Lock（插入意向锁）的完整工作机制】

1. 核心定义与设计哲学
插入意向锁是 `INSERT` 操作在真正写入物理行之前，向存储引擎声明“我准备在该索引间隙插入数据”的一种特殊间隙锁。它的核心设计目标是**提升并发插入效率**。传统间隙锁是独占的，同一间隙只能被一个事务占用；而插入意向锁是“意图共享型”，允许多个事务同时声明进入同一个间隙，只要它们最终写入的具体值不重叠，就能并行完成插入，无需互相排队。

2. 并发不阻塞原理（4与7的间隙示例）
假设索引现有值 4 和 7，中间是空白间隙 `(4, 7)`。
- 事务A执行 `INSERT ... VALUES (5)`
- 事务B执行 `INSERT ... VALUES (6)`
两个事务在插入前都会先申请 `(4, 7)` 间隙的插入意向锁。由于意向锁之间是兼容的，A和B可以同时拿到“入场许可”。随后它们分别去申请 5 和 6 的排他记录锁，因为 5 和 6 是不同的物理位置，互不冲突，最终两者同时成功提交，全程零等待。

3. 冲突场景与完整SQL推演（Client A 与 Client B）
```sql
-- 初始化数据
CREATE TABLE child (id INT PRIMARY KEY) ENGINE=InnoDB;
INSERT INTO child VALUES (90), (102);

-- 【客户端 A】开启事务，查询大于100的记录并加排他锁
START TRANSACTION;
SELECT * FROM child WHERE id > 100 FOR UPDATE;
```
此时客户端A命中记录 102。InnoDB 默认对其加 Next-Key Lock。根据区间规则，这等价于锁住了 `(90, 102]` 范围（包含 90~102 之间的间隙 + 记录102本身）。

```sql
-- 【客户端 B】开启新事务，尝试向间隙中插入 101
START TRANSACTION;
INSERT INTO child (id) VALUES (101);
```
执行过程分两步：
① 申请 `(90, 102)` 间隙的插入意向锁（声明我要插在90和102之间）
② 申请新行 101 的排他记录锁
冲突爆发：客户端A已经用普通的 Next-Key Lock（内含普通间隙锁）占据了该间隙。在 InnoDB 兼容性矩阵中，**普通间隙锁 与 插入意向锁 是互斥的**。因为普通间隙锁代表“此间隙已被保护，禁止任何插入”，而意向锁代表“我要插入”。两者逻辑对立，所以客户端B的第一步意向锁申请失败，进入 `waiting` 状态，必须等A提交或回滚。

4. 等待状态日志精准解读
```
RECORD LOCKS space id 31 page no 3 n bits 72 index PRIMARY of table test.child
trx id 8731 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 3 PHYSICAL RECORD: ...
```
- `lock_mode X`：最终写入需要排他权限
- `locks gap before rec`：锁的作用点位于目标物理记录（此处为102，即 heap no 3）的前方间隙
- `insert intention`：明确标识这是插入意向锁
- `waiting`：因与其他事务的间隙锁冲突，正在队列中等待
排查意义：只要看到 `insert intention waiting`，即可判定当前 `INSERT` 被其他事务的范围查询、显式间隙锁或 Next-Key Lock 阻塞。

---

【三、两者协同逻辑与实战关键点】

1. 协同工作流
InnoDB 用 Next-Key Lock 修“围墙”，用 Insert Intention Lock 发“通行证”。
- RR级别下，范围查询/更新自动筑起 Next-Key Lock 围墙，防止幻读。
- 执行 INSERT 时，事务先拿插入意向锁（通行证）试探。如果围墙没建（无间隙锁），通行证直接通过，多个事务可并行插入不同值；如果围墙已建（有Next-Key/Gap Lock），通行证被挡在门外，只能排队等待。

2. 兼容性矩阵（死锁排查基石）
- 插入意向锁 vs 插入意向锁：✅ 兼容（多人可同时声明）
- 插入意向锁 vs 普通间隙锁：❌ 冲突（意图插入被独占间隙阻断）
- 插入意向锁 vs Next-Key Lock：❌ 冲突（Next-Key 包含间隙锁，同样阻断）
- 插入意向锁 vs 记录锁：✅ 兼容（一个管间隙通道，一个管具体车位，作用域不重叠）

3. 细节优化与避坑指南
- 唯一索引等值优化：若 `WHERE id = 10` 且 10 是唯一索引/主键且已存在，InnoDB 会智能降级为纯记录锁，不产生 Next-Key Lock，避免误伤相邻间隙。
- RC级别差异：读已提交下默认关闭 Next-Key Lock，仅锁命中行。但外键约束校验、唯一键冲突检查时，仍会短暂触发间隙锁/意向锁机制，以保证引用完整性与 Binlog 顺序一致性。
- 高频死锁模式：事务A持有间隙A等意向锁，事务B持有间隙B等意向锁，交叉请求时形成环路；或一个事务范围查询锁住大间隙，另一个事务持续插入该间隙。可通过 `SET GLOBAL innodb_print_all_deadlocks=ON;` 抓取完整锁等待图。
- 业务调优：避免无索引的全表扫描加锁；大事务拆分为小批次缩短持锁时间；若业务可接受幻读，切换至 RC 隔离级别可默认解除大部分间隙锁与意向锁冲突，并发性能呈指数级提升。

以上内容完整覆盖官方文档的区间定义、Supremum伪记录机制、Client A/B阻塞推演、日志字段映射、兼容性逻辑及RC/RR级别差异，并全部配以可执行的SQL与逐行解释。可直接用于底层原理分析、生产环境锁等待排查或技术面试深度问答。


#### InnoDB事务模型

##### 事务隔离级别
`事务隔离`是数据库处理的基石之一。`隔离`是 `ACID` 缩写中的 `I`；`隔离级别`是一种设置，用于在多个 `事务` 同时进行数据修改和执行查询时，精细调整性能与可靠性、一致性和结果可重现性之间的平衡。

`InnoDB` 提供了 `SQL:1992` 标准中描述的全部四种 `事务隔离级别`：`READ UNCOMMITTED`（读未提交）、`READ COMMITTED`（读已提交）、`REPEATABLE READ`（可重复读）和 `SERIALIZABLE`（可串行化）。`InnoDB` 的默认 `隔离级别` 是 `REPEATABLE READ`。

用户可以使用 `SET TRANSACTION` 语句更改单个 `会话` 的 `隔离级别`，或更改所有后续 `连接` 的级别。要为所有 `连接` 设置服务器的默认 `隔离级别`，请在命令行或选项文件中使用 `--transaction-isolation` 选项。有关 `隔离级别` 和级别设置语法的详细信息，请参阅第 15.3.7 节“`SET TRANSACTION` 语句”。

`InnoDB` 使用不同的 `锁定策略` 来支持此处描述的每一种 `事务隔离级别`。对于对关键数据进行操作且 `ACID` 合规性至关重要的场景，你可以使用默认的 `REPEATABLE READ` 级别来强制执行高度的一致性。或者，在诸如批量报表生成等场景中，当精确的一致性和可重复结果的重要性低于最小化 `锁定` 开销时，你可以使用 `READ COMMITTED` 甚至 `READ UNCOMMITTED` 来放宽一致性规则。`SERIALIZABLE` 强制执行的规则比 `REPEATABLE READ` 更为严格，主要用于特殊场景，例如配合 `XA 事务` 使用，或用于排查 `并发` 与 `死锁` 相关问题。

以下列表描述了 `MySQL` 如何支持不同的 `事务级别`。列表按从最常用到最少用的顺序排列。

`REPEATABLE READ`

这是 `InnoDB` 的默认 `隔离级别`。同一 `事务` 内的 `一致性读` 会读取由第一次 `读` 所建立的 `快照`。这意味着，如果你在同一 `事务` 内发出多条普通的（非 `锁定`）`SELECT` 语句，这些 `SELECT` 语句彼此之间也是一致的。请参阅第 17.7.2.3 节“`一致性非锁定读`”。

对于 `锁定读`（带 `FOR UPDATE` 或 `FOR SHARE` 的 `SELECT`）、`UPDATE` 和 `DELETE` 语句，`锁定` 行为取决于该语句是使用带有唯一 `搜索条件` 的 `唯一索引`，还是使用 `范围类型` 的 `搜索条件`。

对于带有唯一 `搜索条件` 的 `唯一索引`，`InnoDB` 仅 `锁定` 找到的 `索引记录`，而不会 `锁定` 其之前的 `间隙`。

对于其他 `搜索条件`，`InnoDB` 会 `锁定` 扫描的 `索引范围`，使用 `间隙锁` 或 `临键锁` 来阻止其他 `会话` 向该范围覆盖的 `间隙` 中执行 `插入` 操作。有关 `间隙锁` 和 `临键锁` 的信息，请参阅第 17.7.1 节“`InnoDB 锁定`”。

不建议在单个 `REPEATABLE READ` `事务` 中混合使用 `锁定` 语句（`UPDATE`、`INSERT`、`DELETE` 或 `SELECT ... FOR ...`）与非 `锁定` 的 `SELECT` 语句，因为通常在这种情况下你需要的是 `SERIALIZABLE`。这是因为非 `锁定` 的 `SELECT` 语句呈现的是数据库的 `读视图` 状态，该视图由创建 `读视图` 之前已提交的 `事务` 以及当前 `事务` 自身的写入组成；而 `锁定` 语句则使用数据库的最新状态来执行 `锁定`。通常，这两种不同的 `表` 状态彼此不一致且难以解析。

`READ COMMITTED`

每次 `一致性读`（即使在同一 `事务` 内）都会设置并读取其自身最新的 `快照`。有关 `一致性读` 的信息，请参阅第 17.7.2.3 节“`一致性非锁定读`”。

对于 `锁定读`（带 `FOR UPDATE` 或 `FOR SHARE` 的 `SELECT`）、`UPDATE` 语句和 `DELETE` 语句，`InnoDB` 仅 `锁定` `索引记录`，而不 `锁定` 它们之前的 `间隙`，因此允许在 `锁定记录` 旁边自由 `插入` 新记录。`间隙锁` 仅用于 `外键约束检查` 和 `重复键检查`。

由于 `间隙锁` 被禁用，可能会出现 `幻行` 问题，因为其他 `会话` 可以向 `间隙` 中 `插入` 新行。有关 `幻行` 的信息，请参阅第 17.7.4 节“`幻行`”。

`READ COMMITTED` `隔离级别` 仅支持基于 `行` 的 `二进制日志`。如果你在 `binlog_format=MIXED` 的情况下使用 `READ COMMITTED`，服务器会自动切换为基于 `行` 的 `日志记录`。

使用 `READ COMMITTED` 还具有以下额外效果：

对于 `UPDATE` 或 `DELETE` 语句，`InnoDB` 仅对它实际 `更新` 或 `删除` 的 `行` 保持 `锁定`。对于不匹配 `行` 的 `记录锁`，在 `MySQL` 评估完 `WHERE` 条件后即会被释放。这大大降低了 `死锁` 的发生概率，但 `死锁` 仍然可能发生。

对于 `UPDATE` 语句，如果某 `行` 已被 `锁定`，`InnoDB` 会执行 `“半一致性”读`，将最新已提交的 `版本` 返回给 `MySQL`，以便 `MySQL` 判断该 `行` 是否匹配 `UPDATE` 的 `WHERE` 条件。如果该 `行` 匹配（必须 `更新`），`MySQL` 会再次读取该 `行`，此时 `InnoDB` 要么直接 `锁定` 它，要么等待获取该 `行` 的 `锁`。

考虑如下创建并填充数据的 `表`：
```sql
CREATE TABLE t (a INT NOT NULL, b INT) ENGINE = InnoDB;
INSERT INTO t VALUES (1,2),(2,3),(3,2),(4,3),(5,2);
COMMIT;
```
在这种情况下，该 `表` 没有 `索引`，因此 `搜索` 和 `索引扫描` 会使用隐藏的 `聚簇索引` 来进行 `记录锁定`（请参阅第 17.6.2.1 节“`聚簇索引与二级索引`”），而不是使用 `索引列`。

假设一个 `会话` 使用以下语句执行 `UPDATE`：
```sql
# Session A
START TRANSACTION;
UPDATE t SET b = 5 WHERE b = 3;
```
同时假设第二个 `会话` 在第一个 `会话` 之后执行以下语句进行 `UPDATE`：
```sql
# Session B
UPDATE t SET b = 4 WHERE b = 2;
```
当 `InnoDB` 执行每个 `UPDATE` 时，它会首先为每 `行` 获取一个 `排他锁`，然后决定是否修改它。如果 `InnoDB` 不修改该 `行`，则会释放 `锁`。否则，`InnoDB` 会将 `锁` 保留至 `事务` 结束。这会对 `事务处理` 产生如下影响。

当使用默认的 `REPEATABLE READ` `隔离级别` 时，第一个 `UPDATE` 会对其读取的每 `行` 获取 `x-lock`（`排他锁`），且不会释放其中任何一个：
```
x-lock(1,2); retain x-lock
x-lock(2,3); update(2,3) to (2,5); retain x-lock
x-lock(3,2); retain x-lock
x-lock(4,3); update(4,3) to (4,5); retain x-lock
x-lock(5,2); retain x-lock
```
第二个 `UPDATE` 在尝试获取任何 `锁` 时即会阻塞（因为第一个 `UPDATE` 已保留所有 `行` 的 `锁`），并且在第一个 `UPDATE` `提交` 或 `回滚` 之前无法继续：
```
x-lock(1,2); block and wait for first UPDATE to commit or roll back
```

如果改用 `READ COMMITTED`，第一个 `UPDATE` 会对其读取的每 `行` 获取 `x-lock`，但会释放那些未修改 `行` 的 `锁`：
```
x-lock(1,2); unlock(1,2)
x-lock(2,3); update(2,3) to (2,5); retain x-lock
x-lock(3,2); unlock(3,2)
x-lock(4,3); update(4,3) to (4,5); retain x-lock
x-lock(5,2); unlock(5,2)
```
对于第二个 `UPDATE`，`InnoDB` 会执行 `“半一致性”读`，将读取到的每 `行` 的最新已提交 `版本` 返回给 `MySQL`，以便 `MySQL` 判断该 `行` 是否匹配 `UPDATE` 的 `WHERE` 条件：
```
x-lock(1,2); update(1,2) to (1,4); retain x-lock
x-lock(2,3); unlock(2,3)
x-lock(3,2); update(3,2) to (3,4); retain x-lock
x-lock(4,3); unlock(4,3)
x-lock(5,2); update(5,2) to (5,4); retain x-lock
```

但是，如果 `WHERE` 条件包含 `索引列`，且 `InnoDB` 使用了该 `索引`，则在获取和保留 `记录锁` 时仅会考虑该 `索引列`。在以下示例中，第一个 `UPDATE` 会对 `b = 2` 的每 `行` 获取并保留 `x-lock`。当第二个 `UPDATE` 尝试对相同的 `记录` 获取 `x-lock` 时会被阻塞，因为它也使用了在列 `b` 上定义的 `索引`。
```sql
CREATE TABLE t (a INT NOT NULL, b INT, c INT, INDEX (b)) ENGINE = InnoDB;
INSERT INTO t VALUES (1,2,3),(2,2,4);
COMMIT;

# Session A
START TRANSACTION;
UPDATE t SET b = 3 WHERE b = 2 AND c = 3;

# Session B
UPDATE t SET b = 4 WHERE b = 2 AND c = 4;
```
`READ COMMITTED` `隔离级别` 可以在启动时设置，也可以在运行时更改。在运行时，它可以为所有 `会话` 全局设置，也可以为单个 `会话` 单独设置。

`READ UNCOMMITTED`

`SELECT` 语句以非 `锁定` 方式执行，但可能会使用某 `行` 的较早 `版本`。因此，使用此 `隔离级别` 时，此类 `读` 操作不具备一致性。这也被称为 `脏读`。除此之外，此 `隔离级别` 的工作方式与 `READ COMMITTED` 相同。

`SERIALIZABLE`

此级别类似于 `REPEATABLE READ`，但如果 `autocommit` 被禁用，`InnoDB` 会隐式将所有普通的 `SELECT` 语句转换为 `SELECT ... FOR SHARE`。如果 `autocommit` 已启用，`SELECT` 本身就是其独立的 `事务`。因此它被识别为只读，如果以 `一致性`（非 `锁定`）`读` 的方式执行，则可以串行化，且无需为其他 `事务` 阻塞。（如果要强制普通的 `SELECT` 在其他 `事务` 修改了所选 `行` 时阻塞，请禁用 `autocommit`。）

从 `MySQL` `授权表`（通过 `连接列表` 或 `子查询`）读取数据但不修改它们的 `DML` 操作，无论 `隔离级别` 如何，都不会在 `MySQL` `授权表` 上获取 `读锁`。有关更多信息，请参阅 `授权表并发`。