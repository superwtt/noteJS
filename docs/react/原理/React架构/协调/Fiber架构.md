### Fiber
React16的Reconciler内部采用了Fiber架构。被称为Fiber Reconciler。

Fiber有三层含义：

1. 作为架构来说，在React15中，Reconciler采用递归的方式，数据保存在递归的调用栈中，所以被称为stack Reconciler。React16中的协调器是基于Fiber节点实现的，所以被称为Fiber Reconciler

2. 作为静态数据来说，每个RootFiber节点对应一个组件，保存了该组件对应的类型、dom节点等信息，这时的Fiber节点就称为虚拟DOM，JSX中的每一个节点都被称为Fiber节点，Fiber节点的类型有：
+ `Function Component`
+ 原生DOM节点对应的Fiber节点称为`HostComponent`
+ 文本对应的Fiber节点称为文本Fiber节点

这些Fiber节点之间通过child、sibling、return等属性连接

3. 作为动态的工作单元来说，Fiber节点保存了组件更新的状态以及需要执行的副作用
```javascript
// fiber节点的数据结构  react-reconciler/src/ReactFiber.js

// =========================作为静态数据start=========================
  this.tag = tag; // 组件对应的类型
  this.key = key; 
  this.elementType = null; // 大部分情况下与type相同
  
  this.type = null; // 对于函数组件来说 是函数本身；对于class组件来说，是class，
  // 对于HostComponent来说，是DOM节点的tagName
  
  this.stateNode = null;
 // =========================作为静态数据end=========================

 // ==========================Fiber 作为架构来说start=========================
 // return、child、sibling会将Fiber节点连接组成一棵Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0; // 代表插入DOM的索引
 // =========================Fiber 作为架构来说end=========================
  
  this.ref = null;

// 作为动态的工作单元来使用=====start
// 其中名称中带有effect的，代表副作用相关
// 对于HostComponent，副作用包括DOM节点的增删查改
// 对于function component，副作用代表我们使用的useEffect和useLayoutEffect
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.contextDependencies = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;
// =========================作为动态的工作单元来使用end=========================
```

---

### Fiber架构的工作原理
Fiber架构采用一种双缓存的工作机制：在内存中构建当前帧，替换上一帧的技术被称为双缓存
1. 首屏渲染前
当首次调用`ReactDOM.render`时，会创建整个应用的根节点`FiberRootNode`，每次调用`ReactDOM.render`时，都会创建当前应用的根节点`RootFiber`，并且`FiberRootNode`的`current`指向`RootFiber`，由于在首屏渲染之前，页面是空白的，所以`RootFiber`没有子节点


2. 首屏渲染
不管是首屏渲染，还是调用`this.setState`、`useState`、`update`创建的更新，都会从根节点开始创建一棵Fiber树。在两棵Fiber树（current fiber树和workInProgress树）之间，都存在的fiber节点会通过`alternate`属性连接，方便两个fiber节点之间共用一些的属性。

接下来采用深度优先遍历的方式模拟递归，创建整棵Fiber树

+ 流程1：刚刚创建完workInProgress Fiber树，此时内存中存在两棵Fiber树，两棵Fiber树之间都存在的fiber节点通过`alternate`属性连接

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/首屏渲染时.png)

---

+ 流程2：此时current指针指向了workInProgress Fiber树，workInProgress Fiber树就变成了current Fiber树。每个fiber节点之间通过`child`、`siblings`、`return`属性连接。

代表页面内容的Fiber树称为current Fiber树，由于触发更新创建的Fiber树称为workInProgress Fiber树

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/首屏渲染2.png)

---

3. 更新时
每次触发更新，都会重新创建一棵workInProgress树，此时current Fiber树上的节点`current RootFiber` 已经有`alternate`属性已经指向了一个`RootFiber`，所以在创建`workInProgress Fiber`时，会基于这个`RootFiber`来创建。

在本次更新中，除了`RootFiber`，App与p节点都有对应的`current fiber`存在，这种将`current fiber`与本次更新返回的JSX作对比，生成`workInProgress`的过程，就叫做diff算法。所以首屏渲染与更新最大的区别就在于，在更新的过程中，是否有diff算法

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/更新时.png)