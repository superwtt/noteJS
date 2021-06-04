

### 调和过程的两个阶段
React的调和过程分为两个阶段：`RenderRoot`和`CompleteRoot`。第一个阶段又称为render阶段，主线是构建workInProgress Fiber节点树，准备好线性任务链effect list。在这个阶段的最后，workInProgress Fiber tree会变为finishedWork fiber tree，以finishedWork属性挂载到FiberRoot对象里，供第二个阶段使用，第二个阶段又称为commit阶段，主要目标是根据线性任务链完成finishedWork Fiber节点树中记录的任务，实现UI的更新

1.Render阶段（renderRoot）
+ render阶段以一个fiber节点为单元，采用递归的方式，实现workInProgress树的快速搭建。搭建过程中还会实现如下功能：
  + 更新state和props
  + 调用部分生命周期函数
  + 新旧children diff，标记更新
  + 找出DOM需要更新的属性，并标记更新
  + 预生成新增的DOM对象，先挂载在fiber上

+ 如何将fiber节点搭建成fiber树：源码中从RootFiber开始递归流程，“递”和“归”阶段会交错执行直到“归”到RootFiber，至此，render阶段的工作就结束了
  + “递”
    + 首先从rootFiber开始向下深度优先遍历，为遍历到的每个fiber节点调用beginWork方法
    + 该方法根据传入的fiber节点创建子fiber节点，并将这两个fiber节点连接起来
    + 当遍历到叶子节点（即没有子组件的组件）时就进入“归”的阶段

  + “归”
    + 在这个阶段会调用completeWork处理fiber节点
    + 当某个fiber节点执行完completeWork，如果其存在兄弟fiber节点，即`fiber.sibling!==null`，会进入其兄弟的“递”阶段
    + 如果不存在兄弟fiber，会进入父fiber的“归阶段”

+ 举例
```javascript
function App(){
  return (
     <div>
       i am
       <span>KaSong</span>
     </div> 
  )  
}
ReactDOM.render(<App />, document.getElementById("root"));
```

对应的Fiber树结构如下：
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/fiber树.png)

---

2.Commit阶段（CompleteRoot）
这个阶段相比第一个阶段，任务很轻，就是遍历effect list，执行side effects，将数据的更新体现到UI上，这个阶段会涉及UI的更新
+ 执行所有的effect list节点的生命周期函数getSnapshotBeforeUpdate
+ 执行所有的effect list节点DOM更新、ref删除，以及componentWillUnMount生命周期函数的调用
+ 将workFinished tree设置为current tree
+ 执行所有的effect list节点的mutation生命周期函数，ref的添加


---
### 参考链接
[调和流程](https://blog.csdn.net/hupian1989/article/details/102617165)

[卡颂](https://react.iamkasong.com/process/beginWork.html#effecttag)

[jokcy老师关于渲染流程的分析](https://react.jokcy.me/book/commit-phase/host-effects/CommitWork.html)
