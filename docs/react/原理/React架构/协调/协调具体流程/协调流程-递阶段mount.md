### “递”阶段mount时的beginWork工作
当`beginWork`工作完成时，页面就会有一棵完整的Fiber树

### 源码
源码目录：`react/packages/react-reconciler/src/ReactFiberBeginWork.js`

#### 传参
```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
 // ...省略函数体   
```

其中传参：
+ current: 当前组件对应的`Fiber节点`在上一次更新时的`Fiber节点`，即`workInProgress.alternate`
+ workInProgress: 当前组件对应的`Fiber节点`
+ renderLanes: 优先级相关

从<code style="color:blue">双缓存机制一节</code>我们知道，组件`mount`时，由于是首次渲染，是不存在当前组件对应的`Fiber节点`在上一次更新时的`Fiber节点`的，即`mount`时 `current === null`

组件`update`时，由于之前已经`mount`过，所以`current!==null`。我们可以通过`current === null?`来区分是`mount`还是`update`

基于此原因，`beginWork`的工作可以分为两部分：
+ `update`时，如果`current`存在，满足一定条件时可以复用`current`节点，这样就能克隆`current.child`作为`workInProgress.child`，而不需要新建`workInProgress.child`
+ `mount`时，除`fiberRootNode`以外，`current === null`，会根据`fiber.tag`的不同，创建不同类型的`子Fiber节点`

---

#### update时
下一节

---

#### mount时
深度优先遍历，新建当前`Fiber`节点的`子Fiber节点`，<code style="red">传入当前节点创建当前节点的子节点，这样其实可以形成一个树状结构</code>

根据`fiber.tag`的不同，进入不同类型`Fiber`的创建逻辑，创建`子Fiber节点`

```javascript
// mount时：根据tag不同，创建不同的Fiber节点
switch (workInProgress.tag) {
  case IndeterminateComponent: 
    // ...省略
  case LazyComponent: 
    // ...省略
  case FunctionComponent: 
    // ...省略
  case ClassComponent: 
    // ...省略
  case HostRoot:
    // ...省略
  case HostComponent:
    return updateHostComponent(current, workInProgress, renderExpirationTime); // 以HostComponent为例
  case HostText:
    // ...省略
  // ...省略其他类型
}

// 以HostComponent为例
function updateHostComponent(current, workInProgress, renderExpirationTime) {
  pushHostContext(workInProgress);

  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }
  // 初始化属性
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  
  // 当前节点是否只有一个文本节点 如果只有一个文本节点，将不会给这个文本节点创建文本fiber节点
  if (isDirectTextChild) {
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    workInProgress.effectTag |= ContentReset;
  }

  // 关键  执行完reconcileChildren之后就会生成workInProgress.child=header
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;


// 生成新的子fiber节点，将子节点赋值给workInProgress.child
// reconcileChildFibers会为生成的Fiber节点打上effectTag属性，而mountChildFibers不会
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
) {
  // 挂载时
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
   // 更新时   
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}

```
+ 不论走哪个逻辑，最终都会生成新的`子Fiber节点`并赋值给`workInProgress.child`，作为本次`beginWork`的返回值

+ `mountChildFibers`与`reconcileChildFibers`这两个方法的基本逻辑一致，唯一的区别是`reconcileChildFibers`会为生成的`Fiber`节点带上`effectTag`属性，而`mountChildFibers`不会

---

### effectTag

render工作是在内存中进行的，当工作结束后会通知`Renderer`渲染器需要执行的DOM操作。

要执行的DOM操作的具体类型就保存在`fiber.effectTag`中

---

### beginWork流程图

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/beginWork.png)