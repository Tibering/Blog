---
title: Elementary Sorts
createTime: 2026/03/31 23:43:57
permalink: /blog/p6j1z7oo/
---

### 冒泡排序

相当于每次把一个最大（最小）的元素放到数组最后，所以要预留空间 i-1 i-2 ... n - 1，比较的方式是两两交换。因为要交换 N - 1 次，所以外层循环为`i < n - 1`。

其中，我们在操作是将最后一个预留出来，相当于确定了最后一个位置 n - 1。这个既是未操作数组的length，也是需要填充数组的下标，而且我们只需要 j + 1就可以访问它。为什么？因为 j 为 [0, n - 1)，同时保证了j + 1不会越界，然后数组边界使用`n - 1 -i`从后面缩小。而j + 1 就是这个数组的长度，并且是第二个子序列的第一个下标。

```java
public static void sort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        // j 从 0 开始
        for (int j = 0; j < n - 1 - i; j++) {
            // 比较 j 和 j+1，而不是 j-1
            if (a[j] > a[j + 1]) {
                swap(a, j, j + 1);
            }
        }
    }
}

private static void swap(int[] a, int i, int j) {
    int t = a[i];
    a[i] = a[j];
    a[j] = t;
}
```

---

### 选择排序

相当于每次在未排序区间里找到最小（或最大）的元素，把它放到已排序区间的末尾。
整个过程只需要每次确定一个位置，所以外层循环执行 n-1 次就够了，最后一个元素自然有序。
我们用 i 标记当前要确定的位置，在内层循环里从 i+1 到末尾扫描，记录最小值下标，最后只交换一次，而不是两两频繁交换。

```java
public static void sort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        // 在未排序区间找最小值
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minIndex]) {
                minIndex = j;
            }
        }
        // 交换到当前 i 位置
        swap(a, i, minIndex);
    }
}

private static void swap(int[] a, int i, int j) {
    int t = a[i];
    a[i] = a[j];
    a[j] = t;
}
```

---

### 插入排序

相当于把数组分成「已排序部分」和「未排序部分」，每次取未排序的第一个元素，向前插入到已排序部分的合适位置。
因为是逐个插入，所以从第二个元素开始处理，每一步只和前面的元素比较、交换，直到找到不大于它的元素为止。
内层 j 从 i 开始不断左移，保证 j 不会越界，同时 j-1 始终是合法的前一个下标。

```java
public static void sort(int[] a) {
    int n = a.length;
    for (int i = 1; i < n; i++) {
        // 当前要插入的元素
        for (int j = i; j > 0 && a[j] < a[j - 1]; j--) {
            swap(a, j, j - 1);
        }
    }
}

private static void swap(int[] a, int i, int j) {
    int t = a[i];
    a[i] = a[j];
    a[j] = t;
}
```

---

### 希尔排序

希尔排序是插入排序的改进版，它不再是相邻比较，而是按一定 \\ 步长（gap）\\ 分组，对每组做插入排序；
然后逐步缩小步长，直到步长为 1，变成普通插入排序。
因为前期已经让数组基本有序，最后一步插入会非常快。
步长通常从 n/2 开始，每次减半，边界控制和插入排序类似，j - gap 保证不会越界。

```java
public static void sort(int[] a) {
    int n = a.length;
    // 步长 gap 不断缩小
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // 对每个分组做插入排序
        for (int i = gap; i < n; i++) {
            for (int j = i; j >= gap && a[j] < a[j - gap]; j -= gap) {
                swap(a, j, j - gap);
            }
        }
    }
}

private static void swap(int[] a, int i, int j) {
    int t = a[i];
    a[i] = a[j];
    a[j] = t;
}

```

---

### 快速排序

区间为闭区间

#### 1. 标准快速排序（原版）

