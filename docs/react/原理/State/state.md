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
> + concurrent模式：`ReactDOM.createRoot(rootNode).render(<App />)`，目前正在实验中，未来稳定之后，打算作为React默认的开发模式

简单来说，React这么多模式，是基于渐进的迁移策略考虑，未来concureent模式将会是默认模式。

但是当前大多数app应用都是legacy模式，无法直接迁移到concurrent模式，强制迁移会出现很多无法修复的错误。
blocking模式作为concurrent模式的降级版本。

从长远来看，模式的数量是会收敛，我们无需考虑不同的模式

---

### legacy模式-目前大多数React应用的模式下 setState的表现
```javascript

```