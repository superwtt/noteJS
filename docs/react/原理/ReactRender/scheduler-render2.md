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

③ `updateContainer` 计算了两个时间

+ `currentTime`是指从React初始化到现在经过了多少时间

+ `expirationTime` 更新的超时时间，和优先级有关，值越大，优先级越高，指的是任务的过期时间，React根据任务的优先级和当前时间计算出一个任务的执行截止时间。只要这个值比当前时间大就可以一直让React延后这个任务的执行，以便让更高优先级的任务先执行，但是一旦过了任务的截止时间，就必须让这个任务马上执行

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

④ `updateContainerAtExpirationTime`内部返回了`scheduleRootUpdate`，`scheduleRootUpdate`创建了一个`update`对象，`update`是一个链表结构，它上面的next属性可以帮助我们寻找下一个`update`，不管你是`setState`还是`ReactDOM.render`造成的React更新，都会生成一个`update`对象，将`update`插入到`enqueueUpdate`队列中,然后进入`scheduleWork`任务调度阶段

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
  scheduleWork(current, expirationTime); // 进入任务的调度阶段

  return expirationTime;
}
```

⑤`scheduleWork`是任务调度阶段，React会根据任务的优先级去分配各自的`expirationTime`，在过期时间到来之前先去处理更高优先级的任务，并且高优先级的任务可以打断低优先级的任务。主要做了以下几步：
+ 找到当前`fiber`的root
+ 给更新节点的父节点链上的每个节点的`expirationTime`设置为这个`update`的`expirationTime`，除非它本身的时间要小于`expirationTime`
+ 给更新节点的父节点链上的每个节点的`childExpirationTime`设置为这个`update`的`expirationTime`，除非它本身的时间要小于`expirationTime`

```javascript
function scheduleWork(fiber: Fiber, expirationTime: ExpirationTime) {
  // debugger
  const root = scheduleWorkToRoot(fiber, expirationTime);
  if (root === null) {
    if (__DEV__) {
      switch (fiber.tag) {
        case ClassComponent:
          warnAboutUpdateOnUnmounted(fiber, true);
          break;
        case FunctionComponent:
        case ForwardRef:
        case MemoComponent:
        case SimpleMemoComponent:
          warnAboutUpdateOnUnmounted(fiber, false);
          break;
      }
    }
    return;
  }

  // 1.0 isWorking表示是否正在工作，在开始render和commit阶段都是true
  // 2.0 nextRenderExpirationTime 是在新的renderRoot的时候会被设置为当前任务的expirationTime，而且一旦被设置，只有当下次任务是NoWork的时候才会被再次设置为NoWork，最开始也是NoWork
  // 这个判断条件的意思是：目前没有任务在执行，并且之前有过执行任务，同时当前的任务比之前执行的任务过期时间要早，也就是优先级要高
  // 这种情况出现在什么时候呢？上一个任务是异步任务，优先级很低，超时时间是502ms，并且上一个时间片（初始时间是33ms）任务没有执行完，而且等待下一次requestIdleCallback的时候
  // 新任务进来了，那么优先级就变成了了先执行当前任务，也就意味着上一个任务被打断了
  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    // This is an interruption. (Used for performance tracking.)
    interruptedBy = fiber;
    resetStack();
  }
  markPendingPriorityLevel(root, expirationTime);
  if (
   // 要么没有work阶段，要么只能在render阶段，不能处于commit阶段
    !isWorking ||
    isCommitting ||

    nextRoot !== root
  ) {
    const rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }
  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0;
  }
}
```


⑥ 上一步符合条件之后就进入`requestWork`，最终都要调用`performWork`,`performWork`之后进入`performWorkOnRoot `，随后进入`renderRoot `，再进入`workLopp`,`workLoop`判断是否需要继续调用`performUnitOfWork`，然后进入`beginWork`,`beginWork`相当于“递归”阶段的“递”阶段
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

=================================================以上是render阶段===================================================

---

=================================================开始commit阶段=====================================================

⑦ `completeWork`，源码目录`src/react/packages/react-reconciler/src/ReactFiberCompleteWork.js`，进入`commitRoot`方法，提交所有的生命周期方法`commitAllLifeCycles`，包含了调用`componentDidMount`方法。发生在“递归”阶段的“归”阶段，分为`update`和`mount`阶段，`mount`阶段主要包括三个逻辑：
+ 为Fiber节点生成对应的DOM节点
+ 将子孙节点插入刚生成的DOM节点中
+ 与update逻辑中的updateHostComponent类似处理props的过程
+ 在commit的过程中会调用`didMount`类的生命周期钩子
+ 页面是先展示了dom，才打印`componentDidMount`方法的

源码目录`src/react/packages/react-reconciler/src/ReactFiberScheduler.js`
```javascript
function completeRoot(
  root: FiberRoot,
  finishedWork: Fiber,
  expirationTime: ExpirationTime,
): void {
  //...
  runWithPriority(ImmediatePriority, () => {
    commitRoot(root, finishedWork);
  });
}
```

⑧ 完整调用链：
`ReactDOM.render` -> 
`legacyRenderSubtreeIntoContainer` -> 
`root.render`=`ReactRoot.prototype.render` -> 
`updateContainer` -> 
`updateContainerAtExpirationTime` -> 
`scheduleRootUpdate` -> 
`scheduleWork(current, expirationTime)` -> 
`requestWork` -> 
`performWorkOnRoot` -> 
`renderRoot` -> 
`workLoop(isYieldy)` -> 
`performUnitOfWork` -> 
`beginWork` -> `switch (workInProgress.tag) {}`=》`ClassComponent`
`updateClassComponent` -> 
`constructClassInstance`，`mountClassInstance` -> 
