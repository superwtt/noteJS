### this.$nextTick
在修改数据之后，调用这个方法，获取更新后的DOM。

我们可以简单的理解为，当页面中的数据发生改变，就会把该任务放到一个异步队列中，只有在当前任务空闲时才会进行DOM渲染，当DOM渲染完成之后，该回调函数会自动执行。

---

### 原理
JS的事件循环和任务队列是理解nextTick概念的关键

---

#### JS的事件循环机制
同步任务和异步任务分别进入两个不同的执行场所，同步任务进入主线程，异步任务进入EventTable并注册函数

在异步队列中，当指定的事件完成时，EventTable会把这个函数移入EventQueue任务队列，根据异步事件的类型，需要把事件分为微任务和宏任务

当主线程空闲时，主线程会优先查看微任务队列，执行清空之后再查看宏任务队列，宏任务是一次事件循环只取一次执行，等待下一轮循环再执行

---

#### Vue中的异步更新策略
Vue实现响应式的DOM更新并不是数据发生变化之后DOM立即变化，而是按照一个的策略进行DOM的更新，<font style="color:blue">这就使得我们并不能在数据更新之后立马拿到更新后的DOM</font>


至于为什么要设计成异步的，其实很好理解：如果是同步的，当我们频繁地去改变状态值，会导致DOM不停地更新，这显然是不行的

---

#### 具体实现
我们看一下2.6简化版本的实现，源码位置：
`https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js`

1. 我们的应用初始化时候，进入`next-tick`流程：

① 引入模块 和 定义变量。
```js
// noop 空函数，可用作函数占位符
import { noop } from 'shared/util';

// Vue 内部的错误处理函数
import { handleError } from './error';

// 判断是IE/IOS/内置函数
import { isIE, isIOS, isNative } from './env';

// 使用 MicroTask 的标识符
export let isUsingMicroTask = false;

// 以数组形式存储执行的函数
const callbacks = [];

// nextTick 执行状态
let pending = false;

// 遍历函数数组执行每一项函数
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
```
这边仅仅是初始化了几个变量：
+ callback：数组形式存储回调执行的函数
+ pending：nextTick执行状态，默认为false
+ flushCallback：遍历函数数组执行每一项函数

---

② 根据当前的环境，注册timerFunc函数，该函数是用来决定我们的异步延迟函数以何种方式调用，初始化时，flushCallback会作为参数传递给timerFunc函数。

```js
// 核心的异步延迟函数，用于异步延迟调用 flushCallbacks 函数
let timerFunc;

// timerFunc 优先使用原生 Promise
// 原本 MutationObserver 支持更广，但在 iOS >= 9.3.3 的 UIWebView 中，触摸事件处理程序中触发会产生严重错误
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);

    // IOS 的 UIWebView，Promise.then 回调被推入 microtask 队列但是队列可能不会如期执行。
    // 因此，添加一个空计时器“强制”执行 microtask 队列。
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;

  // 当原生 Promise 不可用时，timerFunc 使用原生 MutationObserver
  // 如 PhantomJS，iOS7，Android 4.4
  // issue #6466 MutationObserver 在 IE11 并不可靠，所以这里排除了 IE
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS 和 iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;

  // 如果原生 setImmediate 可用，timerFunc 使用原生 setImmediate
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // 最后的倔强，timerFunc 使用 setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}
```
---

③ 决定完timerFunc的异步方式之后，初始化的pending为false，默认会调用一次timerFunc()方法，将DOM更新作为参数传进去（所以DOM更新也是一次微任务），谷歌环境下，timerFunc肯定是个微任务

---

④ 当data的数据更新时，会立马把DOM更新任务放到微任务队列，此时微任务队列已经有一个DOM更新的任务了。

函数执行到`this.$nextTick`时，将回调函数传进去，push进callback队列，此时微任务队列就有两个任务：更新DOM、更新DOM之后的我们的回调。

根据JS事件循环，我们就可以保证，我们的回调是在DOM更新之后执行，就能拿到最新的DOM

---

### 总结
1. 应用初始化时，会初始化异步更新和nextTick相关的逻辑
2. 其中最重要的有一个timerFunc函数，决定了我们的异步是微任务还是宏任务，谷歌环境下，肯定就是微任务。
3. 当数据更新 会触发它的setter，从而通知Dep去调用相关的watch对象，进而触发watch的update函数进行视图更新
```js
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    // 同步则执行run直接渲染视图
    this.run()
  } else {
    //异步推送到观察者队列中，下一个tick时调用。
    queueWatcher(this)
  }
}
```
4. Vue 在调用 Watcher 更新视图时，并不会直接进行更新，而是把需要更新的 Watcher 加入到 Queue 队列里，然后把具体的更新方法 flushSchedulerQueue 传给 nextTick进行调用，<font stye="color:red">从这里我们知道，Vue的DOM更新也会调用nextTick方法</font>
```js
export function queueWatcher (watcher: Watcher) {
  /*获取watcher的id*/
  const id = watcher.id
  /*检验id是否存在，已经存在则直接跳过，不存在则标记哈希表has，用于下次检验*/
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i >= 0 && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}
```

5. nextTick 函数非常简单，它只是将传入的 flushSchedulerQueue 添加到 callbacks 数组中，然后执行了 timerFunc 方法。
```js
const callbacks = [];
let timerFunc;

function nextTick(cb?: Function, ctx?: Object) {
  let _resolve;
  // 1.将传入的 flushSchedulerQueue 方法添加到回调数组
  callbacks.push(() => {
    cb.call(ctx);
  });
  // 2.执行异步任务
  // 此方法会根据浏览器兼容性，选用不同的异步策略
  timerFunc();
}
```

6. timerFunc 是根据浏览器兼容性创建的一个异步方法，它执行完成之后，会调用 flushSchedulerQueue 方法进行具体的 DOM 更新，那么微任务队列中就会放置一个DOM更新任务
7. 当执行到this.$nextTick时，才会再将回调放到微任务队列中，根据先进先出原则，this.$nextTick的回调肯定是在DOM更新之后执行

---

### 参考链接
[Good](https://segmentfault.com/a/1190000023649590)

[segmentfault](https://segmentfault.com/a/1190000018328525)