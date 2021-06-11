### super 关键字

`super`这个关键字，既可以当作函数使用，也可以当作对象，在这两种情况下，它的用法完全不同

---

#### 作为函数调用

1.`super`作为函数调用时，代表父类的构造函数。ES6 规定，子类的构造函数必须执行一次`super`函数

```js
// 1.0
class A {}
class B extends A() {
  constructor() {
    super(); // 子类B的构造函数必须执行一次super函数
  }
}

// 2.0
class A {
  constructor() {
    console.log(new.target.name);
  }
}
class B extends A {
  constructor() {
    super();
  }
}
new A(); // A
new B(); // B

// 3.0
class A {}
class B extends A {
  m() {
    super(); // 报错
  }
}
```

- 子类 B 的构造函数中的`super()`，代表调用父类的构造函数。这是必须的，否则 JavaScript 引擎会报错
- `super`虽然代表了父类 A 的构造函数，但是返回的却是子类 B 的实例，即`super`内部的`this`指的是 B 的实例，因此`super()`在这里相当于`A.prototype.constructor.call(this)`
- `super`作为函数时，只能用在子类的构造函数中，用在其他地方会报错

---

#### 作为对象使用

1. `super`作为对象时，在普通方法中，指向父类的原型对象

```js
// 1.0
class A {
  p() {
    return 2;
  }
}
class B extends A {
  constructor() {
    super();
    console.log(super.p()); // 2
  }
}

// 1.1
class A {
  constructor() {
    this.p = 2; // 定义在实例上的属性
  }
}
class B extends A {
  m() {
    return super.p; // super.p相当于，A.prototype.p，但是p是实例上的属性，所以这里引用不到它
  }
}
let b = new B();
b.m; // undefined

// 1.2
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}
class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  m() {
    super.print(); // 相当于A.prototype.print()，但是A.prototype.print()内部的this指向B而不是A，导致输出的结果是2
  }
}
let b = new B();
b.m(); // 2

// 1.3
class A {
  constructor() {
    this.x = 1; // 实例上的属性，protytpe上是没有的
  }
}
class B extends A {
  constructor() {
    super();
    this.x = 2;
    super.x = 3; // super.x 相当于this.x = 3
    console.log(super.x); // undefind，相当于A.prototype.x
    console.log(this.x); // 3
  }
}
```

- 子类 B 当中的`super.p()`，就是将`super`当作对象使用。这时，`super`在普通方法中，代表父类的原型对象，也就是`A.prototype`，所以`super.p()`相当于`A.prototype.p()`。
  - 由于`super`指向的是父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过`super`调用的
  - ES6 规定，在子类普通方法中通过`super`调用父类的方法时，方法内部的 this 指向当前的子类实例
  - 由于在子类的普通方法中，通过`super`调用父类的方法，方法内部的 this 执行当前的子类实例，所以，如果通过 super 对某个属性赋值，这时候的`super`就是 this，赋值的属性会变成子类实例的属性

---

2. `super`作为对象时，在静态方法中，指向父类

```js
class Parent{
   static myMethod(msg){
     console.log('static',msg)
   }
   myMethod(msg){
     console.log('instance',msg)
   }
}

class Child extends Parent{
   static myMethod(msg){
     super.myMethod(msg)
   }
   myMethod(msg){
     super.myMethod(msg)
   }
}
Child.myMethod(1); // static 1

var child = new Child();
child.myMethod(2); // instance 2


// 1.2
class A{
  constructor(){
     this.x = 1
  }
  static print(){
     console.log(this.x)
  }
}
class B extends A{
   constructor(){
      super();
      this.x = 2;
   }
   static m(){
      super.print(); // A.print，这个方法里的this指向的是B而不是B的实例
   }
}
B.x = 3;
B.m(); // 3

// 1.3
class A{}
class B extends A{
   constructor(){
      super();
      console.log(super); // 报错
   }
}
```

- `super`作为对象时，在普通方法中，代表父类的原型对象；在普通方法中，代表父类
  - 在子类的静态方法中通过`super`调用父类的方法时，方法内部的 this 指向当前的子类，而不是子类的实例
  - 使用`super`的时候，必须显式地指定是作为函数、还是作为对象使用，否则会报错

---

#### 在 React 中的使用

1. React 中的写法

```js
class MyComp extends React.Component {
  constructor(props) {
    super(props); // 相当于执行React.Component.prototype.constructor.call(this,props)，把父类的属性给继承过来
  }
}
```

2. `super()`相当于`React.Component.prototype.constructor.call(this)`，与继承有关

```js
// ES5中的继承
function sup(name) {
  this.name = name;
}
sup.prototype.printName = function () {
  console.log(this.name);
};

function sub(name, age) {
  sup.call(this, name); // 调用call方法，继承sup的属性
  this.age = age;
}
sub.prototype = new sup(); // 把子类sub的原型指向父类的实例化对象，这样就可以继承父类原型上的属性和方法
sub.prototype.constructor = sub; // 这时会有个问题constructor属性会指向sup，手动把constructor属性指向子类sub
sub.prototype.printAge = function () {
  console.log(this.age);
};

// ES6中的继承
class sup {
  constructor() {
    this.name = name;
  }
  printName() {
    console.log(this.name);
  }
}
class sub extends sup {
  constructor(name, age) {
    super(name); // super代表父类的构造函数，相当于sup.call(this,name)也就是sup.prototype.call(this)
    this.age = age;
  }
  printAge() {
    console.log(this.age);
  }
}
```

3. 为什么要传递 props？不传可以吗？

- 如果用到了`constructor`那就必须写 super(),用来初始化 this，绑定事件到 this 上
- 如果我们要在`constructor`中访问`this.props`，那么就必须传递`super(props)`，把 props 传进 super 是必要的，这使得基类`React.Component`可以初始化`this.props`，否则在super调用一直到构造函数结束之前，`this.props`都是未定义的：
  ```js
  // React内部
  class Component {
    constructor(props) {
      this.props = props;
    }
  }
  ```
- 无论有没有使用`constructor`，在 render 中都可以访问`this.props`
