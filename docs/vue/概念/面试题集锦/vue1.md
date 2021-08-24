### Vue的兼容性
Vue只能兼容IE8和FF22以上的版本，因为Vue的响应式核心`Object.defineProperty`在IE8以及FF22以下的版本中不能模拟出来。

还有ES6的`promise`，IE9和一些低版本的高级浏览器对ES6的新语法并不支持。

解决方案：
1. 提示用户：你的浏览器该升级了
2. 使用babel-polyfill
```js
// 1.0下载
npm install --save babel-polyfill

// 2.0 在main.js中引入
import 'babel-polyfill'

// 3.0 在webpack.base.config.js中配置
entry:{
  app:['babel-polyfill','./src/main.js']
}
```
---

### 如何从0-1搭建一个Vue项目
1. 首先确定使用哪个版本，2.0还是3.0
2. 从官网查看脚手架安装流程
3. 确定UI框架、js代码规范、Vue代码规范等等
4. 规定src目录下的内容
+ `components`: 这个目录存放页面的组件，一个应用会被分割成不同的组件模块
+ `base`：这个目录存放项目的公共组件，比如scroll、tip一些公共功能组件
+ `router`：路由
+ `common`：存放图片、字体等静态资源文件
+ `store`：Vuex
+ 其他文件
5. 在组内宣导项目规范:分支规范、提交代码规范、版本锁定、公共配置等

---

### Vue的核心特性
1. 数据驱动(MVVM)
+ `Model`：模型层，负责处理业务逻辑以及和服务器进行交互
+ `View`：视图层，负责将数据模型转化为UI展示出来，可以简单理解为HTML页面
+ `ViewModel`：视图模型层，用来连接Model和View，是Model和View之间的桥梁
---
2. 组件化
+ 降低整个应用的耦合度，在接口不变的情况下，我们可以替换不同的组件快速地完成需求
+ 调试方便，由于整个系统都是通过组件组合起来的，在出现问题的时候，我们可以快速地定位到某个组件
+ 提高可维护性，由于每个组件的职责单一，并且组件在系统中是复用的，所以对代码优化可以对系统整体升级
---
3. 指令系统，带有v-前缀的一些特殊属性可以起到很大的作用
+ `v-if`：条件渲染指令
+ `v-for`：列表渲染指令
+ `v-bind`：属性绑定指令
+ `v-on`：事件绑定指令
+ `v-model`：双向绑定指令

---

### 你总结的Vue的最佳实践是什么
1. 必要的：
+ data必须是一个函数
+ props的定义尽量写的详细
+ v-for一定要设置键值
+ 避免v-for和v-if一起使用
+ 为组件的样式设置作用域
2. 强烈推荐的
+ 每个组件单独成文件
+ 文件名要统一，要么都是大写开头要么都是小驼峰
+ template中的表达式要尽量简写，复杂的表达式应该使用计算属性或者方法
+ 指令要么都缩写要么都不缩写

---

### Vue3.0和2.0有什么不同？
1. 项目目录结构
+ 3.0移除了配置文件目录：config和build文件夹，移除了static静态文件夹，新增了public文件夹，index.html移动到public中
---
2. 配置项
+ 3.0的config文件夹被移除，但是多了.env.production和.env.development文件，除了文件位置，实际配置起来和2.0没什么不同
+ 没了config文件，跨域需要配置域名时，从config/index.js挪到了vue.config.js中，配置方法不变
---
3. 渲染
+ 2.0使用VirtualDom实现的渲染
+ 3.0如果是原生html标签，在运行时直接通过VirtualDom来直接渲染，如果是组件会直接生成组件代码
---
4. 数据监听
+ 2.0 使用的是`Object.defineProperty()`实现响应式
+ 3.0 基于proxy进行监听
---

### Runtime Only版本和Runtime+Compiler版本有什么区别？
我们在使用vue-cli初始化我们的项目时，通常会询问我们用Runtime Only版本还是Runtime+Compiler版本

1. `Runtime Only`：我们在使用Runtime Only版本的vue.js时，通常需要借助如webpack的vue-loader工具把.vue文件编译成JavaScript，因为是在编译阶段做的，所以只包含运行时的代码，因此代码体积会更轻量

