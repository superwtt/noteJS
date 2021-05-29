### 背景

上面两篇文章分别对应了首次渲染root不存在和第二次渲染root存在的两种情况。以及后续的render、commit流程

这边补充一下调度流程

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
1.定义：React调度算法与`requestIdleCallback`这个api息息相关，`requestIdleCallback`的作用是，在浏览器一帧剩余空闲时间内执行优先度相对较低的任务，用法如下：

```javascript
var taskNum = 10000
requestIdleCallback(unImportWork)

function unImportWork(deadline){
   while(deadline.timeRemaining()&&taskNum > 0){
     console.log(`执行了${10000 - tasksNum + 1}个任务`)
     tasksNum--
   } 
   if(taskNum>0){ // 在未来帧中继续执行
     requestIdleCallback(unImportWork)   
   }
}
```

2.缺点：`requestIdleCallback`的FPS只有20，一般FPS为60时，对用户来说是流畅的，这远远低于页面流畅度的要求，所以React需要自己手动实现

3.如何实现：`requestAnimationFrame + 计算帧时间以及下一帧时间 + MessageChannel`

+ 如何弥补`requestIdleCallback`的不足，能多次在浏览器空闲时且是渲染后才调用回调方法？说到多次执行，那么肯定得使用定时器了。在多种定时器中，唯有`requestAnimationFrame`具备一定的精确度，因此`requestAnimationFrame`就是当下实现`requestIdleCallback`的一个步骤。`requestAnimationFrame`的回调会在每次重绘之前执行

+ 使用`requestAnimationFrame`只是实现了多次执行这一步操作，那么如何计算当前帧是否还有剩余时间让我们使用呢？假设当前时间为5000，浏览器支持60帧，那么1帧接近16毫秒，那么就会计算出下一帧的时间为5016.得出下一帧的时候以后，我们只需要对比当前时间是否小于下一帧时间即可，这样就能清楚地知道是否还有空闲时间去执行任务

+ 如何在渲染以后才会执行任务？使用事件循环的知识

---

### 总结
+ 首先每个任务都有各自的优先级，通过当前时间加上优先级所对应的常量我们可以计算出`expriationTime`，高优先级的任务会打断低优先级的任务

+ 在调度之前，判断当前任务是否过期，过期的话无须调度，直接调用`post.postMessage(undefind)`，这样就能在渲染后马上执行过期任务了

+ 如果任务没有过期，就通过`requestAnimationFrame`启动定时器，在重绘前调用回调方法

+ 在回调方法中，我们首先需要计算每一帧的时间以及下一帧的时间，然后执行`post.postMessage(undefined)`

+ `channel.port1.onmessage`会在渲染后被调用，在这个过程中，我们首先需要先去判断当前时间是否小于下一帧时间。如果小于的话就代表我们尚有空余时间去执行任务；如果大于的话就代表当前帧已经没有空闲时间了，这个时候我们需要去判断是否有任务过期，过期的话不管三七二十一一定还是得去执行这个任务。如果没有过期的话，只能把这个任务丢到下一帧看看能不能执行了