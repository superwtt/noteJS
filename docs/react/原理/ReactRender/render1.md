### 渲染流程
React的渲染流程可以概括为：
`JSX -> createElement函数 -> 这个函数帮我们创建ReactElement对象 -> ReactDOM.render函数 -> 映射到浏览器的真实DOM`


### ReactDOM.render
1. 作用：用于将模板转换成HTML语言，渲染DOM，并插入到指定的DOM节点中
2. 用法示例：`ReactDOM.render(<App />, document.getElementById('root'));`
3. 编译后会调用`createElement`方法
```javascript
ReactDOM.render(
  React.createElement(App),  
  document.getElementById('root')
);
```

---

### 疑问
1. `React.createElement`方法如何实例化react组件
2. `ReactDOM.render`方法如何转换成真实的dom

---

### 流程
`ReactDOM.render`步骤大致可以分为三步：
1. 创建`ReactRoot`，这是包含了整个React应用的顶点的对象
2. 创建`FiberRoot`和`RootFiber`
3. 创建更新

---

### 源码
源码目录：`src/react/packages/react-dom/src/client/ReactDOM.js`

① 首先执行`ReactDOM.render`，顺着render进去，调用`legacyRenderSubtreeIntoContainer`

```javascript
const ReactDOM: Object = {
  // ...
  render(
    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  ) {
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    );
}
```

② `legacyRenderSubtreeIntoContainer` 顾名思义，legacy模式下render子树到container容器里，用来初始化container。

container是dom实例，第一次渲染肯定没有`_reactRootContainer`，所以`root=container._reactRootContainer`被赋值给了`legacyCreateRootFromDOMContainer(container, )`

```javascript
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  
  let root: Root = (container._reactRootContainer: any);
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    // Initial mount should not be batched.
    unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  }
  return getPublicRootInstance(root._internalRoot);
}
```

③ `legacyCreateRootFromDOMContainer`里面return了`new ReactRoot`

```javascript
function legacyCreateRootFromDOMContainer(
  container: DOMContainer,
  forceHydrate: boolean,
): Root {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // First clear any existing content.
  if (!shouldHydrate) {
    let warned = false;
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  // Legacy roots are not async by default.
  const isConcurrent = false;
  return new ReactRoot(container, isConcurrent, shouldHydrate);
}
```

④ `ReactRoot`是一个类，`new ReactRoot` 返回一个root实例，而这个实例就是`{ _internalRoot: xxx }`

```javascript
function ReactRoot(
  container: DOMContainer,
  isConcurrent: boolean,
  hydrate: boolean,
) {
  const root = createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}
ReactRoot.prototype.render = function(): Batch {};
ReactRoot.prototype.unmount = function(): Batch {};
ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function(): Batch {};
ReactRoot.prototype.createBatch = function(): Batch {};
```

⑤ `createContainer` 内部return了 `createFiberRoot`，`createFiberRoot`就是返回了一个`fiberRoot`节点。

所以上一步其实就是`{ _internalRoot: createFiberRoot(xxx,xxx,xxx) }`。

换句话说，我们`ReactDOM.render`传进去的第二个参数就是`ReactRoot`也就是`root`，`root`就是一个对象`{ _internalRoot: createFiberRoot(xxx,xxx,xxx) }`

也就是说`ReactRoot`其实就是一个对象，这个对象有个`_internalRoot`属性，这个属性的值就是`createFiberRoot`里返回的这个root，也就是`FiberRoot`

最终的算式是这样的：

`root` = `{ _internalRoot: FiberRoot }`

```javascript
export function createFiberRoot(
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  const uninitializedFiber = createHostRootFiber(isConcurrent);

  let root;
  if (enableSchedulerTracing) {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,
     //...
    }: FiberRoot);
  } else {
    root = ({
      current: uninitializedFiber,
      containerInfo: containerInfo,
      //...
    }: BaseFiberRootProperties);
  }

  uninitializedFiber.stateNode = root;
  return ((root: any): FiberRoot);
}
```

⑥ `FiberRoot`就是一个对象，里面有一堆属性

```javascript
root = ({
  current: uninitializedFiber,
  containerInfo: containerInfo,
  pendingChildren: null,
  pingCache: null,
  earliestPendingTime: NoWork,
  latestPendingTime: NoWork,
  earliestSuspendedTime: NoWork,
  latestSuspendedTime: NoWork,
  latestPingedTime: NoWork,
  // ...
})
```

⑦ `createFiberRoot`内部执行了`const uninitializedFiber = createHostRootFiber(isConcurrent);`，顾名思义，React企图用一个叫做“创建主要的RootFiber”的函数生成一个`uninitializedFiber`未初始化的Fiber节点。然后将root的current属性指向这个Fiber节点

可以看出，`createHostRootFiber`返回的结果，就是`RootFiber`。

这个`FiberNode`类就是React中用来创建每一个fiber的工厂。React里不管是dom节点还是一个class或者一个函数组件，都会对应一个fiber对象。

每个fiber数据结构的属性都是代表什么意思，可以看[这里](https://github.com/y805939188/simple-react/tree/master/procedure/%E6%BA%90%E7%A0%81%E9%98%85%E8%AF%BB/fiber2)

一个`ReactElement`就是一个`fiber`对象


```javascript
export function createHostRootFiber(isConcurrent: boolean): Fiber {
  let mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext;
  if (enableProfilerTimer && isDevToolsPresent) {
    mode |= ProfileMode;
  }
  return createFiber(HostRoot, null, null, mode);
}
```

```javascript
const createFiber = function(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): Fiber {
  // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
  return new FiberNode(tag, pendingProps, key, mode);
};
```

```javascript
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

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
  // ...
}
```

⑧ 整理一下

1. `ReactRoot`就是所谓的`container._reactRootContainer `，也就是

```javascript
{
  _internalRoot: FiberRoot,
}
```

2. `FiberRoot`就是一个对象，是整个应用的起点，包含应用挂载的目标节点，记录整个应用更新的信息

```javascript
{
   tag: 0,
   current: uninitializedFiber, // 一个未初始化的fiber
   finishedWork: null, // ReactDOM.render的第二个参数
   finishedWork: null, // 最终要生成的fiber树
   // ...
}
```

3. `RootFiber`也就是这个`FiberRoot.current`指向的`uninitializedFiber`，是这么一个对象：

```javascript
{
   tag: 3, // HostRoot类型，其他还有class类型，函数类型等
   stateNode: FiberRoot, // stateNode表示当前fiber的实例，也就是说当前fiber对象是由FiberRoot   创建的
   // ...
}
```

4. `ReactRoot`、`FiberRoot`、`RootFiber`三者之间的关系：
 + React上来不管三七二十一，先往`ReactDOM.render`的第二个参数也就是我们真实的dom上，挂载了`ReactRoot`，也就是`_reactRootContainer`

 + 然后这个`ReactRoot`上的`_internalRoot`属性，指向了`FiberRoot`

 + 而`FiberRoot` 的current属性又指向了`RootFiber`，之后`RootFiber`的`stateNode`属性又指回了`FiberRoot`

5. 为什么这么设计，涉及到React底层和Fiber调度算法的设计。

React内部有两个阶段，一个是`render`阶段，用来生成fiber树，一个是`commit`阶段，用来操作真正的dom以及执行生命周期


---
### 参考链接
[very Good](https://www.zhihu.com/question/361787198)

[Good](https://segmentfault.com/a/1190000020064411)
