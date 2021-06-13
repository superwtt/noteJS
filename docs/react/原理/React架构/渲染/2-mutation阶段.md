### mutation阶段
 经过`before mutation`的准备阶段，`mutation阶段`是用来执行DOM操作的，类似`before mutation`阶段，也是遍历`effectList`，执行函数，这里执行的函数是`commitMutationEffects`

 ---

### 源码
源码目录：`react/src/react-reconciler/src/ReactFiberWorkLoop.old.js`

`commitMutationEffects`方法分为三部分：
1. 判断是否需要重置文本节点
2. 是否有ref的更新
3. 判断是否有插入DOM、更新属性、删除DOM、以及SSR相关

```js
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  while (nextEffect !== null) {
    setCurrentDebugFiberInDEV(nextEffect);

    const effectTag = nextEffect.effectTag;

    if (effectTag & ContentReset) { // 判断是否需要重置文本节点
      commitResetTextContent(nextEffect);
    }

    if (effectTag & Ref) {  // 是否有ref的更新
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
      if (enableScopeAPI) {
        // TODO: This is a temporary solution that allows us to transition away
        // from React Flare on www.
        if (nextEffect.tag === ScopeComponent) {
          commitAttachRef(nextEffect);
        }
      }
    }

    // 接下来就是最重要的工作  判断是否有插入DOM、更新属性、删除DOM、以及SSR相关
    const primaryEffectTag =
      effectTag & (Placement | Update | Deletion | Hydrating);
    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        nextEffect.effectTag &= ~Placement;

        // Update
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Hydrating: {
        nextEffect.effectTag &= ~Hydrating;
        break;
      }
      case HydratingAndUpdate: {
        nextEffect.effectTag &= ~Hydrating;

        // Update
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }

    resetCurrentDebugFiberInDEV();
    nextEffect = nextEffect.nextEffect;
  }
}
```

---

③ 首先执行`Placement`的effectTag，内部调用 `commitPlacement` 
源码目录：`react/packages/react-reconciler/src/ReactFiberCommitWork.js`


该方法所做的工作分为三步：
1. 获取父级DOM节点，其中`finishWork`为传入的`Fiber节点`
```js
const parentFiber = getHostParentFiber(finishedWork);
// 父级DOM节点
const parentStateNode = parentFiber.stateNode;
```

2. 获取`Fiber节点`的DOM兄弟节点
```js
const before = getHostSibling(finishedWork);
```

3. 根据DOM兄弟节点是否存在决定调用`parentNode.insertBefore`或`parentNode.appendChild`执行DOM插入操作。
最终调的是`insertBefore`和`appendChild`这两个方法的其中之一
```js
// parentStateNode是否是rootFiber
if (isContainer) {
  insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
} else {
  insertOrAppendPlacementNode(finishedWork, before, parent);
}
```

---

④ `Placement`的工作执行完了之后，如果有更新，会继续进入`PlacementAndUpdate`的流程，`PlacementAndUpdate`会先执行`Placement`流程的工作，然后执行`commitWork`

源码目录：`react/packages/react-reconciler/src/ReactFiberCommitWork.js`

```js
// 省略 这边就是DOM节点的操作
```


---

### 总结
这节我们学到，`mutation阶段`会遍历`effectList`，判断这些`effectTag`所包含的操作，其中就有判断文本节点是否需要更新、解绑还是更新ref、插入DOM节点、更新DOM节点、删除DOM节点等。

1. 插入DOM节点的函数：寻找父节点和子节点，判断是否存在子节点来调用`insertBefore`还是`appendChild`
2. 更新DOM节点：更新节点的属性
3. 删除DOM节点：寻找父节点，然后删除该节点