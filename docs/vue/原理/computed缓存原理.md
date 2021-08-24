### 计算属性的缓存原理

#### 初始化过程
① `initComputed`的时候，会为每一个计算属性实例化一个watcher，

watcher的初始状态中，有一个代表是否需要重新求值的属性dirty，dirty的默认值是true，也就是首次在模板中访问计算属性（`watcher.evaluate()`）的时候，肯定是要求值的.
```js
{
    deps: [],
    dirty: true,
    getter: ƒ sum(),
    lazy: true,
    value: undefined
}
```
---

② `watcher.evaluate()`先求值，然后把dirty置为false，下次没有特殊情况再次读取计算属性的时候，发现dirty是false，直接就会返回watcher.value这个值,

<font style="color:blue">这其实就是计算属性缓存的概念</font>

```js
evaluate () {
  // 调用 get 函数求值
  this.value = this.get()
  // 把 dirty 标记为 false
  this.dirty = false
}
```
---

#### 更新时
初次访问计算属性时，dirty默认为true，因为第一次访问计算属性，肯定是要计算的.

接下来我们需要看一下更新流程，看看下面例子中count的更新是怎么触发sum在页面上的变更的

```js
<div>{{sum}}</div>

<script>
  data:{
    count: 1
  },
  computed:{
    sum(){
      return this.count + 1 
    } 
  }
</script>
```
---
① 当第一次在模板中读取计算属性sum时，我们会执行`evaluate()`函数操作
```js
evaluate () {
  // 调用 get 函数求值
  this.value = this.get()
  // 把 dirty 标记为 false
  this.dirty = false
}
```
+ 进入`this.get()`，这里的get函数就是用户传入的sum函数，sum函数在执行的时候读取到了`this.count`
---

② count是一个响应式的属性，这里会触发count的get劫持
```js
// 在闭包中，会保留对于 count 这个 key 所定义的 dep
const dep = new Dep()

// 闭包中也会保留上一次 set 函数所设置的 val
let val

Object.defineProperty(vm, 'count', {
  get: function reactiveGetter () {
    const value = val
    // Dep.target 此时就是计算watcher
    if (Dep.target) {
      // 收集依赖
      dep.depend()
    }
    return value
  },
})
```
+ <font style="blue">count会收集计算watcher作为依赖</font>

---

③ 依赖是如何收集的呢？
```js
// dep.depend()
depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}
// watcher 的 addDep函数
addDep (dep: Dep) {
  // 这里做了一系列的去重操作 简化掉 
  
  // 这里会把 count 的 dep 也存在自身的 deps 上
  this.deps.push(dep)
  // 又带着 watcher 自身作为参数
  // 回到 dep 的 addSub 函数了
  dep.addSub(this)
}

// addDep
class Dep {
  subs = []

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
}
```
+ 这里的`Dep.target`就是该计算属性的watcher
+ <font style="red">这样就保存了计算watcher作为count的dep依赖了</font>

---
④ 经历了以上的收集流程后，此时的一些状态：
【sum的计算watcher】：
```js
{
  deps: [ count的dep ],
  dirty: false, // 求值完了 所以false
  value: 2, // 1 + 1 = 2
  getter: ƒ sum(),
  lazy: true
}
```
【count的dep】：
```js
{
  subs: [ sum的计算watcher ]
}
```
---
⑤ 当count更新时，回到count的响应式劫持里面去：
```js
// 在闭包中，会保留对于 count 这个 key 所定义的 dep
const dep = new Dep()

// 闭包中也会保留上一次 set 函数所设置的 val
let val

Object.defineProperty(vm, 'count', {
  set: function reactiveSetter (newVal) {
      val = newVal
      // 触发 count 的 dep 的 notify
      dep.notify()
    }
  })
})
```
---
⑥ 进入count的notify()函数
```js
class Dep {
  subs = []
  
  notify () {
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```
---
⑦ notify函数的作用是通知依赖进行更新，我们再次进入更新函数
```js
update () {
  if (this.lazy) {
    this.dirty = true
  }
}
```
<font style="red">仅仅是把dirty属性重新变成了true，等下次访问计算属性时，重新计算即可</font>

---

### 总结缓存流程
计算属性的缓存，通过控制一个字段`dirty`来实现，当`dirty`为true时，会重新计算值，当`dirty`为false时，会直接返回计算属性上一轮计算的值

1. 初始化时
+ 在`initComputed`的过程当中，会遍历计算属性，创建对应的Watcher，给每个计算属性添加响应式监听，此时会默认给dirty赋值为true,因为第一次访问计算属性，肯定是要经过计算的
+ 计算函数`watcher.evaluate()`内部，会在计算结束之后，将dirty字段重新赋值为true，当下次访问时，没有意外（依赖更新）时，会直接返回上一轮计算的值

2. 更新时
+ 当我们第一次访问计算函数，执行`watcher.evaluate()`时，其实调用的是计算函数的getter函数
+ getter函数内部依赖了data里面的属性值，而data里面的属性是响应式属性，会触发data属性的get和set进行劫持

+ 当访问data里面的属性时，会自动调用get函数，此时把当前计算属性作为依赖添加进data数据的依赖数组里
（例子中的count）

+ 当count发生了改变，就会遍历自己的依赖数据，依次通知`notify()`更新，而更新函数`update()`仅仅是把dirty字段重新置为了true，这样当模板中访问计算属性时，就会重新调用sum的计算函数了

+ 当count没有发生改变，在取值操作时根据自身标记dirty属性返回上一次的计算结果
---

### 参考链接
[Vue的计算属性真的会缓存吗](https://cloud.tencent.com/developer/article/1614090)
