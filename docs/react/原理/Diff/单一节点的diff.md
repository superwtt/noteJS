### 单一节点的diff流程
1. 什么是单一节点：一级只存在一个节点
```javascript
<div> // div就是单一节点
  <p key="ka">ka</p>
  <h3 key="song">song</h3>
</div>
```

2. 整体工作流程：

最终一定会产生两个结果之一：
+ 新生成一个`Fiber节点`并返回
+ 将上次更新的`Fiber`节点的副本作为本次新生成的`Fiber`节点并返回