2. `Runtime + Compiler`：如果没有对代码做预编译，但又使用了vue的template属性并传入一个字符串，则需要在客户端编译模板。Compiler就是使用的vue版本在发布的时候可以使用template标签，vue会在运行的时候识别这些template并帮我们转化成render函数，也就是在运行时帮我们编译。

3. 在2.0中，最终渲染都是通过render函数，如果写template数学，则需要编译成render函数，那么这个编译过程会发生在运行时，需要带有编译器的版本。很显然这个过程会有一定的损耗，所以我们更推荐Runtime Only版本
```js
// 需要编译的版本
new Vue({
  template:'<div>{{hi}}</div>'
})

// 不需要编译的版本
new Vue({
  render(h){
    return h('div',this.hi)
  }
})
```

---

### Vue的响应式原理中，Object.defineProperty有什么缺陷？为什么在3.0中采用了Proxy？
1. `Object.defineProperty`无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应
2. `Object.defineProperty`只能劫持对象的属性，从而需要对每个对象、每个属性进行遍历。如果属性的值是对象，还需要深度遍历。`Proxy`可以劫持整个对象，并返回一个新的对象
3. `Proxy`不仅可以代理对象，还可以代理数组，代理动态增加的属性

---

### v-if和v-for的优先级是什么
`v-for`比`v-if`的优先级要高，这意味着`v-if`将被重复运用于每个`v-for`循环中，每次渲染都会进行条件判断，这样会带来性能的浪费，这就是为什么不建议将`v-for`和`v-if`放在同一个元素上。

如果将v-for于v-if置于不同的标签，会先进行判断，再进行列表渲染

---

### v-if和v-show的区别
1. `v-if`是通过控制dom节点的存在与否来控制元素的显示与隐藏
2. `v-show`是通过设置DOM元素的display样式，block为显示，none为隐藏

如何选择使用：
+ `v-if`判断是否加载，可以减轻服务器的压力，有更高的切换开销。
+ `v-show`调整DOM元素的CSS display属性，可以使客户端的操作更加流畅，但是有更高的初始渲染开销。`v-show`也会发生浏览器的重排，由于改变的是display属性，涉及到DOM结构的改变。

如果需要频繁地切换，使用v-show较好；如果在运行时，条件很少改变，使用`v-if`较好

---

### 从后台获取的数据层级比较多，导致修改Vue的数据没有对dom进行重新渲染

解决办法：
1. 首先从后端数据结构优化：合理的数据结构，后端易查、易存储；前端易读取、易展示，可以最大限度地避免各种额外的数据结构，数据结构宜简不宜繁
2. 如果后端数据结构没法改变：
+ `this.$set`
+ `this.$forceUpdate`

---

### Vue项目中你遇到哪些坑
1. 数据更新了，页面不渲染
+ 平铺数据，把对象里的每一个属性都在data里面声明一下
+ `this.$set`对象的属性
+ `this.$forceUpdate`

2. 页面缓存的坑：有个填写信息的页面，需要填写一部分信息，进入其他页面。返回的时候，页面上填写的信息已经被销毁了。解决方法：
+ 使用Vue的`keep-alive`来完成页面的缓存

3. axios请求中的post请求：参数一直传不到后端那边，需要自己使用qs这个包的方法再将参数包装一层序列化传参

4. 路由传参的坑：使用路由传参，但是当本页面刷新的时候，页面上是没有参数的，因为参数是从上个页面带过去的。解决办法：
+ 使用缓存或者vuex状态管理

---

### v-for获取列表前n个数据、中间范围数据、末尾n条数据的方法
1. 前n个数据：`item.slice(0,n)`或者`v-if='index<n'`
2. 中间范围的数据：`slice(n,2n+1)`
3. 末尾n条：`slice(item.length-n,item.length)`

---

### Vue的生命周期
Vue中每个组件都是独立的，每个组件都有一个属于它自己的生命周期；从一个组件的创建、数据的初始化、挂载、更新、销毁，这就是一个组件所谓的生命周期。

---

### ajax请求是放在created里面好还是mounted里好
Vue中建议放在created里面，页面渲染完成之前就把数据加载到。

为什么不放在mounted里面？因为放在mounted里面，这个时候数据有可能还没请求回来，页面不知道渲染什么，会把差值绑定的模板{{}}渲染出来，当拿到数据时再渲染数据会出现闪屏

