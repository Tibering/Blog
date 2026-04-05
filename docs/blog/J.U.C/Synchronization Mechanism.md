---
title: Synchronization Mechanism
createTime: 2026/04/03 16:02:31
permalink: /blog/ncza1do5/
tags:
  - J.U.C
---

`Synchronization`通过锁的状态和`Object`的`Wait Notify Methods`方法实现联动，保证线程的并发。

在此之前我们要知道，同步线程一定会导致程序执行速度的损失，但是可以让程序平稳的运行。比如，一段代码运行完需要10s，但是为了同步线程。可能需要更多的时间。我们再说一个易混淆的点：使用多线程会更快。这个快是相对于程序串行执行的。但是前面那一种同步是相对并行程序执行的。

这里提供两个示例，主要关于线程间同步，我们对于同时创建的多个线程，我们无法控制它们的运行速度。所以只能在他们要访问的资源进行加锁和通过一定机制来控制他们什么时候进入。从而达到资源访问的有序性。

### 示例一：顺序打印 0 1（flag 控制）

```java
public class Print01 {

    private static volatile boolean flag = false; // false=打印0，true=打印1
    private static final Object lock = new Object();

    static class PrintTask implements Runnable {
        private boolean targetFlag;

        public PrintTask(boolean targetFlag) {
            this.targetFlag = targetFlag;
        }

        @Override
        public void run() {
            synchronized (lock) {
                try {
                    // 不是自己的轮次就等待
                    while (flag != targetFlag) {
                        lock.wait();
                    }

                    // 打印
                    System.out.print(targetFlag ? 1 : 0);

                    // 切换状态
                    flag = !flag;

                    // 唤醒另一个线程
                    lock.notifyAll();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new PrintTask(false)).start(); // 打印0
        new Thread(new PrintTask(true)).start();  // 打印1
    }
}
```

### 示例二：顺序打印 1 2 3 4 5

```java
public class Print12345 {

    private static volatile int current = 1;
    private static final Object lock = new Object();

    static class PrintTask implements Runnable {
        private int num;

        public PrintTask(int num) {
            this.num = num;
        }

        @Override
        public void run() {
            synchronized (lock) {
                try {
                    // 没轮到自己就等待
                    while (current != num) {
                        lock.wait();
                    }

                    // 打印
                    System.out.print(num);

                    // 下一个数字
                    current++;

                    // 唤醒所有线程去抢
                    lock.notifyAll();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new PrintTask(1)).start();
        new Thread(new PrintTask(2)).start();
        new Thread(new PrintTask(3)).start();
        new Thread(new PrintTask(4)).start();
        new Thread(new PrintTask(5)).start();
    }
}
```

```java
public class Print12345_V2 {

    private static volatile int current = 1;
    private static final Object lock = new Object();

    static class PrintTask implements Runnable {
        @Override
        public void run() {
            synchronized (lock) {
                try {
                    int threadId = Integer.parseInt(Thread.currentThread().getName());

                    while (current != threadId) {
                        lock.wait();
                    }

                    System.out.print(threadId);
                    current++;
                    lock.notifyAll();

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public static void main(String[] args) {
        PrintTask task = new PrintTask();
        new Thread(task, "1").start();
        new Thread(task, "2").start();
        new Thread(task, "3").start();
        new Thread(task, "4").start();
        new Thread(task, "5").start();
    }
}
```

#### 写法1：单个任务类 + 线程编号判断（最常用）

所有线程共用同一个任务，通过线程编号控制顺序。

```java
public class Print12345_V2 {

    private static volatile int current = 1;
    private static final Object lock = new Object();

    static class PrintTask implements Runnable {
        @Override
        public void run() {
            synchronized (lock) {
                try {
                    int threadId = Integer.parseInt(Thread.currentThread().getName());

                    while (current != threadId) {
                        lock.wait();
                    }

                    System.out.print(threadId);
                    current++;
                    lock.notifyAll();

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public static void main(String[] args) {
        PrintTask task = new PrintTask();
        new Thread(task, "1").start();
        new Thread(task, "2").start();
        new Thread(task, "3").start();
        new Thread(task, "4").start();
        new Thread(task, "5").start();
    }
}
```

---

#### 写法2：单个线程循环打印 1-5（不需要多线程等待）

如果你只是想**顺序打印**，不需要 5 个线程，一个线程循环就行：

```java
public class Print12345_V3 {
    public static void main(String[] args) {
        new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                System.out.print(i);
            }
        }).start();
    }
}
```

---

#### 写法3：两个线程交替打印 12345（面试高频）

A 打 1、3、5，B 打 2、4，最终输出 12345：

```java
public class Print12345_V4 {

    private static volatile int current = 1;
    private static final Object lock = new Object();

    static class Task implements Runnable {
        private int start;

        public Task(int start) {
            this.start = start;
        }

        @Override
        public void run() {
            synchronized (lock) {
                try {
                    while (current <= 5) {
                        while (current % 2 != start) {
                            lock.wait();
                        }
                        if (current > 5) break;

                        System.out.print(current);
                        current++;
                        lock.notifyAll();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new Task(1)).start(); // 打印奇数
        new Thread(new Task(0)).start(); // 打印偶数
    }
}
```

---

#### 写法4：使用 CountDownLatch 控制启动顺序（高级写法）

让线程必须按 1→2→3→4→5 依次启动：

```java
import java.util.concurrent.CountDownLatch;

public class Print12345_V5 {

    static class Task implements Runnable {
        private int num;
        private CountDownLatch prev;

        public Task(int num, CountDownLatch prev) {
            this.num = num;
            this.prev = prev;
        }

        @Override
        public void run() {
            try {
                prev.await();
                System.out.print(num);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public static void main(String[] args) {
        CountDownLatch c1 = new CountDownLatch(0);
        CountDownLatch c2 = new CountDownLatch(1);
        CountDownLatch c3 = new CountDownLatch(1);
        CountDownLatch c4 = new CountDownLatch(1);
        CountDownLatch c5 = new CountDownLatch(1);

        new Thread(new Task(1, c1)).start(); c2.countDown();
        new Thread(new Task(2, c2)).start(); c3.countDown();
        new Thread(new Task(3, c3)).start(); c4.countDown();
        new Thread(new Task(4, c4)).start(); c5.countDown();
        new Thread(new Task(5, c5)).start();
    }
}
```
