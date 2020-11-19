### state异步

初次写React，常常被state的异步困扰，所以打算记录下来

---

#### state是什么
1. 定义：React把组件看成一个状态机，通过与用户的交互，实现不同的状态，然后渲染UI，让界面和用户操作保持一致。React里，只需要更新组件的state，然后根据新的state重新渲染界面，不需要操作DOM。
2. 说明：state顾名思义就是状态，它只是用来控制这个组件的状态，我们可以用state来完成对行为的控制、数据的更新、界面的渲染，由于组件不能修改传入的props，所以需要记录自身的数据变化

---

#### setState
state的更新需要用到setState

用法：

1. 当我们调用这个方法时，React就会更新组件的状态，并且重新调用render方法，然后再把render方法所渲染的最新内容展示到界面上
2. React不会马上修改state，而是把这个对象放到一个更新队列里面，稍后才会从队列当中，把新的状态提取出来合并到state中，然后再触发组件的更新

---

#### 源码解析

---

#### 如何获取到最新的state
1. 回调
```javascript
this.setState({count:this.state.count+1},()=>{
    console.log(this.state.count)
})
```
回调里的state是最新的，原因是该回调的执行时机在于state合并处理之后

2. prevState
```javascript
this.setState(prevState=>{count:prevState.count+1})
```

---

#### setState不是真正的异步
那么以上4种方式调用setState()，后面紧接着去取最新的state，按之前讲的异步原理，应该是取不到的。然而，setTimeout中调用以及原生事件中调用的话，是可以立马获取到最新的state的。根本原因在于，setState并不是真正意义上的异步操作，它只是模拟了异步的行为。React中会去维护一个标识（isBatchingUpdates），判断是直接更新还是先暂存state进队列。setTimeout以及原生事件都会直接去更新state，因此可以立即得到最新state。而合成事件和React生命周期函数中，是受React控制的，其会将isBatchingUpdates设置为 true，从而走的是类似异步的那一套。

---

#### state与props

区别：
1. props用于定义外部接口，state用于记录内部状态
2. props的赋值在于外部使用组件，state的赋值在于组件内部
3. 组件不应该修改props的值，而state就是用来让组件修改的

---

#### 参考链接
[知乎-good](https://zhuanlan.zhihu.com/p/28905707)




