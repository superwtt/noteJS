### “递”阶段update时的beginWork工作

### 源码
源码目录：`react/packages/react-reconciler/src/ReactFiberBeginWork.js`
```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {

  // update时：如果current存在可能存在优化路径，满足一定条件时，可以复用current（即上一次更新的Fiber节点）
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;

    if (
      oldProps !== newProps || // 新旧props的变化
      hasLegacyContextChanged() ||
      (__DEV__ ? workInProgress.type !== current.type : false)
    ) {
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false;
      switch (workInProgress.tag) {
        // 省略处理
      }
      // 如果可以复用
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes,
      );
    } else {
      didReceiveUpdate = false;
    }
  } else {
    didReceiveUpdate = false;
  }

  // 如果不可以复用  则跟mount时一样：根据tag不同，创建不同的子Fiber节点
  switch (workInProgress.tag) {
    
  }
}
```
+ `didReceiveUpdate`表示，在本次更新中，当前fiber节点是否有变化
+ `bailoutOnAlreadyFinishedWork`最终会执行`cloneChildFibers`
+ `cloneChildFibers`会执行`createWorkInProgress`方法，`createWorkInProgress`会创建一个新的fiber节点或者复用已有的fiber节点，最终返回一个`workInProgress节点`，这个节点就会作为当前fiber节点的child

---

### 总结
"递"阶段的mount和update最大的不同在于
1. 在`beginWork`开始的时候，会判断`current===null?`来决定是否进入一个优化逻辑，如果命中了优化逻辑（<code style="color:red">根据先后的props和type判断</code>）则会进入`bailoutOnAlreadyFinishedWork`，在这个函数中会直接执行`createWorkInProgress`创建对应的子fiber节点
2. 如果没有命中这个优化逻辑，则会继续走不通fiber.tag节点的update逻辑(跟mount直接进入一样)，在不同的update逻辑中又会进入`reconcileChildren`，在这个函数中会将current fiber节点与传入的jsx作对比，将对比的结果返回
