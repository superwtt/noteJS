### 基本使用
```js
// 第一种 字符串声明
watch:{
  message: 'handler'
},
methods:{
  handler(newVal,oldVal){
    // ...
  }
}

// 第二种 函数声明
watch:{
  message:function(newVal,oldVal){
    // ...
  }
}

// 第三种 对象声明
watch:{
  'people.name':{
    handler:function(newVal,oldVal){// ...}
  },
  // 或者 
  people:{
    handler:function(newVal,oldVal){},
    immerdiate:true,
    deep:true
  }
}

// 数组声明
methods:{
  handle(newVal,oldVal){...}
},
watch:{
  'people.name':[
    'handle',
    function handle2(newVal,oldVal){}
  ]
}
```

---

### initWatch
① `new Vue`实例化的时候，会调用`this._init`方法进行应用的初始化，包括了生命周期、事件、数据、属性、方法、执行生命周期等过程，其中数据的初始化方法initState包括了属性的初始化。
```js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```
---

② 进入`initWatch`方法
```js
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```
解析：
+ 数组声明的watch有多个回调，需要循环创建监听
+ 其他方式直接创建

---

③ 进入创建方法`createWatcher`看看做了什么
```js
function createWatcher (
  vm: Component,
  keyOrFn: string | Function,
  handler: any,
  options?: Object
) {

  // 1
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }

  // 2
  if (typeof handler === 'string') {
    handler = vm[handler]
  }

  // 3 keyOrFn是watch的key值
  return vm.$watch(keyOrFn, handler, options)
}
```
解析：
1. 对象声明的watch，从对象中取出对应回调
2. 字符串声明的watch，直接取实例上的方法
3. 监听属性的实现原理

---

④ `wm.$watch`
源码目录：`/src/core/instance/state.js`

```js
Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    // 如果cb是对象，当手动创建监听属性时
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 1
    options = options || {}
    options.user = true // user-watcher标志位
    // 2
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 3
    if (options.immediate) { // 立即执行
      cb.call(vm, watcher.value) // 以当前值立即执行一次回调函数
  }
    // 4 返回一个函数，执行取消监听
  return function unwatchFn () {
      watcher.teardown()
  }
}  
```
解析：
vm.$watch做了三件事
+ 设置标记位`options.user`为true，表明这是一个`user-watcher`
+ 给watch设置了`immediate`属性后，会将实例化后得到的值传入回调，并立即执行一次回调函数，这也是immediate的实现原理
+ 最后的返回值是一个方法，执行后可以取消对该监听属性的监听

---

⑤ 经过上面的流程后，最终会进入`new Watcher`的逻辑，这里也是依赖收集和更新的触发点

```js
// 源码位置：/src/core/observer/watcher.js
class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    vm._watchers.push(this)  // 添加到当前实例的watchers内
    
    if(options) {
      this.deep = !!options.deep  // 是否深度监听
      this.user = !!options.user  // 是否是user-wathcer
      this.sync = !!options.sync  // 是否同步更新
    }
    
    this.active = true  // // 派发更新的标志位
    this.cb = cb  // 回调函数
    
    if (typeof expOrFn === 'function') {  // 如果expOrFn是函数
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)  // 如果是字符串对象路径形式，返回闭包函数 obj.a.b
    }
    ...
  }
}
```
+ 当是`user-watcher`时，`Watcher`内部是以上方实例化的
+ 当传入的键值是obj.a.b的形式时，`parsePath`用来解析它，每一项键值都会被触发依赖收集，也就是说，obj.a.b任何一项键值的值发生改变都会触发watch回调
+ 当实例化完成之后，watch对象上的每一个属性，都会被实例化成Watcher的实例，能够进行数据的监听和派发更新

---

⑥ 接下来进入`get()`方法
```js
get() {
  pushTarget(this)  // 将当前user-watcher实例赋值给Dep.target，读取时收集依赖
  let value = this.getter.call(this.vm, this.vm)  // 将vm实例传给闭包，进行读取操作
    
  if (this.deep) {  // 如果有定义deep属性
    traverse(value)  // 进行深度监听
  }
  popTarget()
  return value  // 返回闭包读取到的值，参数immediate使用的就是这里的值
}
// ...
```
+ `pushTarget`是将当前的用户Watcher即当前实例this挂到Dep.target上，在收集依赖的时候，找的就是Dep.target
+ 然后调用`getter`函数，触发数据劫持，接着触发dep.depend收集依赖

---

⑦ 更新
在更新时首先触发的是“数据劫持set”，调用 dep.notify 通知每一个 watcher 的 update 方法。

接着就走 queueWatcher 进行异步更新，这里先不讲异步更新。只需要知道它最后会调用的是 run 方法

---

⑧ 深度监听

收集依赖时，有一段逻辑是这样的，判断是否需要深度监听，调用`traverse`并将值传入

```js
if (this.deep) {
  traverse(value)
}
```

```js
// 源码位置：/src/core/observer/traverse.js
```
+ `traverse`函数的逻辑大概是递归获取每一项属性，触发他们的“数据劫持get”收集依赖
+ 由于是递归进行监听，肯定会有一定的性能损耗。因为每一项属性都要走一遍依赖收集的流程，所以尽量在业务中避免这些操作

---

### 总结
+ watch的多种调用方法，在初始化的时候，会去区分：字符串形式调用、对象形式调用、多重属性调用、是否传递了immediate、deep属性等
+ 为什么能够实现监听：在初始化时，会遍历watch上的每一个属性，给每一个属性添加一个Watcher实例，Watcher中进行依赖收集和更新，
+ immediate的原理：给watch设置了`immediate`属性后，会将实例化后得到的值传入回调，并立即执行一次回调函数。
+ deep的原理：递归调用归获取每一项属性触发他们的“数据劫持get”收集依赖

---

### 参考链接
[掘金1](https://juejin.cn/post/6844903926819454983)
[掘金2](https://juejin.cn/post/6844904201752068109)