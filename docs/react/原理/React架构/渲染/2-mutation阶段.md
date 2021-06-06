### mutation阶段
`mutation阶段`的主要工作是根据`effectTag`调用不同的处理函数处理`Fiber`

mutation阶段在`commitMutationEffects`这个方法中执行

判断是否有`Placement`插入DOM节点、`Update`更新DOM节点、`Deletion`删除DOM节点等effectTag。根据不同的effectTag处理不同的逻辑

以`Placement effectTag`为例，`Placement effectTag`意味着该Fiber节点对应的DOM节点需要插入到页面中，调用的方法为`commitPlacement`

该方法内部会获取父节点和兄弟节点，因为插入的操作只有两种`inserBefore`和`appendChild`,根据是否存在兄弟节点和父节点决定调用`inserBefore`还是`appendChild`

插入完成之后调用`commitWork`方法

对于`HostComponent`来说，还会调用`commitUpdate`方法

`mutation阶段`会遍历包含`effectTag`节点的链表，判断这些链表包含的`effectTag`，对这些`effectTag`执行对应的操作，其中包括了：重置文本节点，解绑ref以及更新ref等相关的操作，还有插入DOM节点、更新DOM节点、删除DOM节点和SSR相关的操作