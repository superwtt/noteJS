### 背景
在hooks之前，我们开发React组件主要是使用class组件和函数组件。

函数组件没有state，只是简单的将props映射成view；
class组件有state，能够处理更加复杂的逻辑。但是基于class的组件并不是完美的，总结起来有三个问题：

1. 代码重用：在hooks之前，常见的代码重用方式是HOC，这种方式非常笨重，同时会带来很深的组件嵌套
2. 复杂的组件逻辑：在class组件中，有很多的lifecycle函数，你需要在各个函数的里面去做对应的事情，这种方式带来的问题是：逻辑分散在各处，开发者去维护这些代码会分散自己的精力，理解代码逻辑也有点吃力
3. class组件的困惑：对于初学者，class组件的this是比较难理解的，并且基于class的组件其实是很难优化的

---

### hooks的问题
1. 在无状态组件每一次函数上下文执行的时候，react用什么方式记录了hooks的状态？
2. 多个react-hooks用什么来记录每一个hooks的顺序的？
3. 为什么不能在条件语句中声明hooks？
4. hooks的声明为什么在组件的最顶部？
5. function函数组件中的useState，和class类组件的setState有什么区别？
6. React是怎么捕获到hooks的执行上下文，是在函数组件内部的？
7. 为什么两次传入useState的值相同，函数组件不更新？
8. useEffect、useMemo中，为什么useRef不需要依赖注入，就能访问到最新的改变值？

---

#### 在无状态组件每一次函数上下文执行的时候，react用什么方式记录了hooks的状态？
mount阶段时，每个React-hooks的执行，都会产生一个hook对象，并形成链表结构，绑定在workInProgress的memoizedState属性上，而react-hooks上的状态，绑定在当前hooks对象的memorizedState属性上。

update更新阶段时，上一次workInProgress树已经赋值给了current树。存放hooks信息的memoizedState此时已经在current树上.
对于一次函数组件更新，当再次执行hooks函数的时候，比如useState(0),首先要从current的hooks中找到与当前workInProgress对应的current hook，然后复制一份current hook给workInProgress，接下来hooks函数执行的时候，把最新的状态更新到workInProgressHook，保证hooks状态不丢失。
所以每次函数组件更新，每一个react-hook运行，都需要一个函数去做上面的操作，这个函数就是`updateWorkInProgressHook`

---

#### 多个react-hooks用什么来记录每一个hooks的顺序的？
React中使用链表结构来记录hook的顺序，沿着next指针查找每一个hook上挂载的memorizedState的值

---

#### 为什么不能在条件语句中声明hooks？
hooks在React中是以链表的结构保存的，以next指针连接每一个hook。当hooks调用时，会根据链表的结构，沿着指针一个个去查找调用

hook对象保存的信息：
+ memoizedState: useState中保存的state信息|useEffect中保存的effect对象|useMemo中保存的是缓存的值和deps|useRef中保存的是ref对象
+ baseQueue:useState和useReducer中，保存最新的更新队列
+ baseState:useState和useReducer中，产生的最新state值
+ queue:保存待更新队列pendingQueue，更新dispatch等信息
+ next:指向下一个hook对象

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/hooks的连接.png)

如果其中一个Hook被放在了条件语句中，在函数组件更新时，条件语句如果不能被执行，那么链表结构将会被破坏，current树的memorizedState缓存hooks信息，和当前workInProgress不一致，如果涉及到读取state等操作，就会发生异常

---

#### hooks的初始化，我们写的hooks会变成什么样？
围绕四个重点hooks展开，分别是负责组件更新的useState，负责执行副作用useEffect，负责保存数据的useRef，负责缓存优化的useMemo

（1）`mountWorkInProgressHook`：在组件初始化的时候，每一个hooks执行，如useState()，useRef()，都会调用`mountWorkInProgressHook`
```js
function mountWorkInProgressHook(){
  const hook = {
    memoizedState:null, // useState中保存state信息|useEffect中保存effect对象|useMemo中保存的是缓存的值和依赖
    baseState:null,
    baseQueue:null,
    queue:null,
    next:null
  }
  if(workInProgress===null){
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else{
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```
`mountWorkInProgressHook`这个函数做的事情很简单：
+ 首次每次执行一个hooks函数，都会产生一个hook对象，里面保存了当前hook信息
+ 然后将每个hook以链表的形式串联起来，并赋值给workInProgress的memoizedState
+ 也就证实了，函数组件用memoizedState存放hooks链表

---

（2）初始化useState -> mountState
```js
function mountState(initialState){
  const hook = mountWorkInProgressHook();
  if(typeof initialState === 'function'){// 如果useState的第一个参数为函数，执行函数得到state
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;

  const queue = (hook.queue={
    pending:null, // 带更新的
    dispatch:null, // 负责更新函数
    lastRenderReducer: basicStateReducer,// 用于得到最新的state
    lastRenderState: initialState // 最后一次得到的state
  })

  const dispatch = (queue.dispatch=(dispatchAction.bind(...)))

  return [hook.memeorizedState,dispatch]
}
```
mountState到底做了什么？

+ 首先得到初始化的state，将它赋值给`mountWorkInProgressHook`产生hook对象的memorizedState和baseState属性
+ 创建一个queue对象保存负责更新的信息
+ 返回触发更新的方法dispatchAction

---

（3）初始化useEffect -> mountEffect
```js
function mountEffect(create,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined?null:deps;
  hook.memoizedState = pushEffect(
    HookHasEffect|hookEffectTag,
    create, // useEffect第一个参数 就是副作用函数
    undefined,
    nextDeps  //  useEffect的第二个参数
  )
}
```

