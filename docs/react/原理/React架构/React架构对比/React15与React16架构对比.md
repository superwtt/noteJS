### React15架构
React15的架构可以分为两层：
+ Reconciler（协调器）——负责找出变化的组件
+ Renderer（渲染器）——负责将变化的组件渲染到页面上

---

#### Reconciler
React中可以通过`this.setState`、`useState`、`this.forceUpdate`、`ReactDOM.render`等方式触发更新。

每当有更新发生时，Reconciler会做如下工作：

+ 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM
+ 将虚拟DOM和上次更新时的虚拟DOM对比
+ 通过对比找出本次更新中变化的虚拟DOM
+ 通知Renderer将变化的虚拟DOM渲染到页面上

---

#### Renderer
由于React支持跨平台，所以不同平台有不同的Renderer。我们前端最熟悉的是负责在浏览器环境渲染的Renderer——ReactDOM，除此之外，还有：

+ ReactNative渲染器，渲染App原生组件
+ ReactTest渲染器，渲染出纯JS对象用于测试
+ ReactArt渲染器，渲染到Canvas、SVG、VML

在每次更新发生时，Renderer接到Reconciler通知，将变化的组件渲染在当前的宿主环境

---

#### React15架构的缺点
在React15的Reconciler中，`mount`的组件会调用`mountComponent`，`update`的组件会调用`updateComponent`。这两个方法都会递归更新子组件。

由于递归执行，所以更新一旦开始，中途就无法中断。当层级很深时，递归更新时间超过了16ms，用户交互就会卡顿。

React15架构不支持异步更新

例子：

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/v15.png)

我们可以看到，Reconciler和Renderer是交替工作的，当第一个li在页面上已经变化后，第二个li再进入Reconciler。

由于整个过程都是同步的，所以在用户看来所有的DOM都是同时更新的

接下来，我们模拟一下，如果中途中断更新会怎么样？

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/dist.png)

 当第一个li完成更新时中断更新，即步骤3完成后中断更新，此时后面的步骤都还未执行

 用户本来期望123变成246，实际却看见更新不完全的DOM，即223，

 基于这个原因，React决定重写整个架构

---

### React16架构
React16的架构可以分为三层：
+ Scheduler（调度器）—— 调度任务的优先级，高优先任务先进入Reconciler
+ Reconciler（协调器）—— 负责找出变化的组件，内部采用了Fiber架构
+ Renderer（渲染器）—— 负责将变化的组件渲染到页面上

React16架构中整个更新流程为：

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/process.png)

 ---

 ### 自己总结
 1. React16相比React15架构多了一个调度器，用来调度任务的优先级
 2. React16的Reconciler内部采用了Fiber架构
 3. React15是同步更新视图的，当DOM层级嵌套比较多时，可能页面会出现卡顿
 4. React15无法实现异步可中断的更新，所以React决定重写架构
