### useState的实现
useState包含两个部分：
`const [num,updateNum] = useState(0)`
+ useState这个函数本身调用后返回的是一个数组，数组的第0项是当前的最新状态，数组的第一项是改变当前状态的方法
+ updateNum这个方法的调用，会改变状态，并且使得组件重新render。在React中，updateNum可以是两种方式，第一个是具体的值，第二是回调函数

#### 首先要实现源码的运行环境
每个组件都对应一个fiber节点
```js
const fiber = {
  // 对于FunctionComponent来说，stateNode保存的就是App本身  
  stateNode:App
}

function App(){
  return {
    onClick(){
      updateNum(num=>num+1)
    }
  }
}
```

---

#### 为了迷你版的React能运行起来，我们还需要一个调度方法，使得我们每一次的更新都会触发一次调度，我们的组件就会重新render
```js
function schedule(){
  fiber.stateNode(); // 相当于触发了组件的render
}
```

---

#### 组件在mount和update时的运行是不一样的。一个组件在首次渲染时会调用componentDidMount，在更新时会调用componentDidUpdate,所以我们要区分是mount还是update
```js
let isMount = true;
function App(){
  isMount = false
}
```

---

#### useState需要保存对应的值，那么这个值应该保存在哪儿呢？我们知道我们的每个函数都有对应的fiber，很显然我们的数据就是保存在fiber中的，我们就需要一个字段去对应我们hooks的数据
```js
const fiber = {
  stateNode:App,
  memorizedState:null
}
```

---

#### 一个FunctionComponent可能有许多hooks,比如：
```js
function App(){
  const [num1,updateNum1] = useState(1);
  const [num2,updateNum2] = useState(2);
  const [num3,updateNum3] = useState(3);
}
```
这么多变量怎么保存在memorizedState上呢？那么fiber.memoizedState最好的形式就是链表，这个链表的数据对应的就是每一个hook的数据

---

#### 既然是链表，我们还需要一个指针workInProgressHook指向当前memorizeState记录的第一个hook，此时代码全貌
```js
let isMount = true;
let workInProgressHook = null;
const fiber = {
  stateNode: App,
  memorizedState: null
}

function schedule(){
  isMount = false;
  workInProgressHook = fiber.memorizedState;
  const app = fiber.stateNode();
  return app
}

function App(){
  const [num,updateNum] = useState(0)
  return {
    onClick(){
      update(num=>num+1)
    }
  }
}
window.app = schedule();
```

---

#### 接下来我们需要实现useState方法和updateNum方法，我们先实现useState方法
```js
function useState(initialState){}
```
1. 首先我们需要知道当前我们调用的是哪个hook，因为用户很可能这么去调用
```js
const [num1,updateNum1] = useState(1);
const [num2,updateNum2] = useState(2);
const [num3,updateNum3] = useState(3);
```

所以我们需要一个变量hook来保存当前的那一个hook

2.其次，我们需要区分mount还是update，因为首次渲染的时候,memorizedState还是null，我们需要创建一个hook
```js
function useState(initialState){
  let hook;
  if(isMount){
     let hook = {
       memoizedState:initialState,
       next:null,
       queue:{
         pending:null
       }
     }

     // 当mount的情况下，第一次调用useState会进入fiber.memorizeState不存在的情况
     if(!fiber.memorizedState){
       fiber.memorizedState = hook
     } else{
       // 当mount的情况下，第二次调用useState，会进入fiber.memorizedState存在的情况
       // 这样就把我们刚刚创建的hook和之前创建的hook连接起来，变成一条链表
       workInProgressHook.next = hook;
     }

     //这是上一个hook
     workInProgressHook = hook;
  } else{
    // update的时候已经有一条创建的链表
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next
  }
}
```

---

#### 经过上面的步骤，我们已经请求到了当前hook对应的数据，取到之后我们就需要基于当前状态去计算新的状态。那么这个新的状态是怎么产生的呢？是通过我们的updateNum产生的新值。updateNum在React中有自己的名字，叫做dispatchAction

```js
function dispatchAction(action){}
```
1. 我们怎么知道dispatchAction对应的是哪个useState呢？我们需要将useState对应的那个函数操作传给dispatchAction
```js
function dispatchAction(queue,action)
```

2. 创建一次数据更新，更新也是一条链表，因为用户很可能这么调用：
```js
onClick(){
  updateNum(num=>num+1);
  updateNum(num=>num+1);
  updateNum(num=>num+1);
}

// 创建一次更新
function dispatchAction(queue,action){
  const update = {
    action,
    next:null
  }
}
```

3. 接下来就是单纯的链表的操作了。真实的React中，update是一个环状的链表，因为单向链表不方便实现更新的优先级，而环状链表能够方便地实现更新的优先级
```js
function dispatchAction(queue,action){
  let update = {
    action,
    next:null
  }

  // 第一次调用dispatchAction
  if(queue.pending===null){// 表示当前没有要触发的更新，那么这里的update就是它要触发的第一个更新
  update.next = update; // u0->u0
  } else{
    // 有新的更新
    // u0->u0
    // u1->u0->u1
    update.next = queue.pending.next
    queue.pending.next = update
  }

  queue.pending = update; // 每次执行dispatchAction创建的update都是这条环状链表最新的也是最后一个update

  schedule(); // dispatchAction会触发一次更新
}

```

---

#### 回到useState里面，现在我们useState的hook的queue上面有可能就存在一条环状链表，接下来我们就需要将这条环状链表剪开计算新的state
```js
let isMount = true;
let workInProgressHook = null;
const fiber = {
  stateNode:App,
  memorizedState:null
}

function schedule(){
  workInProgressHook = fiber.memorizedState;
  isMount = false;
  const app = fiber.stateNode();
  return app
}

function useState(initialState){
  let hook;
  if(isMount){
    hook = {
      memorizedState:initialState,// 保存的是当前hook的初始值,
      next:null,// hook是一条链表 就需要一个指针指向下一个hook
      queue:{  // dispatchAction 保存改变的状态操作
        pending:null
      }
    }

    // 当mount的情况下,第一次调用useState，会进入fiber.memoizedState不存在的情况
    if(!fiber.memorizedState){
      fiber.memoizedState = hook; 
    } else{
    // 当mount的情况下,第二次调用useState，会进入fiber.memoizedState存在的情况
    // 这样就会把我们刚创建的hook和之前创建的hook连接起来，变成一条链表 
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook
  }
  else{
    // update时已经有一条链表
    hook = workInProgress;
    workInProgress = workInProgressHook.next; // 将指针置为下一个
  }

  let baseState = hook.memorizedState;
  if(hook.queue.pending){
    let firstUpdate = hook.queue.pending.next; // 环状
    do{
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    }while(firstUpdate !== hook.queue.pending.next)
    hook.queue.pending = null;// 清空
  }
  
  hook.memoizedState = baseState;
  return [baseState,dispatchAction.bind(null,hook.queue)]
}

function App(){
  const [num,updateNum] = useState(0);
  return {
    onClick(){
      updateNum(num=>num+1)
    }
  }
}
window.app = schedule();
```