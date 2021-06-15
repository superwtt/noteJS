### JavaScript的constructor有什么作用

+ JavaScript中的constructor属性不影响任何JavaScript的内部属性，其实没有什么用处，只是JavaScript设计语言的历史遗留物
+ 由于constructor属性是可变的，所以未必真的指向对象的构造函数，只是一个提示，从编程习惯上，我们应该尽量让对象的constructor指向构造函数，以保证原型链的正确性

```js
function Animal(name, age){
   this.name = name;
   this.age = age; 
}

function Cat(){}
console.log(Cat.prototype.constructor); // Cat

Cat.prototype = new Animal();
console.log(Cat.prototype.constructor); // Animal

Cat.prototype.constructor = Cat;
console.log(Cat.prototype.constructor); // Cat

```

---

### ES6的constructor有什么作用

+ constructor方法是类的构造函数，是一个默认方法，通过new命令创建对象实例时，自动调用该方法
+ 一个类必须拥有constructor方法，如果没有显式地定义，一个默认的constructor方法会被添加
+ 一般在构造函数方法里面初始化实例的属性，constructor中的this指的是实例对象

```js
// A类，方法写在constructor里面
class A{
  constructor(){
    this.show = function(){
      console.log('A show')    
    }  
  }
}
const a = new A();
a.show(); // A show

// B类，方法写在constructor外面
class B{
  constructor(){}
  show(){
    console.log('B show')  
  } 
}
const b = new B();
b.show(); // B show
```

区别：
+ A的show方法是实例上的方法，每次new的时候this的指向都会改变，生成的实例都不一样，所以每个实例的show方法肯定不一样
+ B的show方法是在prototype上

```js
const a1 = new A();
const a2 = new A();

const b1 = new B();
const b2 = new B();

a1.show === a2.show // false
b1.show === b2.show // true

```

---

### React中的constructor的作用是什么

+ 函数方法绑定到实例
+ 初始化状态this.state
+ 指定this: super(props)

---

### useState和setState有什么不同？

---

### React的mixins有什么作用？适用于什么场景？
1. 定义：在一些大型项目中，经常会存在多个组件需要使用相同功能的情况，如果每个组件都重复性的加入相同的代码，那么代码的维护性将会变得非常差，mixins的出现就是为了解决这个问题。可以将通用的方法包装成mixins方法，然后注入到各个组件中
```js
var SetIntervalMixin = {
  componentWillMount:function(){
    this.intervals = []
  },
  setInterval: function(){
    this.intervals.push(setInterval.apply(null, arguments))
  },
  componentWillUnMount: function(){
    this.intervals.map(clearInterval);
  }
}
var TickTok = React.createClass({
  mixins: [SetIntervalMixin],
  getInitialState: function(){
    return { second: 0 }
  }
  componentDidMount: function(){
    this.setInterval(this.tick, 1000)
  }
})
```

2. 为什么被废弃
+ mixin引入了隐式地依赖关系
+ 不同mixin之间可能会有先后顺序甚至代码冲突覆盖的问题
+ mixin代码会导致滚雪球式的复杂性

3. 区别
+ mixin类似于一个对象，引入对象的方法，mixin只提供方法不提供属性
+ 高阶组件是返回了一个具有公共属性和方法的新组件
+ 高阶组件的功能更强大一点，能抽离state、操作props，跟一个正常组件一样

---

### 什么是传送门portals
