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
3. 当数据更新时，会立马在微任务队列中放置一个DOM更新任务，当执行到this.$nextTick时，才会再将回调放到微任务队列中，根据先进先出原则，this.$nextTick的回调肯定是在DOM更新之后执行

---

### 参考链接
[Good](https://segmentfault.com/a/1190000023649590)