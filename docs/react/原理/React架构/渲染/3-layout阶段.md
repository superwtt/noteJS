### Layout阶段

该阶段之所以称为`layout`，因为该阶段的代码都是在DOM渲染完成，即`mutation阶段`完成后执行的。该阶段触发的生命周期钩子和hook可以直接访问到已改变后的DOM，即该阶段是可以参与`DOM layout`的阶段。

与前两个阶段类似，`layout阶段`也是遍历`effectList`，执行函数

这个阶段会执行`commitLayoutEffects`这个方法

---

### 源码
源码目录：`react/src/react-reconciler/src/ReactFiberWorkLoop.old.js` 17.0.0

`commitLayoutEffects`里面最重要的就是执行`commitLayoutEffectOnFiber`方法。`commitLayoutEffectOnFiber`这个方法是`commitLifeCycles`的别名。

`commitLifeCycles`也是根据不同的fiber.tag，对不同类型的节点分别处理：

+ 对于`ClassComponent`，它会通过`current===null?` 区分是mount还是update，调用`componentDidMount`或者`componentDidUpdate`

+ 对于`FunctionComponent`及相关类型，它会调用`useLayoutEffect hook`的回调函数，调度`useEffect`的销毁与回调函数

```js
function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  switch (finishedWork.tag) {
    // Function component相关  执行commitHookEffectListMount
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
    case Block: {
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();

          // 针对的是useEffectLayout，会依次遍历并执行useEffectLayout的回调函数
          commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      }

      schedulePassiveEffects(finishedWork);
      return;
    }
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) { // current === Null  挂载时
          if (
            enableProfilerTimer &&
            enableProfilerCommitHooks &&
            finishedWork.mode & ProfileMode
          ) {
            try {
              startLayoutEffectTimer();
              instance.componentDidMount(); // 会执行componentDidMount这个生命周期
            } finally {
              recordLayoutEffectDuration(finishedWork);
            }
          } else {
            instance.componentDidMount();
          }
        } else {
          // current !== Null  
          const prevProps =
            finishedWork.elementType === finishedWork.type
              ? current.memoizedProps
              : resolveDefaultProps(finishedWork.type, current.memoizedProps);
          const prevState = current.memoizedState;
          if (
            enableProfilerTimer &&
            enableProfilerCommitHooks &&
            finishedWork.mode & ProfileMode
          ) {
            try {
              startLayoutEffectTimer();
              instance.componentDidUpdate(
                prevProps,
                prevState,
                instance.__reactInternalSnapshotBeforeUpdate,
              );
            } finally {
              recordLayoutEffectDuration(finishedWork);
            }
          } else {
            // 会执行componentDidUpdate这个生命周期
            instance.componentDidUpdate(
              prevProps,
              prevState,
              instance.__reactInternalSnapshotBeforeUpdate,
            );
          }
        }
      }

      // TODO: I think this is now always non-null by the time it reaches the
      // commit phase. Consider removing the type check.
      const updateQueue: UpdateQueue<
        *,
      > | null = (finishedWork.updateQueue: any);
      if (updateQueue !== null) {
        // We could update instance props and state here,
        // but instead we rely on them being set during last render.
        // TODO: revisit this when we implement resuming.
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostRoot: {
      // TODO: I think this is now always non-null by the time it reaches the
      // commit phase. Consider removing the type check.
      const updateQueue: UpdateQueue<
        *,
      > | null = (finishedWork.updateQueue: any);
      if (updateQueue !== null) {
        let instance = null;
        if (finishedWork.child !== null) {
          switch (finishedWork.child.tag) {
            case HostComponent:
              instance = getPublicInstance(finishedWork.child.stateNode);
              break;
            case ClassComponent:
              instance = finishedWork.child.stateNode;
              break;
          }
        }
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode;

      // Renderers may schedule work to be done after host components are mounted
      // (eg DOM renderer may schedule auto-focus for inputs and form controls).
      // These effects should only be committed when components are first mounted,
      // aka when there is no current/alternate.
      if (current === null && finishedWork.effectTag & Update) {
        const type = finishedWork.type;
        const props = finishedWork.memoizedProps;
        commitMount(instance, type, props, finishedWork);
      }

      return;
    }
    case HostText: {
      // We have no life-cycles associated with text.
      return;
    }
    case HostPortal: {
      // We have no life-cycles associated with portals.
      return;
    }
    case Profiler: {
      if (enableProfilerTimer) {
        const {onCommit, onRender} = finishedWork.memoizedProps;
        const {effectDuration} = finishedWork.stateNode;

        const commitTime = getCommitTime();

        if (typeof onRender === 'function') {
          if (enableSchedulerTracing) {
            onRender(
              finishedWork.memoizedProps.id,
              current === null ? 'mount' : 'update',
              finishedWork.actualDuration,
              finishedWork.treeBaseDuration,
              finishedWork.actualStartTime,
              commitTime,
              finishedRoot.memoizedInteractions,
            );
          } else {
            onRender(
              finishedWork.memoizedProps.id,
              current === null ? 'mount' : 'update',
              finishedWork.actualDuration,
              finishedWork.treeBaseDuration,
              finishedWork.actualStartTime,
              commitTime,
            );
          }
        }

        if (enableProfilerCommitHooks) {
          if (typeof onCommit === 'function') {
            if (enableSchedulerTracing) {
              onCommit(
                finishedWork.memoizedProps.id,
                current === null ? 'mount' : 'update',
                effectDuration,
                commitTime,
                finishedRoot.memoizedInteractions,
              );
            } else {
              onCommit(
                finishedWork.memoizedProps.id,
                current === null ? 'mount' : 'update',
                effectDuration,
                commitTime,
              );
            }
          }

          enqueuePendingPassiveProfilerEffect(finishedWork);

          let parentFiber = finishedWork.return;
          while (parentFiber !== null) {
            if (parentFiber.tag === Profiler) {
              const parentStateNode = parentFiber.stateNode;
              parentStateNode.effectDuration += effectDuration;
              break;
            }
            parentFiber = parentFiber.return;
          }
        }
      }
      return;
    }
    case SuspenseComponent: {
      commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
      return;
    }
    case SuspenseListComponent:
    case IncompleteClassComponent:
    case FundamentalComponent:
    case ScopeComponent:
    case OffscreenComponent:
    case LegacyHiddenComponent:
      return;
  }
  invariant(
    false,
    'This unit of work tag should not have side-effects. This error is ' +
      'likely caused by a bug in React. Please file an issue.',
  );
}

```

