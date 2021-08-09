### Vue的生命周期
+ `beforeCreate`
+ `created`
+ `beforeMount`
+ `mounted`
+ `beforeUpdate`
+ `updated`
+ `beforeDestory`
+ `destoried`

---

### 各个生命周期的数据状态以及挂载状态

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/各个生命周期的数据状态.png)

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/destory.png)

---

#### beforeCreate 和 created
1. beforeCreate：此时el尚未挂载、data尚未初始化、data里的数据也读取不到

2. created：此时el尚未挂载、data已经初始化、data里的数据能够读取

源码目录：`src/core/instance/init.js/initMixin`

```js
export function initMixin (Vue: Class<Component>) {
  // ...
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm)
  initState(vm) // 初始化数据
  initProvide(vm) 
  callHook(vm, 'created')
  // ...

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```
解析：
+ 由源码的`_init`函数可知，`initState`前后分别执行了`beforeCreate`和`created`两个生命周期

---

#### beforeMount 和 mounted
1. beforeMount：此时el尚未挂载,`this.$el`是undefined、data已经初始化、data里的数据能够读取

2. mounted：此时el已经挂载,`this.$el`能够取到值、data已经初始化、data里的数据能够读取

源码目录：`src/platforms/web/runtime/index.js`

① 初始化执行完`created`生命周期函数后，会进入挂载流程
```js
export function initMixin (Vue: Class<Component>) {
  // ...
  callHook(vm, 'beforeCreate')
  initState(vm) // 初始化数据
  callHook(vm, 'created')
  // ...

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```
---

② 进入到`Vue.prototype.$mount`，内部只是返回了`mountComponent`

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
---

③ 源码目录：`src/platforms/web/runtime/index.js`
```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    // ...
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  vm._watcher = new Watcher(vm, updateComponent, noop)
  hydrating = false

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```
解析：
+ 由源码的`mountComponent`函数可知，在真正执行挂载之前先执行了生命周期`beforeMount`
+ 然后执行`vm._update`的方法
+ 执行完`vm._update`之后，就会立即执行`mounted`生命周期

---

④ 我们看看`vm._update`干了什么

源码目录：`src/platforms/web/runtime/index.js`

```js
Vue.prototype._update = function (vnode, hydrating) {
    const vm: Component = this
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance
    activeInstance = vm
    vm._vnode = vnode
    if (!prevVnode) {
      // initial render
      // 初始化渲染 将vnode渲染为真实的dom节点 替换调用vm.$el根节点
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      )
      vm.$options._parentElm = vm.$options._refElm = null
    } else {
      // updates
      // 数据更新 更新时做diff操作
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }
```
解析：
+ `vm._update`方法，最终会把VNode渲染成真实的DOM。
+ `vm._update`方法被调用的时机有两个，一个是初始化渲染，一个是数据更新
+ `vm._update`的核心就是调用`vm._patch_`，`vm._patch_`内部就是原生方法，生成真实DOM了

---

#### beforeUpdate 和 updated
当进入`_update`函数的时候，会先执行`beforeUpdate`函数，`_update`执行时机有两个：一个是初始化的时候，一个是更新的时候

当我们触发一次更新，调用链如下：
`class Watcher` -> `update` -> `queueWatcher` -> `nextTick(flushSchedulerQueue)` -> `callUpdatedHooks(updatedQueue)` -> `callHook(vm, 'updated')` 

---

#### beforeDestory 和 destory
1. beforeDestory：此时el已经挂载,`this.$el`是undefined、data已经初始化、data里的数据能够读取

2. destory：此时el已经挂载,`this.$el`是undefined、data已经初始化、data里的数据能够读取

从文档中调用`remove`函数移除vm实例，在执行`remove`前后分别执行`beforeDestory`和`destory`函数

```js
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
```

---

#### 执行生命周期的方法callHook
源码目录：`src/core/instance/lifecycle.js/callHook`

```js
export function callHook (vm: Component, hook: string) {
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
}

```
解析：
+ 多次调用的执行生命周期方法的`callHook`函数，不过就是循环注册在生命周期上的方法，然后依次调用它们

---

### 总结
1. Vue的生命周期有：`beforeCreate`、`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeDestory`、`destoried`

2. `beforeCreate`和`created`在初始化的时候进行，前者什么都访问不到，后者在初始化结束之后能访问到data以及data上声明的变量

3. `beforeMount`、`mounted`是在初始化初始化完数据之后执行，前者跟`created`时期的状态一样，后者在执行完`mountComponet`到`patch`流程之后，挂载完成，能够访问到el数据

4. `beforeUpdate`、`updated`在数据更新的时候会执行

5. `beforeDestory`、`destoried`在销毁的时候执行

---

### 参考链接
[Good](https://serverless-action.com/fontend/vue_operating_mechanism/Vue.prototype._update.html#%E6%80%BB%E7%BB%93)