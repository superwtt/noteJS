### new Vue发生了什么
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/new-vue过程.png)

---

#### 0.new Vue的几种写法
```js
// 1.0
new Vue({
  el:"#app",
  template:"<App />",
  components:{App}
})

// 2.0
new Vue({
  template:"<App />",
  components:{App},
}).amount("#app")

// 3.0 
new Vue({
  render:h=>h(App),
}).amount("#app")

// 4.0
new Vue({
  render:function(h){
    return h(App)
  }
}).amount("#app")

```
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
+ 初始化生命周期、初始化事件中心、初始化渲染、初始化`data/props/computed/watcher`等等
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
1. mergeOptions：内部调用`resolveConstructorOptions(vm.constructor)`，用来解析`constructor`上的`options`属性的。分为2种场景：
+ 第一种是Ctor是基础Vue构造器的情况
  + 当Ctor是基础Vue构造器时，比如是通过new关键字新建Vue的实例：
  ```js
  new Vue({
    el:'#app',
    data:{
      message:'Hello World'
    }
  })
  ```
  这个时候`options`就是Vue构造函数上的`options`
  ![](https://image-static.segmentfault.com/386/004/386004732-5ade8e89b3294_fix732)

+ 第二种是Ctor是通过Vue.extend方法扩展的情况

  + 当Ctor是Vue.extend创建的“子类”，合并父类的options和自身的options

+ 当执行完`resolveConstructorOptions`时，再调用`mergeOptions`方法，把构造函数上的`options`和实例化传入的`options`进行合并操作并生成一个新的options

---

2. 初始化生命周期、初始化事件中心、初始化渲染、初始化data/props/computed/watcher等等
  + `initState`，初始化数据，做了四件事：
    + initProps：遍历props中的每个属性，然后进行类型验证（是否是props指定的数据类型）、数据监测（为props赋值就报错）、给props的get 和 set

    + initMethods：主要是校验`methods`的名字是否有效：定义了函数名但是没有函数体、跟props和vue实例是否同名

    + 内部调用`initData`,然后遍历data，调用`proxy()`方法给data属性添加get和set，再调用`observe`添加响应式监听

    + initComputed：computed属性的值可以是一个函数也可以是一个对象。计算属性是基于它们的响应式依赖进行缓存的，只在相关响应式依赖发生改变时才会重新求值
      + 如果computed中属性的值是一个函数，则默认为属性的getter函数。
      + 如果属性的值是一个对象，它只有三个有效字段：set、get、cache，cache默认为true

    + initWatch：遍历watch，为每一个属性创建侦听器
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
3. 挂载：`vm.$mount(vm.$options.el)`，Vue原型对象上定义$mount内部实际是定义`mountComponent`。

`mountComponent`做了四件事：

+ 判断是否有template属性，如果有template属性却没有使用compiler版本，那警告必须使用Vue加compiler的版本
+ 执行`beforeMount`生命周期钩子
+ 开始执行挂载，最核心的2个方法是`vm._render`和vm._update
  + _render：把实例渲染成一个虚拟VNode，通过执行createElement方法并返回VNode，它是一个虚拟node
  + _update：首次渲染、数据更新DOM的时候调用，把VNode渲染成真实的DOM，_update的核心就是调用vm._patch_方法，实例化一个组件的时候，其整个过程就是遍历VNode Tree递归创建了一个完整的DOM树并插入到Body上
+ 执行`mounted`生命周期钩子

```js
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// mountComponent
function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;

      var vnode = vm._render();
      measure(("vue " + name + " render"), startTag, endTag);

      vm._update(vnode, hydrating);
      measure(("vue " + name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  vm._watcher = new Watcher(vm, updateComponent, noop);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}
```
① `vm._render`：用来把实例渲染成一个虚拟node，经过`_render`的流程，传进去的vue实例将会变成一个虚拟node节点。`vm_render`最终是通过执行`createElement`方法并返回的是vnode，它是一个虚拟Node即Virtual DOM

---

② `Virtual DOM`：Virtual DOM产生的前提是浏览器中DOM的操作是很昂贵的，当我们频繁地去做DOM的更新，会产生一定的性能问题。

而Virtual DOM就是用一个原生的JS对象去描述一个DOM节点，所以它比创建一个DOM的代价要小很多。在Vue.js中，Virtual DOM是用VNode这么一个Class去描述。
```js
// 源码目录：src/core/vdom/vnode.js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
```
解析：
+ 可以看到，VNode是对真实DOM的一种抽象描述，它的核心定义无非就是几个关键属性、标签名、数据、子节点、键值等，其他属性都是用来扩展VNode的灵活性以及实现一些特殊功能的。

+ 由于VNode只是用来映射到真实DOM的渲染，不需要包含操作DOM的方法，因此它是非常轻量和简单的。

+ `Virtual DOM`除了它的数据结构定义，映射到真实的DOM实际上要经历VNode的create、diff、patch等过程。在Vue.js中，VNode的create是通过`createElement`方法创建的

---

③ `createElement`的重点流程做了两件事：
+ children的规范化：`Virtual DOM`实际上是一个树状结构，每一个VNode可能会有若干个子节点，这些子节点应该也是VNode类型。
+ VNode的创建：创建VNode实例。如果是string类型，则直接创建一个普通的VNode，如果是已经注册的组件名，则通过createComponent创建一个组件类型的VNode，否则创建一个未知的标签的VNode.

---

④ 至此，`_render`的流程结束了，它的作用就是创建一个树状的虚拟DOM树

---

⑤ `vm._update`：被调用的时机有2个，一个是首次渲染，一个是数据更新。`_update`方法的作用是把VNode渲染成真实的DOM。`_update`其实就是调用`_patch_`方法，将虚拟DOM渲染成真实DOM，内部实现是真实的DOM操作

---

### 参考链接
[人人都能读懂的Vue源码系列](https://segmentfault.com/u/zhenren/articles)

[ustbhuangyi](https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/new-vue.html)