---

### 总结
`useLayoutEffect`与`useEffect`的区别：

1.`useLayoutEffect hook`从上一次更新的销毁函数调用到本次更新的回调函数调用是同步执行的。

2. 而`useEffect`则需要先调度，在`commit阶段`完成后再异步执行

`componentWillUnMount`会在`mutation阶段`执行。此时，`current Fiber树`还指向前一次更新的`Fiber树`，在生命周期钩子内获取的DOM还是更新前的

`componentDidMount`和`componentDidUpdate`会在`layout阶段`执行。此时`current Fiber`树已经指向更新后的Fiber树，在生命周期钩子内获取的DOM就是更新后的

```js
// React17.0.1 packages->react-reconciler->src->ReactFiberWorkLoop.old.js
function commitRootImpl(root, renderPriorityLevel) {
  // 省略
 if (
   // 如果包含useEffect的effectTag
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();// 在beforemutation阶段异步调度这个函数，这个方法会执行useEffect的回调函数
        return null;
      });
    }
  }
 
  // 省略
}

```
+ `scheduleCallback`这个方法，会以一个优先级来异步执行`flushPassiveEffects`这个函数
+ <font style="color:blue">如果一个`FunctionComponent`存在`useEffect`，并且这个`useEffect`的回调函数需要被触发的情况下，那么这个`useEffect`会在commit阶段的`before mutation`阶段先以normal的优先级调度`flushPassiveEffects`，而整个commit阶段是同步执行的，所以`useEffect`回调函数的执行是在commit阶段完成以后再异步执行的</font>
+ `useLayoutEffect`在`commit`阶段的`mutation`阶段，会执行`useLayoutEffect`在上一次的销毁函数，而在`Layout`阶段，会先依次遍历并执行所有`useLayoutEffect`的`create`创建函数。所以`useEffectLayout`函数在`commit阶段`会先执行所有的销毁函数，接下来再依次执行所有的回调函数，这些步骤都是同步执行的

+ <font style="color:red">`useLayoutEffect`会在commit阶段的mutation阶段和layout阶段，依次同步执行销毁和创建函数；而`useEffect`会在before mutation阶段先异步调度`flushPassiveEffects`函数，在layout阶段注册销毁函数以及本次的回调函数，在整个commit阶段完成以后，flushPassiveEffects函数才会被执行，在这个函数内部，会遍历在layout阶段注册的销毁函数和回调函数，并依次执行</font>
+ 可以看到，`useLayoutEffect`会在mutation阶段和layout阶段依次同步执行销毁函数和回调函数，而`useEffect`会在整个commit阶段完成之后再异步执行所有的销毁函数和创建函数

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/useEffect和useLayoutEffect.png)


---

### 调度、协调、渲染的流程
调度（让每个任务分片执行）
协调 把JSX->React element->Fiber节点->Fiber树->虚拟DOM树->DOM树
渲染 根据Fiber节点上的effectTag对DOM树做增删改插入的操作，并执行相应的生命周期函数 


















---

