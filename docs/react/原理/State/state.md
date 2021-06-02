### 背景
面试常常会被问到，setState到底是同步还是异步的？

---

### 答案

1. 在legacy模式中，命中了`batchedUpdates`时是异步，未命中`batchedUpdates`时是同步
2. concurrent模式中，都是异步的

---

### React的模式
我们可以从[React官网](https://zh-hans.reactjs.org/docs/concurrent-mode-adoption.html#why-so-many-modes)看到关于React模式的解释：
> + legacy模式：通过`ReactDOM.render(<App/>,rootNode)`创建的应用。这是当前React app使用的方式
> + blocking模式：`ReactDOM.createBlockingRoot(rootNode).render(<App />)`创建的应用属于blocking模式，目前正在实验中，作为迁移到concurrent模式的第一个步骤
> + concurrent模式：`ReactDOM.createRoot(rootNode).render(<App />)`，目前正在实验中，未来稳定之后，打算作为React默认的开发模式，更新是有优先级并且可以打断的

简单来说，React这么多模式，是基于渐进的迁移策略考虑，未来concureent模式将会是默认模式。

但是当前大多数app应用都是legacy模式，无法直接迁移到concurrent模式，强制迁移会出现很多无法修复的错误。
blocking模式作为concurrent模式的降级版本。

从长远来看，模式的数量是会收敛，我们无需考虑不同的模式

---

### legacy模式-目前大多数React应用的模式下 setState的表现
```javascript
class LegacySetState extends React.Component{
   constructor(){
      super(props)
      this.state = {
         num:1 
      } 
   } 
   updateNum = () => {
      
      // 方式1-------------------
      console.log("before setState ",num) 
      this.setState({num: this.state.num+1}) 
      console.log("after setState ",num) 

     // 方式2-------------------
     // setTimeout(()=>{
        // this.setState({num: this.state.num+1}) 
        // console.log("after setState ",num) 
     // },0)
   }
   render(){
     const { num } = this.state;
     console.log("Class render ",num)  
     return <p onClick={this.updateNum}>click me {num}</p>  
   }
}
```

#### 结果
方式一：

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/1-1.png)

方式二：

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/1-2.png)

#### 分析
1. 方式一的打印结果我们发现，setState是异步更新的
2. 方式二的打印结果我们发现，setState是同步更新的


#### 源码
源码目录：<code>https://github.com/facebook/react/blob/17.0.1/packages/react-reconciler/src/ReactFiberWorkLoop.new.js</code>

1. 方式一中，legacy模式下，setState的异步更新，是基于React源码中的性能优化特性：`batchedUpdates`，即多个setState会被合并成一个更新，减少性能开销，假如一次setState就触发一个完整的更新流程，那么每一次setState的调用都会触发一次re-render，我们的视图很可能没刷几次就卡死了。

```javascript
export function batchedUpdates<A, R>(fn: A => R, a: A): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;  // 将全局变量executionContext加上批量更新的flag
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
  }
}
```

##### 解析
1. 首先`batchedUpdates`方法，会将一个全局变量`executionContext`打上`BatchedContext`批处理标签，进来先锁上，将这个变量变成true，标明当前"正处于批量更新流程中"。当被“锁上”时，任何需要更新的组件都只能暂时进入`dirtyComponents`里排队等候下一次批量更新
2. 执行fn，fn指的就是这边的`updateNum`方法，执行完之后，将`BatchedContext`从`executionContext`中去除，执行完再放开
3. 当我们执行`updateNum`这个方法时，包含了一个被打了批量更新标签的全局变量`executionContext`，React内部会判断，如果这次更新中，`executionContext`包含了`BatchedContext`，它就会认为这是一次批处理
4. 批处理中触发的多次更新都会被合并成一个更新，并且异步执行

---

##### 如何跳出batchedUpdates呢
1. 如果我们触发的fn中`this.setState`这一步是异步执行的，那么等`this.setState`执行的时候，我们全局的`executionContext`已经不存在`BatchedContext`了。因为`batchedUpdates`在执行完fn之后会重置`executionContext`
2. 所以我们只要将`this.setState`放到`setTimeout`中，将`this.setState`这个操作变成异步执行，此时全局的变量中已经不存在`BatchedContext`这个flag。因为这个标识对`setTimeout`里面的代码没有任何的管控能力
3. 当不存在这个flag时，React源码中，有一个函数`scheduleUpdateOnFiber`，每次调度更新都会执行这个函数
  + 源码目录：<code>https://github.com/facebook/react/blob/17.0.1/packages/react-reconciler/src/ReactFiberWorkLoop.old.js</code>
4. 当上下文什么都没有的情况下，我们会同步的执行这次更新。当我们用`setTimeout`触发`this.setState`，就会进入`executionContext === NoContext`触发同步的更新
  + 我们用`ReactDOM.render`创建出来的应用叫做同步的优先级,要进入`if (executionContext === NoContext)`的前提是`if (lane === SyncLane)`，也就是说当前更新的优先级是同步的优先级
  + 而用concurrent模式下的优先级是异步的优先级，即使`this.setState`被异步包裹了，状态的更新也是异步的
5. `setTimeout`、`setInterval`、直接在DOM上绑定原生事件，都不会进入React的这个调度流程，这种情况下都是同步的。但是同步也代表着DOM的同步更新，也就意味着如果你多次setState，会导致多次更新，这是毫无意义且浪费性能的
5. 总结：这道题目对于不同模式下的应用答案是不一样的  

```javascript
export function scheduleUpdateOnFiber(){
    //...
    if (lane === SyncLane) {
         // ....
         if (executionContext === NoContext) {
        // Flush the synchronous work now, unless we're already working or inside
        // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
        // scheduleCallbackForFiber to preserve the ability to schedule a callback
        // without immediately flushing it. We only do this for user-initiated
        // updates, to preserve historical behavior of legacy mode.
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
   }
}

```

---

##### 如何获取最新的state呢
1. 回调函数callback
```javascript
this.setState({
  val: this.state.val+1
},()=>{
  console.log(this.state.val)
})
```

2. componentDidUpdate
```javascript
componentUpdate(){
  console.log(this.state.val)
}
```

3. 将`setState`放在`setTimeout`中
```javascript
let that = this;
setTimeout(()=>{
  that.setState({val:that.state.val+1})
  console.log(that.state.val)
})
```

---

### 什么是合成事件
1. 定义：React为了解决跨平台、兼容性问题，自己封装了一套事件机制，代理了原生事件。在JSX中，常见的`onClick`、`onChange`都是合成事件
2. 目的：
 + 进行浏览器兼容，实现更好的跨平台
3. 与原生事件的区别 


#### 参考链接
[Good](https://mp.weixin.qq.com/s/my2Jx7pcbVYnaCWklAzKXA)