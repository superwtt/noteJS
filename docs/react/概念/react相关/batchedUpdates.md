### batchedUpdates
`batchedUpdates`是React的批处理机制.React中多次的setState操作会被合并成一次操作

---

```js
export function batchedUpdates(fn){
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext; // 将一个全局变量打上批处理的标签 进来先默认是批处理
  try{
    return fn(a)
  } finally{
    executionContext = prevExecutionContext;// React又会将这个变量重置
    if(prevExecutionContext === NoContext){
      resetRenderTimer();
      flushSyncCallbackQueue(); // 触发更新的方法
    }
  }
}
```
解析：
+ React源码中的性能优化特性`batchedUpdates`：多次`setState`会被合并成一个，并且是异步执行
+ 当我们触发了多个`this.setState`，React只会将多次触发合并成一次，减少性能的开销。如果一次`setState`就触发一个完整的更新流程触发一次re-render，那么页面没几次就卡死了
+ `batchedUpdates`方法，会将一个全局变量打上批处理的标签，进来先锁上，将这个变量变成true，表示：当前正处于批量更新中。当被“锁上”时，任何需要更新的组件只能暂时进入`dirtyComponent`队列中等待更新
+ 如果想要跳出批量更新的机制，那么就需要将setState放到异步调用的函数当中，等待`batchedUpdates`方法执行完再去执行。

```js
class App extends React.Component{
  
  handleClick = ()=>{
    setTimeout(()=>{
      this.setState();
      this.setState();
      this.setState();
    })
  }
  
  render(){
    return (
      <div onClick={this.handleClick}>点击事件</div>
    )
  }
}

```
这样虽然能跳出批量更新的机制，但是依旧会多次触发render方法，这样的话，当我们触发了多次更新，让页面re-render，页面没几次就卡死了

可见，老版本的React批处理更新 是存在诸多限制的

---

