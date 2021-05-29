### 背景

上面一篇文章是基于首次渲染root不存在的情况。本篇文章是基于root存在，包括首次不存在root，创建完root之后，会发生哪些流程

---

### 两个流程
React内部有两个阶段：
1. render阶段：指的是react从RootFiber开始循环生成fiber树的过程叫render过程，这个阶段不涉及浏览器的渲染
2. commit阶段：真正做dom操作的阶段，首先会从RootFiber上拿到上一步render阶段生成的那条链表，链表上是所有发生了更新的fiber对象。然后commit阶段走了三个循环
 + 第一个循环是为了执行`getSnapshotBeforeUpdate`生命周期
 + 第二个循环是从链表上拿到每个`fiber`，然后从`fiber`上读取真实的dom进行更新
 + 第三个循环是执行`didMount`等生命周期

---

### 源码
源码目录：`src/react/packages/react-dom/src/client/ReactDOM.js`

① 当root首次创建成功之后会走`root.render`流程；本身root存在的情况下，也会走`root.render`流程。

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
    // 不存在root的情况
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
        // 创建完了走root.render
        root.render(children, callback);
      }
    });
  } else {
    // ...
    // Update
    if (parentComponent != null) {
      // ... 一般不会存在parentCompoent组件，也就是在root的外部再套一层context
    } else {
      root.render(children, callback); // ReactRoot.prototype.render
    }
  }
  return getPublicRootInstance(root._internalRoot);
}
```

② `ReactRoot.prototype.render`这个流程中，我们取出已知的root，这里的root指的就是`_internalRoot`属性的值`FiberRoot`

```javascript
ReactRoot.prototype.render = function(
  children: ReactNodeList,
  callback: ?() => mixed,
): Work {
  const root = this._internalRoot;
  const work = new ReactWork();
  callback = callback === undefined ? null : callback;
  if (__DEV__) {
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  updateContainer(children, root, null, work._onCommit);
  return work;
};
```

③ `updateContainer` 计算了两个时间，用于后续的更新

+ `currentTime`是指从React初始化到现在经过了多少时间

+ `expirationTime`和优先级有关，值越大，优先级越高，指的是任务的过期时间，React根据任务的优先级和当前时间计算出一个任务的执行截止时间。只要这个值比当前时间大就可以一直让React延后这个任务的执行，以便让更高优先级的任务先执行，但是一旦过了任务的截止时间，就必须让这个任务马上执行

```javascript
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  const current = container.current;
  const currentTime = requestCurrentTime();
  const expirationTime = computeExpirationForFiber(currentTime, current);
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  );
}
```

④ `updateContainerAtExpirationTime`内部返回了`scheduleRootUpdate`，`scheduleRootUpdate`创建了一个`update`对象，`update`是一个链表结构，它上面的next属性可以帮助我们寻找下一个`update`，将`update`插入到`enqueueUpdate`队列中,然后进入`scheduleWork`调度阶段

```javascript
function scheduleRootUpdate(
  current: Fiber,
  element: ReactNodeList,
  expirationTime: ExpirationTime,
  callback: ?Function,
) {
  const update = createUpdate(expirationTime);
  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    warningWithoutStack(
      typeof callback === 'function',
      'render(...): Expected the last optional `callback` argument to be a ' +
        'function. Instead received: %s.',
      callback,
    );
    update.callback = callback;
  }

  flushPassiveEffects();
  enqueueUpdate(current, update); // 插入到更新队列
  scheduleWork(current, expirationTime);

  return expirationTime;
}
```

⑤ `scheduleWork`-`beginWork` ，源码目录`src/react/packages/react-reconciler/src/ReactFiberScheduler.js`，随着调用链，内部进入`workLoop`，然后进入`beginWork`，`beginWork`的工作是传入当前fiber节点，创建子fiber节点，发生在“递归”阶段的“递”阶段
```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {

  // update时：如果current存在可能存在优化路径，可以复用current（即上一次更新的Fiber节点）
  if (current !== null) {
    // ...省略

    // 复用current
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderLanes,
    );
  } else {
    didReceiveUpdate = false;
  }

  // mount时：根据tag不同，创建不同的子Fiber节点
  switch (workInProgress.tag) {
    case IndeterminateComponent: 
      // ...省略
    case LazyComponent: 
      // ...省略
    case FunctionComponent: 
      // ...省略
    case ClassComponent:      //  内部调用updateClassComponent，updateClassComponent内部会执行constructor和componentWillMount阶段  ins.componentWillMount()
      // ...省略
    case HostRoot:
      // ...省略
    case HostComponent:
      // ...省略
    case HostText:
      // ...省略
    // ...省略其他类型
  }
}
```


⑥ `scheduleWork`-`completeWork`，源码目录`src/react/packages/react-reconciler/src/ReactFiberCompleteWork.js`，发生在“递归”阶段的“归”阶段，分为`update`和`mount`阶段，`mount`阶段主要包括三个逻辑：为Fiber节点生成对应的DOM节点、将子孙节点插入刚生成的DOM节点中、与update逻辑中的updateHostComponent类似处理props的过程

⑦ render阶段完成，进入`commitRoot`方法，提交所有的生命周期方法`commitAllLifeCycles`，包含了调用`componentDidMount`方法

⑧ 页面是先展示了dom，才打印`componentDidMount`方法的

⑨ 完整调用链：

ReactDOM.render -> 
legacyRenderSubtreeIntoContainer -> 
root.render=ReactRoot.prototype.render -> 
updateContainer -> 
updateContainerAtExpirationTime -> 
scheduleRootUpdate -> 
scheduleWork(current, expirationTime) -> 
requestWork -> 
performWorkOnRoot -> 
renderRoot -> 
workLoop(isYieldy) -> 
performUnitOfWork -> 
beginWork -> switch (workInProgress.tag) {}=》ClassComponent
updateClassComponent -> 
constructClassInstance，mountClassInstance -> 

completeRoot
