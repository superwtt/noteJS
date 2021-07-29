### new Vue发生了什么
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/new-vue过程.png)

---

#### 1.从入口文件开始
用vue-cli脚手架创建项目时，我们通常都会在页面的入口文件`main.js`中new一个Vue对象的实例
```js
// main.js中
import Vue from 'vue';

new Vue({
  el:'#app',
  router,
  store,
  render: h=>h(App)  
})
```

接下来我们一步步分析，`new Vue`都发生了什么

---

#### 2.关于 Vue 的定义
源码目录：`src/core/instance/index.js`，Vue其实就是一个用ES5的Function实现的类，我们只能通过`new Vue`去实例化使用它。
```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

---

① `this._init`，把`options`作为参数调用`_init`方法，`options`就是我们调用`new Vue`时候传入的参数。
`_init`方法定义在`initMixin`中，`_init`方法做了三件事：
+ `mergeOptions`：将传入`new Vue`的options和Vue构造函数上的options进行合并，构造函数上的options是经过Vue手动包装上去的
+ 初始化生命周期、初始化事件中心、初始化渲染、初始化data/props/computed/watcher等等
+ $mount挂载

```js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 有子组件时，_isComponent才会为true
    if (options && options._isComponent) {
      // 优化组件实例
      initInternalComponent(vm, options)
    } else {
      // 传入的options和vue自身的options进行合并  
      vm.$options = mergeOptions(

        // 解析当前实例构造函数上的options  
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm) // 属性代理，当访问的属性不是string类型或者属性值在被代理的对象上不存在，则抛出错误，否则返回该属性值。该方法可以在开发者错误的调用vm属性时，提供一个提示作用
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm) // 初始化一些生命周期相关
    initEvents(vm) // 初始化事件相关属性，当有父组件的方法绑定在子组件的时候，供子组件调用
    initRender(vm) // 添加slot属性
    callHook(vm, 'beforeCreate') // 调用beforeCreated钩子 
    initInjections(vm) // 
    initState(vm) // 初始化数据，进行双向绑定
    initProvide(vm) // 
    callHook(vm, 'created') // 调用created钩子

    if (vm.$options.el) {
      vm.$mount(vm.$options.el) // 把模板转为render函数
    }
  }
}
```
解析：
1. mergeOptios
2. initLifecycle
3. 挂载


































### 参考链接
[人人都能读懂的Vue源码系列](https://segmentfault.com/u/zhenren/articles)