---

### computed和method的区别
`computed`属性调用带有缓存功能，而`methods`是函数调用不带缓存

---

### 为什么Vue的data要写成返回对象的函数
当一个组件被定义，data必须声明为返回一个初始数据对象的函数，因为组件很有可能被用来创建多个实例。

如果data是一个单纯的对象，则所有的实例将共享同一个数据对象。

反之，如果data是一个函数，我们通过调用函数，每次创建一个实例后，都会返回一个全新的副本data对象。

```js
// 1.0 返回一个对象 所有重用的实例中data均为同一个对象
var data = {
  x:1
}
var vm1 = {
  data:data
}
var vm2 = {
  data:data
}
vm1.data === vm2.data // true 指向同一个对象

// 2.0 函数方式 所有重用的实例中data均为同一个函数 返回新对象
var func = function(){
  return {
    x:1
  }
}
var vm3 = {
  data: func
}
var vm4 = {
  data: func
}
vm3.data === vm4.data; // false 指向不同的对象
```
---

### Vue中父子组件传值
1. 父向子：`props`
2. 子向父：`this.$emit`

---

### Vue3.0发布了，你升级了吗？出于哪方面考虑呢
1.首先看下api，看看变化是否非常大
+ 如果变化不大，可以根据工作需求
+ 如果变换很大，正好项目也有重构计划，就评估工作量，可以考虑重构

---

### 为什么Vue被称为渐进式框架？你是怎么理解的？
每个框架都不可避免会有一些自己的特点，从而会对使用者有一定的要求，这些要求就是主张，主张有强有弱，它的强势程度会影响在业务开发中的使用方式。Vue的主张最少。

Vue的每一个功能，都可以抽离出来当成一个js库使用，比如表单验证、用Vue管理页面dom，都可以抽象成一个小组件去使用，或者加入Vue-router开始做一个小型的网站。

而不像React有自己的运行环境，你必须了解什么是函数编程理念、什么是纯函数、如何隔离副作用等一系列概念。

我们可以在现有的程序上使用Vue，也可以使用Vue来构建一个完整的工程：

---

### Vue上如何动态绑定class样式
Vue的一个元素上可以同时存在class和:class
```js
// 1.0 对象的形式
<div class="bottom" :class="{'footer':isActive}"></div>

// 2.0 数组的形式
<div class="bottom" :class="[isActive?'active':'disabled']"></div>
```

---

### Vue的修饰符有哪些，有什么作用？
1. 表单修饰符
+ `v-model.lazy`：我们输完所有的东西，光标离开才会更新视图
+ `v-model.trim`：过滤空格
+ `v-model.number`：限制输入的只能是数字
---
2. 事件修饰符
+ `@click.stop`：相当于`event.stopPropagation()`阻止事件冒泡
+ `@submit.prevent`：阻止事件的默认行为，当点击提交按钮的时候阻止对表单的提交，相当于`event.preventDefault()`方法
+ `@click.self`：当事件是从事件绑定的元素本身触发时才触发回调
+ `@click.once`：绑定了事件以后只能触发一次，第二次就不会被触发
+ `@click.capture`：事件冒泡的完整机制是：捕获阶段 -> 目标阶段 -> 冒泡阶段，当我们加上了这个修饰符之后，事件触发从包含这个元素的顶层开始往下触发
+ `@scroll.passive`：当我们在监听元素滚动事件的时候，会一直触发onscroll事件，在pc端没啥问题，但是在移动端，会让我们的网页变卡，因此当我们使用这个修饰符的时候，相当于给onscroll事件加了一个`.lazy`修饰符
+ `@click.native`：我们经常会写很多组件，有些组件会需要绑定一些事件，但是，像这么绑定事件是不会触发的：
```js
<My-component @click="shout()"></My-component>
```
必须使用`.native`来修饰这个click事件，可以理解为该修饰符的作用就是把一个Vue组件转化为一个普通的HTML标签
---
3. 鼠标按键修饰符
+ `.left`：左键点击
+ `.right`：右键点击
+ `.middle`：中键点击
---
4. 键值修饰符
+`@keyup.keyCode`：键盘修饰符
---
5. v-bind修饰符
+`.sync`：有时候我们可能需要对props进行双向绑定，也就是修改props的值，但是如果修改props的值会带来维护上的问题，因为单向数据流子组件不能随便修改父组件传递过来的值，我们通常的做法是：
```js
// 父组件
<comp :message='bar' @update:myMessage='func'></comp>
func(e){
  this.bar = e;
}
// 子组件
func2(){
  this.$emit('update:myMessage',params)
}
```
使用`.sync`的做法是：
```js
// 父组件
<comp :myMessage.sync="bar"></comp>
// 子组件
this.$emit('update:myMessage',params)
```
<font style='color:red'>当一个子组件改变了一个 prop 的值时，这个变化也会同步到父组件中所绑定的值</font>
---

