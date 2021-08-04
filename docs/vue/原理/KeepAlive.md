### KeepAlive用法
`<keep-alive>`包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。

当组件在`<keep-alive>`内被切换时，它的`mounted`和`unmounted`生命周期钩子不会被调用，取而代之的是`activated`和`deactivated`。

主要用于保存组件状态或者避免重新渲染

+ 在动态组件中的应用
```js
<keep-alive :include="whiteList" :exclude="blackList" :max="amount">
  <component :is="currentComponent"><component />
</keep-alive>
```
---
+ 在vue-router中的应用
```js
<keep-alive :include="whiteList" :exclude="blackList" >
   <router-view></router-view>
</keep-alive>
```

+ `include`定义缓存白名单，keep-alive会缓存命中的组件，`exclude`定义缓存黑名单，被命中的组件将不会被缓存

---

### 使用场景
比如有两个tab标签页，第一个tab标签我们操作了界面，再切换到第二个标签页，如果不使用`<keep-alive>`缓存的话，再切换回第一个标签页时，第一个标签页会重新渲染，而不会保留我们刚刚操作的痕迹

---

### 原理
源码目录：`src/core/components/keep-alive.js`

① 组件的定义部分

```js
export default {
  name: 'keep-alive',
  abstract: true, // 判断当前组件虚拟dom是否渲染成真实dom的关键

  props: {
    include: patternTypes, // 缓存白名单
    exclude: patternTypes, // 缓存黑名单
    max: [String, Number] // 缓存的组件实例数量上限
  },

  created () {
    this.cache = Object.create(null) // 缓存虚拟dom
    this.keys = [] // 缓存的虚拟dom的健集合
  },

  destroyed () {
    for (const key in this.cache) { // 删除所有的缓存
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 实时监听黑白名单的变动
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    // 先省略...
  }
}
```
解析：
1. 组件的定义

+ `keep-alive`与我们定义组件的过程一样，先是设置组件的名字为`keep-alive`

+ 其次定义了一个`abstract`属性为true，表示该组件为抽象组件

+ 在应用初始化`initLifecycle`里，会判断父组件是否为抽象组件，如果是抽象组件，就会选取抽象组件的上一级作为父级，忽略抽象组件与子组件之间的层级关系

2. 生命周期，`keep-alive`在它的生命周期内定义了三个钩子函数
+ created：
  + 初始化两个对象分别缓存VNode和对应的键值

+ destroyed
  + 删除`this.cache`中缓存的VNode实例

+ mounted
  + 在`mounted`这个钩子中对`include`和`exclude`参数进行实时监听

---

② render函数
与我们平时做缓存一样，拿着key到cache这个store中获取对应的组件实例，找到则直接返回这个组件，没找到则添加进去，并将该组件实例的keepAlive属性设置为true

---

③ 缓存的组件渲染到页面
+ 我们用过`keep-alive`都知道，它不会生成真正的DOM节点，这是怎么做到的呢？ 

  + 我们用`keep-alive`不会生成真正的DOM节点，是通过定义的`abstract`属性为true，Vue在初始化生命周期的时候，为组件实例建立父子关系会根据`abstract`属性决定是否忽略某个组件。

+ `keep-alive`包裹的组件是如何使用缓存的？
  + 在Vue渲染的patch阶段，会直接把缓存的组件实例insert到父元素当中

---

### 总结
1. `keep-alive`是用来缓存动态组件的，假设我们有两个标签页，我们在第一个标签页做了操作，比如上拉加载等操作，再切换到第二个标签页。如果不做keep-alive缓存，当我们返回第一个标签页时，第一个标签页将会重新渲染并且不会保留我们的操作痕迹

2. 原理分为两个方面：
+ 在keep-alive组件定义的时候，会初始化两个变量cache和key，用来存储需要缓存的组件和对应的key值。与我们平时做数据缓存一样，当cache这个store里面有这个组件时直接返回，没有的话存储进cache再返回

+ 至于如何将这个缓存的组件渲染到页面，关键在patch阶段，因为我们已经有了vnode，所以直接在patch阶段渲染到页面就好。
  + 在keep-alive定义的时候有个abstract属性默认为true，表示该组件是抽象组件。
  + 在Vue初始化建立父子组件关系的过程中，如果是抽象组件，就会选取该抽象组件的上一级作为父级而忽略这个抽象组件
  + 在patch阶段，`insert(parentElm, vnode.elm, refElm)`，将缓存的DOM（vnode.elm）插入父元素中

---

### 参考链接
[掘金](https://juejin.cn/post/6844903837770203144)
