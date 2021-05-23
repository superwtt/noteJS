### 为什么要用redux

在React中，数据在组件中是单向流动的，数据可以通过props从一个方向父组件流向子组件，但是两个非父子组件之间通信就相对麻烦，redux的出现就是为了解决数据共享的问题，一个组件改变了store里的状态，其他组件就能自动感知

---

### 设计理念
1. Redux是将整个应用状态存储到一个地方称为store
2. 这个store里面保存了一棵状态树称为state tree
3. 组件改变state的唯一方法就是通过调用store的dispatch方法，触发一个action，这个action被对应的reducer处理，于是state完成更新
4.组件可以派发dispatch行为action给store，而不是直接通知其他组件
5.其他组件可以通过订阅store中的状态刷新自己的视图

---

### 流程图
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/redux流程.png)

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/redux流程手绘.png)

---

### Redux三大原则
1. store是唯一数据源
2. 状态是只读的，改变状态的唯一方法就是去触发一个action
3. reducer必须是纯函数，纯函数是指给固定输入就会有固定输出，而且不会有任何副作用

---

### Redux概念解析
1.store：保存数据的地方，你可以把它看成一个数据，整个应用只有一个store

2.state：state就是store里面存储的数据，store里面拥有多个state，Redux规定一个state对应一个view，只要state相同，view就相同

3.store.dispatch：它是view发出action的唯一方法

4.action：state的变化会导致view的变化，但是用户不能直接操作state，只能接触view触发action发出通知，修改state

5.reducer：用来描述action如何改变state，接收旧的state和action，返回新的state。store收到action以后，必须给出一个新的state，这样view才会发生变化，这种state的计算过程就叫做reducer

---

### 参考链接
[知乎](https://zhuanlan.zhihu.com/p/50247513)