+ 每个hooks初始化都会创建一个hook对象，然后将hook的memoizedState保存当前effect hook的信息
+ workInProgress/current树上的memoizedState保存的是当前函数组件每个hooks形成的链表
+ 每个hooks上的memorizedState保存了当前hooks信息，不同种类的hooks的memorizedState内容不同
+ `pushEffect`用来创建effect对象，挂载updateQueue
+ 假设我们在一个函数组件中这么写：
```js
useEffect(()=>{
  console.log(1)
},[props.a])
useEffect(()=>{
  console.log(2)
},[])
useEffect(()=>{
  console.log(3)
},[])
```
那么memorizedState.updateQueue中会以这样的形式保存:

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/effect-updateQueue.png)

---

（4）初始化useMemo -> mountMemo
```js
function mountMemo(nextCreate,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps===undefined?null:deps;
  const nextValue = nextCreate();
  hook.memorizedState = [nextValue,nextDeps]
  return nextValue;
}
```

+ 初始化useMemo，就是创建一个hook，然后执行useMemo的第一个参数，得到需要缓存的值，然后将值和deps记录下来，赋值给当前hook的memorizedState

---

（5）初始化useRef -> mountRef
```js
function mountRef(initialValue){
    const hook = mountWorkInProgressHook();
    const ref = {current:initialValue};
    hook.memorizedState = ref;
    return ref;
}
```

+ mountRef初始化很简单，创建一个ref对象，对象的current属性来保存初始化的值，最后用memorizedState保存ref，完成整个操作

---

#### mount阶段hooks总结
1. 在一个函数组件第一次渲染执行上下文过程中，每个react-hooks执行，都会产生一个hook对象，并形成链表结构，绑定在workInProgress的memorizedState属性上
2. react-hooks上的状态，绑定在当前hooks对象的memorizedState属性上。
3. 对于effect副作用的钩子，会绑定在workInProgress.updateQueue上，等到commit阶段dom树构建完成，再执行每个effect副作用钩子

---

#### hooks更新阶段
对于更新阶段，说明上一次`workInProgress`树已经赋值给了`current`树，存放hooks信息的memorizedState，此时已经存在在current树上。

对于一次函数组件更新，当再次执行hooks函数的时候，比如useState(0)，首先要从current的hooks中找到与当前workInProgressHook对应的currentHooks，然后复制一份currentHooks给workInProgressHook，接下来hooks函数执行的时候，把最新的状态更新到workInProgressHook，已保证hooks状态不丢失

函数组件每次更新，每一个react-hooks函数执行，都需要有一个函数去做上面的操作，这个操作就是`updateWorkInProgressHook`

---

（1）`updateWorkInProgressHook`

复制current的hooks，把它赋值给`workInProgressHook`，用于更新新一轮hooks状态

---

（2）useState -> updateState

将上一次更新的pending queue合并到basequeue，这一操作用来解决用户多次调用setNumber方法，一次执行useState上的每一个action，得到最新的state

---

（3）useEffect -> updateEffect

useEffect做的事情很简单，判断两次deps是否相等，如果相等说明此次更新不需要执行，则直接调用pushEffect，如果不相等，那么更新effect，并赋值给hook.memorizedState

---

（4）useMemo -> updateMemo

判断两次deps是否相等，如果不相等，证明依赖项发生改变，那么执行useMemo的第一个函数得到新的值，然后重新赋值给hook.memorizedState；如果相等，证明没有依赖项改变，那么直接获取缓存的值

---

（5）useRef -> updateRef

返回缓存下来的值，无论函数组件执行多少次，hook.memorizedState内存都指向了一个对象，所以就解释了useEffect、useMemo中，为什么useRef不需要依赖注入就能访问到最新改变的值

---

### 为什么两次传入useState的值相同，函数组件不更新？

useState暴露的改变state状态的函数dispatchAction函数内部会有判断，将最新的state上一次的state进行浅比较，如果相等直接return，这就证实了为什么useState，两次值相等的时候组件不渲染的原因了

---

### 自我总结
+ React-Hooks给我们提供了在函数组件中模拟类组件生命周期、状态更新等行为的能力。
+ 我们的React应用中有两个树，一个是current fiber树，记录了当前页面的内容；一个是workInProgress树，当触发更新时运行的树。
+ 我们的hooks以链表的形式保存在这两棵树的memorizedState属性上，而每一个hooks自己的状态保存在自己的hook.memorizedState上。
+ 当首次渲染时：
  + useState hook，得到初始化的state，赋值给mountWorkInProgressHook产生的hook上，即hook.memorizedState属性，创建一个update对象，保存负责更新的信息
  + useEffect，初始化一个hook对象，保存在mountWorkInProgressHook产生的hook上。由于用户可能连续多次调用useEffect，所以还需要额外创建updateQueue，将这些副作用以环状链表保存
  + useMemo，创建一个hook，执行它的第一个参数得到需要缓存的值，然后将值和deps依赖项记录下来，赋值给当前hook的memorizedState
  + useRef，创建一个ref对象，对象的current属性来保存初始化的值，最后用memorizedState保存ref，完成整个操作

+ 当更新时：
  + useState，取出之前保存的state，计算一次更新
  + useEffect，判断两次的依赖项是否相等，不相等就执行副作用函数，相等就说明此次更新不需要执行
  + useMemo，比较两次的依赖项是否相等，相等的话直接返回缓存的值，不相等的话，执行useMemo的第一个函数
  + useRef，更新阶段的ref做的事情很简单，就是返回了缓存下来的值，无论组件怎么执行、执行多少次，都能访问到最新的值

---

### 参考链接
[掘金](https://juejin.cn/post/6944863057000529933#heading-24)