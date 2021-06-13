### before mutation 阶段

`before mutation阶段`的代码很短，整个流程就是遍历`effectList`并调用`commitBeforeMutationEffects`

---

### 源码

源码目录: `react/packages/react-reconciler/src/ReactFiberWorkLoop.old.js`  17.0.0

① `before mutation` 阶段调用的是`commitBeforeMutationEffects`，这个函数一共会做三件事：

+ 跟DOM组件的blur和focus相关的操作，我们可以先不用关注
+ 执行`commitBeforeMutationEffectOnFiber`这个方法，这个方法里面会执行`getSnapshotBeforeUpdate`这个生命周期
+ 如果当前`Fiber节点`包含了passiveEffectTag，也就是`FunctionComponent`中的`useEffect`对应的effect，那么就需要PassiveEffects的回调函数，调度`useEffect`

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;

    if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) { // DOM组件的blur和focus相关
      if ((nextEffect.effectTag & Deletion) !== NoEffect) {
        if (doesFiberContain(nextEffect, focusedInstanceHandle)) {
          shouldFireAfterActiveInstanceBlur = true;
          beforeActiveInstanceBlur();
        }
      } else {
        // TODO: Move this out of the hot path using a dedicated effect tag.
        if (
          nextEffect.tag === SuspenseComponent &&
          isSuspenseBoundaryBeingHidden(current, nextEffect) &&
          doesFiberContain(nextEffect, focusedInstanceHandle)
        ) {
          shouldFireAfterActiveInstanceBlur = true;
          beforeActiveInstanceBlur();
        }
      }
    }

    const effectTag = nextEffect.effectTag;
    if ((effectTag & Snapshot) !== NoEffect) {
      setCurrentDebugFiberInDEV(nextEffect);

      commitBeforeMutationEffectOnFiber(current, nextEffect);

      resetCurrentDebugFiberInDEV();
    }
    if ((effectTag & Passive) !== NoEffect) {
      // If there are passive effects, schedule a callback to flush at
      // the earliest opportunity.
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalSchedulerPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

---

② `commitBeforeMutationEffectOnFiber`是`commitBeforeMutationLifecycles`的别名 
源码目录: `react/packages/react-reconciler/src/ReactFiberCommitWork.old.js`  17.0.0

在这个方法中，会判断fiber节点的tag类型

对于`ClassComponent`来说，如果当前fiber节点包含了`Snapshot`的`effectTag`，那么就会获取ReactComponent实例，调用实例上的`getSnapshotBeforeUpdate`生命周期.
所以`getSnapshotBeforeUpdate`是在`before mutation`阶段调用的，此时页面还没有产生可见的更新

```js
function commitBeforeMutationLifeCycles(
  current: Fiber | null,
  finishedWork: Fiber,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectList(UnmountSnapshot, NoHookEffect, finishedWork);
      return;
    }
    case ClassComponent: {
      if (finishedWork.effectTag & Snapshot) {
        if (current !== null) {
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');
          const instance = finishedWork.stateNode; // 获取ReactComponent实例
          
          // 调用实例上的`getSnapshotBeforeUpdate`生命周期
          const snapshot = instance.getSnapshotBeforeUpdate(
            finishedWork.elementType === finishedWork.type
              ? prevProps
              : resolveDefaultProps(finishedWork.type, prevProps),
            prevState,
          );
          
          instance.__reactInternalSnapshotBeforeUpdate = snapshot;
          stopPhaseTimer();
        }
      }
      return;
    }
    case HostRoot:
    case HostComponent:
    case HostText:
    case HostPortal:
    case IncompleteClassComponent:
      // Nothing to do for these component types
      return;
    default: {
      invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
          'likely caused by a bug in React. Please file an issue.',
      );
    }
  }
}

```

---

### 总结

通过本节学习，我们知道了在`before mutation`阶段，会遍历`effectList`，依次执行：
1. 处理DOM节点渲染/删除后的`autoFocus`、`blur`逻辑
2. 调用`getSnapShotBeforeUpdate`生命周期钩子
3. 调度`useEffect`