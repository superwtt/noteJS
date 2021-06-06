### before mutation阶段

`before mutation`阶段会执行`commitBeforeMutationEffects`

`commitBeforeMutationEffects`这个函数会做三件事情：
+ 跟DOM组件的blur和focus相关的操作
+ 执行`commitBeforeMutationEffectOnFiber`，在这个方法中会执行`getSnapshotBeforeUpdate`这个生命周期函数
+ 如果当前Fiber节点的`effectTag`中，包含了passive，也就是`FunctionComponent`中`useEffect`对应的effectTag，那么就需要调度`flushPassiveEffects`函数

---
1. 跟DOM组件的blur和focus相关的操作先忽略

2. `commitBeforeMutationEffectOnFiber`方法的执行

`commitBeforeMutationEffectOnFiber`这个方法是`commitBeforeMutationLifeCycles`的别名

在这个方法中，会判断Fiber节点的tag类型，对于`ClassComponent`来说，如果包含了`getSnapshotBeforeUpdate`这个生命周期包含的`effectTag`，那么就会通过Fiber节点的stateNode,取到对应的`React Component`的实例，并且调用实例上的`getSnapshotBeforeUpdate`方法。

所以我们知道，`getSnapshotBeforeUpdate`是在`before mutation`阶段调用的，此时页面还没有产生任何可变的更新


3. 如果当前Fiber节点的`effectTag`中，包含了passive

如果一个Function Component包含了useEffect需要执行，会在`before mutation阶段`先以`Normal`的优先级调度，flushPassiveEffects是用来执行useEffect的，被放在了回调函数中，是等整个commit阶段执行完了才去异步执行的，