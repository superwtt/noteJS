### 触发更新
在React中，有如下方法可以触发状态更新：
+ `ReactDOM.render`—— HostRoot
+ `this,setState`—— ClassComponent
+ `this.forceUpdate`—— ClassComponent
+ `useState`—— FunctionComponent
+ `useReducer`—— FunctionComponent

这些方法调用的场景各不相同，他们是如何接入同一套状态更新机制的呢？

答案是：每次状态更新都会创建一个保存更新状态相关内容的对象，我们叫他`Update`，在render阶段的beginWork中会根据`Update`计算新的`state`

---


