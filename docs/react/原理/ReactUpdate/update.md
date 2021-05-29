### 触发更新
在React中，有如下方法可以触发状态更新：
+ `ReactDOM.render`—— HostRoot
+ `this,setState`—— ClassComponent
+ `this.forceUpdate`—— ClassComponent
+ `useState`—— FunctionComponent
+ `useReducer`—— FunctionComponent

这些方法调用的场景各不相同，他们是如何接入同一套状态更新机制的呢？

答案是：每次状态更新都会创建一个保存更新状态相关内容的对象，我们叫他`Update`，在render阶段的beginWork中会根据`Update`计算新的`state`

---

### 更新流程
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/更新流程.png)

---

### 参考链接
https://zhuanlan.zhihu.com/p/35801438


周一整理：
生命周期原理
hooks原理

周三整理：
更新流程

周四/周五整理：
ref、context

---

继续看React面试题一个星期

---

端午节过后开始看Vue的面试题