### Vue中更新组件的方式有哪些
1. 不好的方法：使用v-if实现销毁和重新渲染
2. 较好的方法：使用Vue内置的`forceUpdate`方法，让实例重新渲染
3. 最好的方法：在组件上进行key的修改，更改key相当于重新渲染一个组件，用key管理可复用元素，Vue会尽可能高效地渲染元素

---

### Vue的某个属性连续修改多次，会渲染几次？为什么？
Vue在更新DOM时是异步执行的，只要侦听到数据的变化，Vue将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个watcher被多次触发，只会被推入到队列中一次。

---

### Vue-router的query和params的区别
1. $router和$route的区别
+ $router是VueRouter的实例，想要导航到不同的url，则使用`$router.push`方法
+ $route为当前router跳转的对象，里面可以获取name、path、query、params等

---

2. params和query的区别
(1) params方式传参
```js
this.$router.push({
  name:"xxx",
  params:{
    id:id
  }
})
// 接收
this.$route.params.id
```

(2) query方式传参
```js
this.$router.push({
  path:"/xxx",
  query:{
    id:id
  }
})
// 接收
this.$route.query.id
```
(3) 区别
+ query方式生成的url为/xxx?id=id，params方式生成的url为xxx/id
+ path只能用query的方式
+ params方式要注意的是需要定义路由信息如：path:'/xx/:id'，这样才能进行携带参数跳转，否则url不会进行变化，并且再次刷新页面参数会读取不到。

---

### Vue中的watch和created哪个先执行？
1. 结论：
+ watch中的`immediate`为true会让监听在初始值声明的时候就去执行，否则就是created先执行

2. 为什么：
在Vue生成实例初始化时，源码是这样的：
```js
//...
initState(vm);
initProvide(vm);
callHook(vm, 'created');
//...
```
`initState`里面包含了watch的初始化，其中watch的初始化又包含了一段逻辑
```js
if (options.immediate) {
  cb.call(vm, watcher.value)
}
```
所以，watch如果声明了immediate属性为true就会在created生命周期之前执行，否则就是created先执行

---

### scoped
1. 原理
当一个style标签拥有scoped属性的时候，它的样式只能作用于当前Vue组件，可以使组件的样式不相互污染。如果一个项目所有的style标签都加上了scoped属性，相当于实现了样式的模块化。

2. 穿透
如果想要修改第三方组件的样式库，就会需要使用scoped的穿透。stylus样式的穿透使用>>>，sass和less的穿透使用/deep/

---

### SPA单页面应用首屏加载比较慢应该如何解决
1. 什么是首屏时间：指的是浏览器从响应用户输入网址地址，到首屏内容渲染完成的时间。
2. 加载慢的原因：在页面渲染的过程中，导致加载速度慢可能是：
+ 网络延迟问题
+ 资源文件体积过大
+ 资源是否重复发送请求
+ 加载脚本的时候，渲染内容堵塞了
3. 如何解决：
+ 减少入口文件体积：常用的手段是路由懒加载，把不同路由对应的组件分割成不同的代码块，当路由被请求的时候会单独打包路由，使得入口文件变小，加载速度大大增加
+ 静态资源本地缓存
+ UI框架按需加载
+ 避免组件重复打包：假设A.js是一个常用的库，现在又多了路由使用A.js文件，这就造成了重复下载。解决方案是在webpack的config中，修改CommonChunkPlugin配置，miniChunks:3表示会把使用3次及以上的包抽离出来，放进公共依赖文件，避免重复加载组件
+ 图片资源压缩：对于所有的图片资源，我们可以进行适当的压缩，对页面上使用到的icon，可以使用在线字体图标或者雪碧图，将众多的小图标合并到一张图上，以减轻服务器的请求压力
+ 服务端渲染技术：组件或者页面通过服务器生成html字符串，再发送到浏览器

