### “归”阶段update时的completeWork工作

### 源码
源码目录：`react/packages/react-reconciler/src/ReactFiberCompleteWork.js`

```javascript
if (current !== null && workInProgress.stateNode != null) { // 该Fiber节点是否存在对应的DOM节点
  // update的情况 与beginWork阶段的updateHostComponent是不一样的
  updateHostComponent(
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  );
}

// updateHostComponent中最重要的就是调用`prepareUpdate`这个方法
// prepareUpdate最终会返回diffProperties
// diffProperties遍历lastProps（本次更新开始之前的props）和nextProps（本次更新的props），对比props的新增、删除、更新
// 区分style、children、dangerouslyInnerHtml
// react-dom/src/client/ReactDOMComponent.js


```

`updateHostComponent`作用是diff props，返回一个需要更新的属性名称组成的数据，被处理完的props会以数组形式[key1,valu1,key2,value2]赋值给`workInProgress.updateQueue`，最终交给`commitRoot`进入`commit阶段`