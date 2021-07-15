### 定义
React17.0开始支持concurrent mode，这种模式的根本目的是为了让应用保持cpu和io的快速响应，它是一组新功能，包括Fiber、Scheduler、Lane，可以根据用户硬件性能和网络状况调整应用的响应速度，核心就是为了实现异步可中断的更新，concurrent mode也是未来React主要迭代的方向

+ CPU: 让耗时的reconciler过程能让出js的执行权给更高优先级的任务，例如用户的输入
+ IO: 依靠Suspense

---

### Fiber
React15之前的reconcile是同步执行的，当组件数量很多，reconciler时的计算量很大时，就会出现页面的卡顿，为了解决这个问题就需要一套异步可中断的更新来让耗时的计算让出js的执行权给高优先级的任务，在浏览器有空闲的时候再执行这些计算。所以我们需要一种数据结构来描述真实dom和更新的信息，在适当的时候可以在内存中中断reconciler的过程，这种数据结构就是fiber

Fiber和Virtual DOM的区别：
（1）Fiber是一种工作单元，里面保存了组件对应的类型、指向子节点、父节点、兄弟节点的指针，还有代表副作用相关的指针

（2）Virtual DOM是用js的对象来模拟DOM元素的一种结构，仅仅是描述了dom的类型、属性、文本、子节点等内容，没有fiber那么多的含义

---

### 使用
```js
import ReactDOM from "react-dom";

// 不是concurrent模式
ReactDOM.render(<App />,document.getElementById('root'));

// 开启concurrent模式
ReactDOM.unstable_createRoot(
   document.getElementById('root') 
).render(<App />)
```