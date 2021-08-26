### mixins使用场景
在日常的开发中，我们经常会遇到在不同的组件中经常会需要用到一些相同或者相似的代码，这些代码的功能相对独立。

这时，可以通过Vue的mixin功能将相同或者相似的代码提出来

---

### 基本使用
```js
// mixin.js
export default {
  data(){
    return {
      isShowing: false
    }
  },
  methods:{
    toggleShow(){
      this.isShowing = !this.isShowing
    }
  }
}
// 组件中使用
<script>
  <template>
    <button @click="toggleShow">修改名字</button>
  </template>
  import {toggle} from "../base/mixin"
  export default {
    mixins: [toggle],
    data(){},
    methods:{}
  }
</script>
```

---

### 源码
① 在Vue实例化的过程中，会执行`initMixin`逻辑。
```js
function Vue (options) {
  // ...
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```
---
② 进入`initMixin`流程，源码位置：`/src/core/global-api/mixin.js`

```js
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```
+ 把当前Vue实例的options和传入的mixin合并并且返回

---

### 参考链接
[Good](https://vue3js.cn/interview/vue/mixin.html#%E4%B8%89%E3%80%81%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90)