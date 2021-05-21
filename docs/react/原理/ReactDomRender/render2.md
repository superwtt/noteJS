### 背景

上面一篇文章是基于首次渲染root不存在的情况。本篇文章是基于root存在，会发生哪些流程

---

### 源码
源码目录：`src/react/packages/react-dom/src/client/ReactDOM.js`

① root存在的情况下，会走`root.render`流程。

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

④ `updateContainerAtExpirationTime`内部返回了`scheduleRootUpdate`，`scheduleRootUpdate`创建了一个`update`对象，`update`是一个链表结构，它上面的next属性可以帮助我们寻找下一个`update`，将`update`插入到`enqueueUpdate`队列中

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

⑤ `scheduleWork` 调度相关
