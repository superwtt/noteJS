### “归”阶段mount时的completeWork工作
当`completeWork`工作完成时，页面就会有一棵完整的DOM树

### 源码
源码目录：`react/packages/react-reconciler/src/ReactFiberCompleteWork.js`

类似`beginWork`，`completeWork`也是针对`fiber.tag`调用不同的处理逻辑

```javascript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      // ...省略
      return null;
    }
    case HostRoot: {
      // ...省略
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // ...省略
      return null;
    }
  // ...省略
```

我们重点关注页面渲染所必须的`HostComponent`，即原生DOM组件对应的fiber节点

---

### update时

见下一节

---

### mount时

`mount`时的主要逻辑包括三个：
+ 为`Fiber节点`生成对应的DOM节点
+ 将子孙DOM节点插入刚生成的DOM节点中`appendAllChildren`
+ 与update逻辑中的`updateHostComponent`类似的处理内部属性props如class、src、alt等等 和 DOM事件的监听，然后通过setAttribute属性添加到dom上
+ 在即将发生的`commit`阶段中，是如何通过一次插入DOM操作，将整棵DOM树插入页面的呢？
  + 原因就在于`completeWork`中的`appendAllChildren`方法
  + 由于`completeWork`属于归阶段调用的函数，每次调用`appendAllChildren`时都会将已生成的子孙DOM节点插入到当前生成的DOM节点下，那么当“归”到`rootFiber`时，我们已经有一个构建好的DOM树

```javascript
// mount的情况

// ...省略服务端渲染相关逻辑

const currentHostContext = getHostContext();
// 为fiber创建对应DOM节点
const instance = createInstance(
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
    workInProgress,
  );
// 将子孙DOM节点插入刚生成的DOM节点中
appendAllChildren(instance, workInProgress, false, false);
// DOM节点赋值给fiber.stateNode
workInProgress.stateNode = instance;

// 与update逻辑中的updateHostComponent类似的处理props的过程
// 初始化DOM对象的事件监听器和内部属性
// 然后setAttibute给DOM节点添加这些属性
if (
  finalizeInitialChildren(
    instance,
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
  )
) {
  markUpdate(workInProgress);
}


// createInstance
// react-dom/src/client/ReactDOMHostConfig.js
export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): Instance {
  let parentNamespace: string;
  // ...省略
  const domElement: Instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  );
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
}

```

其中，为`Fiber节点`生成对应的`DOM节点`是通过调用`createInstance`方法创建的，`createInstance`方法底层是调用`document.createElement`方法

---

### effectList
作为DOM操作的依据，`commit阶段`需要找到所有的`effectTag`的`Fiber节点`并依次执行`effectTag`对应的操作，难道需要在`commit阶段`再次遍历Fiber树寻找`effectTag !== null`的`Fiber节点`？

这显然是低效率的

为了解决这个问题，在`completeWork`的上层函数`completeUnitOfWork`中，每个执行完的`completeWork`且存在`effectTag`的`Fiber`节点会被保存在一条名为`effectList`的单向链表中
这样，在`commit阶段`只需要遍历这个`effectList`就能执行所有的`effect`了

---


### completeWork流程图

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/completeWork.png)