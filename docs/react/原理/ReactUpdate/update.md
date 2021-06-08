### 触发更新
1. 在React中，有如下方法可以触发状态更新：
+ `ReactDOM.render`—— HostRoot
+ `this.setState`—— ClassComponent
+ `this.forceUpdate`—— ClassComponent
+ `useState`—— FunctionComponent
+ `useReducer`—— FunctionComponent

2. 这些方法调用的场景各不相同，他们是如何接入同一套状态更新机制的呢？

答案是：每次状态更新都会创建一个保存更新状态相关内容的对象，我们叫他`Update`，在render阶段的beginWork中会根据`Update`计算新的`state`

3. 由于不同类型组件工作方式不同，所以存在两种不同结构的`Update`，其中`ClassComponent`与`HostRoot`共用一套`Update`结构，`FunctionComponent`单独使用一种`Update`结构。
虽然他们的结构不同，但是他们的工作机制与工作流程大体相同

---

### Update的结构
```js
const update: Update<*> = {
   eventTime, // 任务的时机
   lane, // 优先级相关，不同update的优先级可能是不同的
   suspenseConfig,
   tag: UpdateState,  // 更新的类型，包括UpdateState、ReplaceState、ForceUpdate、CaptureUpdate
   payload: null, // 更新挂载的数据，不同类型组件挂载的数据不同。对于ClassComponent，payload为this.setState的第一个传参，对于HostRoot，payload为ReactDOM.render的第一个传参
   callback: null, // 更新的回调函数
   
   next: null // 与其他update连接形成的链表
}

```

---

### 流程
1. 触发状态更新，根据不同场景调用不同的方法，这些不同的方法触发的更新会拥有不同的优先级
2. 创建`Update`对象，对于`FunctionComponent`来说，就是在`dispatchAction`中创建`Update`对象
3. 从fiber到root，调用`markUpdateLaneFromFiberToRoot`，从触发更新的fiber一直向上遍历到`rootFiber`，并返回`rootFiber`，这样我们就得到了整个应用的根节点
4. 调度整个应用的根节点，调用的方法是`ensureRootIsScheduled`
5. 当调度的回调函数被执行时（调度的回调函数就是render阶段的起点），进入render阶段，在render阶段的`reconcile`函数中调用diff算法，会根据update对象返回对应的state，再用对应的state判断本次是否需要更新视图，如果需要被更新视图，就会被标记effectTag
6. 接下来进入`commit阶段`，标记了`effectTag`的fiber就会执行对应的视图更新

---

### Update的计算






















































### 更新流程
<!-- ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/更新流程.png) -->

---

### 参考链接
https://zhuanlan.zhihu.com/p/35801438


