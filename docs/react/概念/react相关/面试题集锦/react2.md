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