---

### Vue中组件和插件有什么区别？
1. 组件就是把整个应用拆分成不同的模块，往往一个模块就是一个功能模块
2. 插件通常是添加一些全局的功能，比如全局的方法或者属性、全局的资源、实例方法、API等等

---

### 在Vue中传递$event，使用e.taregt和e.currentTarget有什么不同
1.`e.target`指向事件发生的元素
2.`e.currentTarget`指向事件所绑定的元素

---

### watch的属性用箭头函数定义，结果会怎样？
箭头函数绑定了父级作用域的上下文，所以this将不会按照期望指向Vue实例。此时this指向的是Window
```js
var vm = new Vue({
  el: "#app",
  data: {
    a: 1,
    b: 2,
    sum: 3
  },
  watch: {
    a: ()=>{
 			console.log(this);
      this.sum = this.a + this.b;
    },
    b: ()=>{
      this.sum = this.a + this.b;
    }
   }
  })
```
在控制台输入`vm.a=10`，此时this会打印出来属于Window

---

### Vue中key的原理
1. 作用：

+ 主要用在Vue的虚拟DOM算法，在新旧node对比时辨识VNodes，相当于唯一标识ID
+ Vue会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染，因此使用key值可以提高渲染效率，同时改变某一元素的key值会使该元素重新被渲染

---
2. 原理：
Vue在patch的过程中，会执行patch vnode，patch vnode的过程中会执行updateChildren这个方法，他会去更新两个新旧的子元素。在这个过程中，会调用sameNode方法，sameNode方法就是通过判断两个key是不是相同来决定是否需要重新渲染。
+ 如果没有加key的话，永远会认为是相同的节点，所以能做的操作只有强制地更新，频繁地dom更新会使得性能变差
+ 如果加上key，元素不会发生大量的位置变化，效率会更高

```js
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&//标签名
        a.isComment === b.isComment &&//是否为注释
        isDef(a.data) === isDef(b.data) &&//data有没有发生变化
        sameInputType(a, b)//是不是input类型
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
---

3. 总结
+ key的作用是：
  + 更新组件时判断两个节点是否相同，相同就复用，不相同就删除旧的节点创建新的节点。
  + 能够提升diff同级比较的效率
  + 避免不带key原地复用带来的副作用：比如动画过渡失效等
+ 不带key：
  + 在简单模板下，不带key，当只有数据变化时，只需要修改DOM文本内容而不是移除/添加节点，这样可以更有效地复用节点、diff速度也会更快，因为带key增删节点上有耗时。
---

### 为什么data、props、methods不能同名？
因为它们最终都会被挂在Vue实例上。源码中也会有判断和提示。

---

### 什么是异步组件
异步组件就是通过import()函数引入，什么时候需要什么时候才加载。

Vue中组件的三种引入方式：
1. 传统引入方式，即最常见的引入方式
```js
import LeftLine from "@/views/components/xxx"
components: {
  LeftLine
}
```
---
2. import方式 - 异步方式
```js
components:{
  LeftLine:()=>import("@/views/components/xxx")
}
```

---
3. 按需引入方式 - 异步方式
```js
components:{
  LeftLine:resolve=>require(["@/views/components/xxx"],resolve)
}
```
这种方式和import引入的方式差不多。

---

### Vue的响应式原理中，Object.defineProperty()有什么缺陷？
1. Object.defineProperty无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应。
+ 为了解决这个问题，经过Vue内部处理后可以使用以下几种方法来监听数组：
  + push()
  + pop()
  + shift()
  + unshift()
  + splice()
  + sort()
  + reverse()
2. Object.defineProperty只能劫持对象的属性，从而需要对每个对象、每个属性进行遍历。如果对象的属性值是对象，还需要进行深度遍历。
3. Proxy可以劫持整个对象，并返回一个新的对象。不仅仅可以代理对象，还可以代理数组。

---

### Vue是如何对数组方法进行变异的？例如push、pop、slice等方法
1. 定义：在Vue中，对响应式的处理利用的是Object.defineProperty对数据进行拦截，而这个方法并不能监听到数组内部的变化，包括数组长度的变化、数组截取的变化等。

Vue将被侦听的数组的变异方法进行了包裹，所以它们也将会触发视图的更新。

2. 源码实现：在原型上利用Object.defineProperty重写这些方法
```js
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto)
['push','pop','shift','unshift','splice','sort','reverse'].forEach(method=>{
  const original = arrayProto[method];
  Object.defineProperty(arrayMethods,methods,{
    value: function mutaor(...args){
      return original.apply(this,args);
    },
    enumerable: false,
    writable: true,
    configurable: true
  })
})

