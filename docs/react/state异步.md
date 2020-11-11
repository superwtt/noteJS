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

#### state与props

---

#### 参考链接
[知乎-good](https://www.zhihu.com/question/66749082/answer/246217812)
[知乎](https://zhuanlan.zhihu.com/p/28905707)




