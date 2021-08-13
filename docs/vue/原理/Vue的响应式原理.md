### Vue的响应式原理

很多人把双向绑定就等同于响应式，其实是不对的。这两者是不一样的：

1. 双向绑定是指model和view之间的绑定，是双向的
2. 响应式是一种基于订阅发布的技术，是单向的，可以用来实现前者
3. 响应式可以说是双向绑定的一半

---

### Object.defineProperty
Vue的数据响应式原理是基于JS方法`Object.defineProperty()`来实现的。该方法不兼容IE8和FF22及以下版本浏览器，这也就是为什么Vue只能在这些版本之上的浏览器中才能运行的原因。

Vue3使用`proxy`方法实现响应式。

---

#### 语法
`Object.defineProperty(obj,prop,descriptor)`

其中，descriptor是指属性描述符，分为两种：

1. 数据描述
+ value
+ writable
+ enumerable
+ configurable

2. 存取器描述
+ get描述符：当访问属性时，会调用此函数
+ set描述符：当修改属性值时，会调用此函数

一旦对象拥有了getter/setter方法，我们可以简单将该对象称为响应式对象。这两个操作符为我们提供拦截数据进行操作的可能性。

在属性描述中，用了get/set属性来定义对应的方法，当使用了get/set之后，不允许使用writable/value

```js
Object.defineProperty(obj,"key",{
  get:function(){},
  set:function(){},
  configurable:true,
  enumerable:true
})
```
---

#### 简单响应式的实现
+ `Dep`：被观察者类，用来生成被观察者
+ `Watcher`：观察者类，用来生成观察者
+ `Observer`：将普通数据转为响应式数据，从而实现响应式对象

---

#### 具体实现
① Dep被观察者类

```js
class Dep {
  constructor(){
    this.subs = []
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(data){
    this.subs.forEach(sub=>sub.update(data))
  }
}
```
---

② Watcher
```js
class Watcher {
  constructor(cb){
    this.cb = cb
  }
  update(data){
    this.cb(data)
  }
}
```

---

③ Observer
```js
class Observer {
  constructor(vm,data){
    this.defineRetive(vm,data)
  }
  defineReactive(vm,obj){
    for(let key in obj){
      Object.defineProperty(obj,key,{
        configurable: true,
        enumerable: true,
        get() {
          let watcher = new Watcher((v) => (vm.innerText = v));
          dep.addSub(watcher);
          return value;
        },
        set(newValue) {
          value = newValue;
          dep.notify(newValue);
        },
      })
    } 
  }
}
```

---

### 参考链接
[Good](https://segmentfault.com/a/1190000038921922)

---

### 总结
1.Vue的响应式原理的实现一种基于订阅发布的技术：
+ 有一个被观测的数据对象Dep类，以及一堆观察者也就是依赖者Watcher类。其次还有一个Observer类。
+ 基于JS的方法Object.defineProperty()，用于给数据添加get/set变成响应式数据

2. Vue3以后使用的是proxy，原理跟Object.defineProperty()一样