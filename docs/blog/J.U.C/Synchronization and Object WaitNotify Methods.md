---
title: Synchronization and Object WaitNotify Methods
createTime: 2026/04/03 14:14:05
permalink: /blog/nfj8jbqx/
tags:
  - J.U.C
---

当多个线程访问共享数据时，必须通过同步机制（Synchronization） 确保数据一致性，而 Object 类的 wait()/notify() 方法则是实现线程间等待/通知协作的基础范式。

在Java多线程编程中，分为有锁编程和无锁编程。首先Java提供了两种锁，隐式锁和显式锁。我们只需要知道显式锁是对隐式锁的抽象，并且底层是基于`Unsafe`类和 AQS队列（一种数据机构）实现的。

### Object中的Wait Notify Methods

| 方法                 | 作用                    | 调用条件 | 线程状态变化                        |
| -------------------- | ----------------------- | -------- | ----------------------------------- |
| `wait()`             | 释放锁并无限等待        | 持有锁   | `RUNNABLE` → `WAITING`              |
| `wait(long timeout)` | 等待至多 `timeout` 毫秒 | 持有锁   | `RUNNABLE` → `TIMED_WAITING`        |
| `notify()`           | 随机唤醒一个等待线程    | 持有锁   | `WAITING` → `BLOCKED`（尝试获取锁） |
| `notifyAll()`        | 唤醒所有等待线程        | 持有锁   | 所有等待线程 → `BLOCKED`            |

我们知道调用这些方法是在线程持有锁的状态下使用的，所以我们接下来需要讲解Java的内部锁sync同步锁，接下来以一个例子说明。这个该怎么用？

### sync和对象的WaitNotify Methods使用示例

```java
class TurnController {
    private boolean firstTurn = true;  // 控制当前轮到谁

    // 线程A执行
    public synchronized void firstRun() throws InterruptedException {
        for (int i = 1; i <= 3; i++) {
            // 不是自己的回合就等待
            while (!firstTurn) {
                `wait`();
            }

            System.out.println("线程A 执行第 " + i + " 次");
            firstTurn = false;    // 把机会让给B
            `notify`();           // 唤醒线程B
        }
    }

    // 线程B执行
    public synchronized void secondRun() throws InterruptedException {
        for (int i = 1; i <= 3; i++) {
            // 不是自己的回合就等待
            while (firstTurn) {
                `wait`();
            }

            System.out.println("线程B 执行第 " + i + " 次");
            firstTurn = true;     // 把机会还给A
            `notify`();           // 唤醒线程A
        }
    }
}

public class WaitNotifyAlternation {
    public static void main(String[] args) {
        TurnController controller = new TurnController();

        // 线程A
        Thread threadA = new Thread(() -> {
            try {
                controller.firstRun();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Thread-A");

        // 线程B
        Thread threadB = new Thread(() -> {
            try {
                controller.secondRun();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Thread-B");

        threadA.start();
        threadB.start();
    }
}
```