```
---

### Vue的父组件和子组件生命周期钩子执行顺序是什么？
1. 加载渲染过程：`父beforeCreate` -> `父created` -> `父beforeMount` -> `子beforeCreate` -> `子created` -> `子beforeMount` -> `子mounted` -> `父mounted`
2. 子组件更新过程：`父beforeUpdate` -> `子beforeUpdate` -> `子updated` -> `父updated`
3. 父组件更新过程：`父beforeUpdate` -> `子updated`
4. 销毁过程：`父beforeDestroy` -> `子beforeDestroy` -> `子destroyed` -> `父destroyed`

---

### Vue渲染大量数据时应该怎么优化？
1. 如果一次性传入大量数据
+ 跟提供数据的沟通
+ 增加加载动画提升用户体验
+ 避免浏览器处理大量的dom
+ 服务端渲染
+ 懒加载

2. 如果并非一次性传入大量数据而是分段加载，但次数特别多
+ 异步渲染组件
+ 使用vue的v-if最多显示一屏，避免出现大量的dom节点
+ 分页

---

### preload和prefetch的区别
1. 背景：
在preload和prefetch之前，我们一般根据编码需求通过link或者script标签引入页面渲染和交互所依赖的js和css等，然后这些资源由浏览器决定优先级进行加载、解析、渲染等。

但是有些资源，我们需要某些依赖在进入渲染的主流程之前就希望被加载，但是实际资源加载的状况并不受我们控制，而是根据浏览器内部决定资源的优先级等状况进行加载的。

preload和prefetch的出现为我们提供了可以更加细粒度地控制浏览器加载资源的方法，在我们的资源被使用的时候就不必再去等待网络的开销。

2. 使用
+ preload提前加载：preload是一种预加载方式，通过向浏览器声明一个需要提前加载的资源，当资源真正被使用的时候立即执行无需等待网络的消耗
`<link rel="preload" href="/path/to/style.css" as="style">`

+ prefetch预判加载：告诉浏览器未来可能会使用到的某个资源，浏览器会在空闲时去加载对应的资源，用法和preload一样

3. 总结
对于那些可能在当前页面使用到的资源可以利用preload，而对一些可能在将来的某些页面被使用的资源可以利用prefetch。从加载优先级上看，preload会提升请求优先级，而prefecth会把资源的优先级放在最低，等浏览器空闲时才会去预加载

---

### 





























































































































































































### v-model原理
v-model是语法糖，:value+@input
```js
<input v-model="name" />
// 等价于
<input :value="name" @input="name=$event.target.value" />
```

使用`Object.defineProperty()`将name变成响应式的，同时在模板编译的文件中，区分v-model指令，如果是v-model指令，就需要监听表单输入框的input事件，这样就能达到双向绑定的效果。

---

### Vue的响应式原理
Vue的响应式主要依赖于JS方法`Object.defineProperty()`对数据添加get/set实现：当我们访问这个数据时，会自动调用get方法；当我们设置这个数据时，会自动调用set方法。

在创建Vue实例的过程中，Vue会遍历data里面的每一个属性，为其添加getter/setter对数据进行劫持，在getter里面收集依赖，在setter里面通知依赖的更新。

涉及到三个类：
+ `Observer`：将普通数据转为响应式数据，从而实现响应式对象
+ `Watcher`：观察者类，用来生成观察者
+ `Dep`：被观察者类，用来生成被观察者

---

### 计算属性
### 监听属性
### Vue.$nextTick原理

---

### 参考链接
[Good](https://vue3js.cn/interview/vue/key.html#%E4%B8%89%E3%80%81%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90)
