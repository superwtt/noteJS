### 背景

上面两篇文章分别对应了首次渲染root不存在和第二次渲染root存在的两种情况。

初始化root之后，创建更新推入到更新队列中

然后进入调度流程，本篇讲的就是调度流程

---

### 为什么需要调度

1. 大家都知道JS引擎和渲染引擎是一个互斥的关系，如果js在执行代码，那么渲染引擎工作就会被停止。如果我们有一个很复杂的复合组件需要重新渲染，那么调用栈很可能会很长。
如果中间进行了复杂的操作，就可能导致长时间阻塞渲染引擎带来不好的用户体验，调度就是用来解决这个问题的。


2. React会根据任务的优先级去分配各自的`expirationTime`，在过期时间到来之前先去处理更高优先级的任务，并且高优先级的任务可以打断低优先级的任务，（因此会造成某些生命周期函数多次被执行），
从而实现在不影响用户体验的情况下去分段计算更新，也就是时间分片

---

### React如何实现调度
React实现调度主要靠两个内容：
1. 计算任务的`expriationTime`
2. 实现`requestIdleCallback`的polyfill版本

#### expirationTime
1. 如何计算的：
expirationTime = 当前时间+一个常量（根据任务的优先级改变）

常量指的是根据不同优先级得出的一个数值，React内部目前总共有五种优先级，分别为：
+ `var ImmediatePriority = 1`
+ `var UserBlockingPriority = 2`
+ `var NormalPriority = 3`
+ `var LowPriority = 4`
+ `var IdlePriority = 5`

它们各自对应的数值都是不同的，具体内容如下：
+ `var maxSigned31BitInt = 1073741823`

+ `var IMMEDIATE_PRIORITY_TIIMEOUT = -1` // time out immediately
+ `var USER_BLOCKING_PRIORITY_TIMEOUT = -1` 
+ `var NORMAL_PRIORITY_TIMEOUT = 250`
+ `var LOW_PRIORITY_TIMEOUT = 10000`
+ `var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt`

也就是说，假设当前时间为5000毫秒，并且分别有两个优先级不同的任务要执行。前者属于`ImmediatePriority`，后者属于`userBlockingPriority`，name两个任务计算出来的`expirationTime`分别为4999和5250.通过两者的时间对比大小可以得出谁的优先级高

---

#### requestIdleCallback













































https://yuchengkai.cn/react/2019-06-04.html#%E6%96%87%E7%AB%A0%E7%9B%B8%E5%85%B3%E8%B5%84%E6%96%99

https://zhuanlan.zhihu.com/p/103506207