```java
public class Quick {

    public static void sort(Comparable[] a) {
        // 打乱数组，防止最坏情况（很重要）
        StdRandom.shuffle(a);
        sort(a, 0, a.length - 1);
    }

    private static void sort(Comparable[] a, int lo, int hi) {
        if (hi <= lo) return;
        // 切分
        int j = partition(a, lo, hi);
        // 递归左右
        sort(a, lo, j - 1);
        sort(a, j + 1, hi);
    }

    // 切分函数（你贴的那段原版）
    private static int partition(Comparable[] a, int lo, int hi) {
        int i = lo, j = hi + 1;
        Comparable v = a[lo];  // 基准 = 第一个元素
        while (true) {
            // 左指针向右找 >= v
            while (less(a[++i], v)) if (i == hi) break;
            // 右指针向左找 <= v
            while (less(v, a[--j])) if (j == lo) break;
            if (i >= j) break;
            exch(a, i, j);
        }
        // 基准放到 j 位置
        exch(a, lo, j);
        return j;
    }

    // 比较
    private static boolean less(Comparable v, Comparable w) {
        return v.compareTo(w) < 0;
    }
    // 交换
    private static void exch(Comparable[] a, int i, int j) {
        Comparable t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
```

---

#### 2. 优化版快排（面试/工程常用）

优化点：

1. **小数组用插入排序**（递归开销大）
2. **三项取中法选基准**（避免 O(n²)）
3. 保留随机打乱防止最坏情况

```java
public class QuickOptimized {
    // 小数组阈值
    private static final int INSERTION_SORT_CUTOFF = 8;
    public static void sort(Comparable[] a) {
        StdRandom.shuffle(a);
        sort(a, 0, a.length - 1);
    }

    private static void sort(Comparable[] a, int lo, int hi) {
        // 小数组直接插入排序
        if (hi <= lo + INSERTION_SORT_CUTOFF) {
            insertionSort(a, lo, hi);
            return;
        }
        // 三项取中，把中位数放到 lo 作为基准
        int mid = median3(a, lo, lo + (hi - lo) / 2, hi);
        exch(a, lo, mid);
        int j = partition(a, lo, hi);
        sort(a, lo, j - 1);
        sort(a, j + 1, hi);
    }

    // 三项取中
    private static int median3(Comparable[] a, int i, int j, int k) {
        return (less(a[i], a[j]) ?
                (less(a[j], a[k]) ? j : less(a[i], a[k]) ? k : i) :
                (less(a[k], a[j]) ? j : less(a[k], a[i]) ? k : i));
    }
    // 切分函数不变
    private static int partition(Comparable[] a, int lo, int hi) {
        int i = lo, j = hi + 1;
        Comparable v = a[lo];
        while (true) {
            while (less(a[++i], v)) if (i == hi) break;
            while (less(v, a[--j])) if (j == lo) break;
            if (i >= j) break;
            exch(a, i, j);
        }
        exch(a, lo, j);
        return j;
    }

    // 插入排序
    private static void insertionSort(Comparable[] a, int lo, int hi) {
        for (int i = lo + 1; i <= hi; i++) {
            for (int j = i; j > lo && less(a[j], a[j - 1]); j--) {
                exch(a, j, j - 1);
            }
        }
    }

    private static boolean less(Comparable v, Comparable w) {
        return v.compareTo(w) < 0;
    }

    private static void exch(Comparable[] a, int i, int j) {
        Comparable t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
```

---

#### 3. 三向切分快排（应对大量重复元素）

书里叫 **Quick3way**，专门解决重复值多导致性能退化问题：
把数组分成 **< v | == v | > v** 三部分

```java
public class Quick3Way {

    public static void sort(Comparable[] a) {
        StdRandom.shuffle(a);
        sort(a, 0, a.length - 1);
    }
    private static void sort(Comparable[] a, int lo, int hi) {
        if (hi <= lo) return;
        int lt = lo, gt = hi;
        Comparable v = a[lo];
        int i = lo + 1;
        while (i <= gt) {
            int cmp = a[i].compareTo(v);
            if (cmp < 0) exch(a, lt++, i++);
            else if (cmp > 0) exch(a, i, gt--);
            else i++;
        }
        // a[lo..lt-1] < v = a[lt..gt] < a[gt+1..hi]
        sort(a, lo, lt - 1);
        sort(a, gt + 1, hi);
    }
    private static void exch(Comparable[] a, int i, int j) {
        Comparable t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
}
```

---

#### 回到你最关心的问题：

**基准确实是数组第一个元素 `a[lo]`**
最后和 `j` 交换完全正确，因为：

- 循环结束时 **j 指向最后一个小于基准的元素**
- 交换后基准正好落在正确位置
- 这是算法4原版设计，**没有任何问题**
