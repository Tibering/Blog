---
title: Create Thread
createTime: 2026/04/02 13:42:06
permalink: /blog/ywc41n41/
tags:
  - J.U.C
---

### Java 创建线程方式一：继承 Thread 类

```java
// 1. 继承 Thread 类
public class MyThread extends Thread {
    // 2. 重写 run() 方法，线程核心逻辑
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }
    // 测试方法
    public static void main(String[] args) {
        // 3. 创建线程对象
        MyThread thread1 = new MyThread();
        MyThread thread2 = new MyThread();

        // 4. 调用 start() 启动线程（不是调用 run()）
        thread1.start();
        thread2.start();
    }
}
```

### Java 创建线程方式二：实现 Runnable 接口

```java
// 1. 实现 Runnable 接口
public class MyRunnable implements Runnable {
    // 2. 重写 run() 方法，封装线程任务
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
    }
    public static void main(String[] args) {
        // 3. 创建任务对象
        MyRunnable task = new MyRunnable();
        // 4. 创建线程对象，传入任务
        Thread thread1 = new Thread(task, "线程1");
        Thread thread2 = new Thread(task, "线程2");

        // 5. 启动线程
        thread1.start();
        thread2.start();
    }
}
```

### Java 创建线程方式三：实现 Callable 接口 + FutureTask

```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

// 1. 实现 Callable 接口，指定返回值类型（这里是 Integer）
public class MyCallable implements Callable<Integer> {

    // 2. 重写 call() 方法：带返回值、可抛异常
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
            System.out.println(Thread.currentThread().getName() + "：" + i);
        }
        return sum; // 返回结果
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 3. 创建 Callable 任务对象
        MyCallable callable = new MyCallable();

        // 4. 创建 FutureTask 包装 Callable
        FutureTask<Integer> futureTask = new FutureTask<>(callable);

        // 5. 传入 Thread 并启动线程
        new Thread(futureTask, "计算线程").start();

        // 6. 获取线程执行结果（阻塞等待线程完成）
        Integer result = futureTask.get();
        System.out.println("线程执行结果：" + result);
    }
}
```

### Java 创建线程方式四：使用线程池（ExecutorService）

```java
import java.util.concurrent.*;

public class ThreadPoolTest {
    public static void main(String[] args) throws ExecutionException, InterruptedException {

        // 1. 创建线程池（标准7大参数）
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(
                2,               // 核心线程数
                5,               // 最大线程数
                2L,              // 空闲线程存活时间
                TimeUnit.SECONDS,// 时间单位
                new ArrayBlockingQueue<>(10), // 任务队列
                Executors.defaultThreadFactory(), // 线程工厂
                new ThreadPoolExecutor.AbortPolicy() // 拒绝策略
        );

        // 2. 提交 Runnable 任务（无返回值）
        threadPool.execute(() -> {
            System.out.println(Thread.currentThread().getName() + " 执行Runnable任务");
        });

        // 3. 提交 Callable 任务（有返回值）
        Future<String> future = threadPool.submit(() -> {
            Thread.sleep(1000);
            return Thread.currentThread().getName() + " 执行Callable任务，返回结果";
        });

        // 获取结果
        System.out.println(future.get());

        // 4. 关闭线程池（项目结束时执行）
        threadPool.shutdown();
    }
}
```
