### 为什么要用redux

在React中，数据在组件中是单向流动的，数据可以通过props从一个方向父组件流向子组件，但是两个非父子组件之间通信就相对麻烦，redux的出现就是为了解决数据共享的问题

---

### 设计理念
1. Redux是将整个应用状态存储到一个地方称为store
2. 这个store里面保存了一棵状态树称为state tree
3. 组件改变state的唯一方法就是通过调用store的dispatch方法，触发一个action，这个action被对应的reducer处理，于是state完成更新
4.组件可以派发dispatch行为action给store，而不是直接通知其他组件
5.其他组件可以通过订阅store中的状态刷新自己的视图

---

### 流程图
