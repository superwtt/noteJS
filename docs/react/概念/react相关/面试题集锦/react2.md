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

1. 定义：`Portal`提供了一种将子节点渲染到存在于父节点以外的DOM节点的优秀方案

2. 代码示例：
```js
import { createPortal } from 'react-dom'

class Modal extends PureComponent {
  constructor(props){
    super(props)
    const doc = window.document
    this.node = doc.createElement('div')
    doc.body.appendChild(this.node)
  }
  componentWillUnMount(){
    window.document.body.removeChild(this.node)
  }
  render(){
    return createPortal(
      <div className="mask">
        <div className="modal">
          <h3>Modal</h3>
          {this.props.children}
        </div>
      </div>,
      this.node
    )
  }
}
```

3. 截图

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/portals.png)

4. 应用场景
对话框、悬浮卡以及提示框

---

### 说说你对Error Boundaries的理解

1. 定义：
+ 部分UI组件中的JavaScript错误不应该破坏整个应用程序。为了解决React用户的这个问题，React16引入了一个新的概念`Error Boundaries`
+ `Error Boundaries`可以捕获并打印发生在其子组件树任何位置的JavaScript错误，并且它会渲染出备用UI，而不是渲染那些崩溃了的子组件树。
+ 错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误

2. 示例代码
```js
// 1.0 error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error, info) {
    console.log(error)  
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

// 2.0 error component
class Bar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      counter: 0,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      counter: this.state.counter + 1,
    });
  }

  render() {
    console.log("component ErrorComponent render...");
    const { counter } = this.state;
    const { handleClick } = this;
    if (counter === 5) {
      throw new Error("counter creashed!");
    }
    return (
      <ErrorBoundary>
        <p>this component will throw Error when the counter equal to 5</p>
        <p>counter : {counter}</p>
        <button onClick={handleClick}>add</button>
      </ErrorBoundary>
    );
  }
}

// 3.0 出口函数
<div>
  <ErrorBoundary>
    <ErrorComponent />
  </ErrorBoundary>        
</div>
```

3. 不能使用的场景
+ 事件处理函数触发的错误，因为错误边界处理的是render中的错误，而事件处理函数不是发生在render的过程中
+ 异步代码
+ 服务端渲染
+ ErrorBoundary组件本身的错误

4. 与`try catch`对比
`try catch`适用于处理事件函数中的异常

---

### 你用过哪些React的第三方中间件
#### 常用中间件
React的数据管理中心redux常用的中间件是`react-thunk`、`react-saga`、`react-persist`

#### 常用组件
`react-loadable`、`withRouter`、`react-transition-group`

---

### 简要说一下React源码的执行流程
[图示](https://zhuanlan.zhihu.com/p/40987447)

---

### React的渲染原理
[图示](https://zhuanlan.zhihu.com/p/40987447)

---

### React.StrictMode是什么意思，有什么作用
1. `StrictMode`是一个用来标记出应用中潜在问题的工具，就像`Fragment`、`StrictMode`不会渲染出任何真实的UI，它为后代元素触发额外的检查和警告
2. 作用：
+ 识别不安全的生命周期组件
+ 有关旧式字符串ref用法的警告
+ 关于使用废弃的findDOMNode方法的警告
+ 检测意外的副作用
+ 检测过时的context API
---

### memo/useMemo/useCallback性能优化
1. memo：针对子组件不采用父组件参数时，则可以采用memo来减少子组件的渲染，达到性能优化
```js
import React, { useState, memo } from "react";

const Child = (props) => {
  console.log("子组件渲染");
  return <div>子组件</div>;
};

const ChildMemo = memo(Child)

const MemoComp = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button
        onClick={(e) => {
          setCount(count + 1);
        }}
      >
        +
      </button>
      <p>计数器：{count}</p>

      <!-- 子组件依赖父组件的count，这时候使不使用memo没有区别 -->
      <ChildMemo count={count} /> 

      <!-- 子组件不依赖父组件的count，这时候使用memo可以减少子组件的渲染 -->
      <ChildMemo /> 
    </div>
  );
};

export default MemoComp;
```

2. useMemo：
+ 把创建函数和依赖项数组作为参数传入useMemo，它仅会在某个依赖项改变时才会重新计算memoized的值，这种优化有助于避免在每次渲染时都进行高开销的计算
+ 如果没有提供依赖项数组，那么useMemo在每次渲染时都会计算新的值
+ useMemo(()=>fn, deps)相当于useCallback(fn, deps)
```js
import React, { useCallback, useEffect, useState, useMemo } from "react";

const MemoComp = () => {
  const [count, setCount] = useState(1);
  const [val, setValue] = useState("");

  // getNum的计算仅仅跟count有关，但是不用useMemo的话，无论是count还是val的变化，都会导致getNum重新计算
  // 这里我们希望val修改的时候，不需要再次计算

  // const getNum = ()=>{
  //   console.log("ddd");
  //   return Array.from({ length: count * 100 }, (v, i) => i).reduce(
  //     (a, b) => a + b
  //   );
  // }

  // 只有count变化的时候才会重新计算
  const getNum = useMemo(() => {
    console.log("ddd");
    return Array.from({ length: count * 100 }, (v, i) => i).reduce(
      (a, b) => a + b
    );
  }, [count]);

  return (
    <div>
      <h4>总和：{getNum}</h4>
      <div>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <input value={val} onChange={(event) => setValue(event.target.value)} />
      </div>
    </div>
  );
};

export default MemoComp;
```

3. useCallback：
+ 把内联回调函数以及依赖项数组作为参数传入useCallback，它将返回该回调函数的memoized版本，该回调函数只会在某个依赖项更新时才会调用

```js
import React, { useCallback, useState, memo } from "react";

const MemoComp = () => {
  const [count, setCount] = useState(1);
  const [val, setValue] = useState("");

  const getNum = useCallback(() => {
    return Array.from({ length: count * 100 }, (v, i) => i).reduce(
      (a, b) => a + b
    );
  }, [count]);

  return (
    <div>
      <Child getNum={getNum} />
      <div>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <input value={val} onChange={(event) => setValue(event.target.value)} />
      </div>
    </div>
  );
};

const Child = React.memo(function ({ getNum }) {
  console.log("子组件渲染了")
  return <h4>总和：{getNum()}</h4>;
});

export default MemoComp;
```

---

### useMemo和useCallback的区别
#### 相同点
1. useMemo和useCallback参数相同，第一个参数是函数，第二个参数是依赖项的数组
2. useMemo和useCallback都可以根据依赖项是否变化来决定是否重新计算
3. 第二个参数中放入你的依赖参数，为[]就只渲染一次，后面都不会渲染

#### 不同点
1. useMemo将调用fn函数并返回计算结果，一般用在高开销的计算
2. useCallback将返回fn函数而不调用它,一般用在子组件冗余的更新.
+ 有一个父组件包含子组件，子组件接收一个函数作为props，通常而言，如果父组件更新了，子组件也会执行更新，但是大多数场景下，更新是没有必要的，我们可以借助useCallback来返回函数，然后把这个函数作为props传递给子组件，这样子组件就会避免不必要的更新

```js
import React, { useCallback, useEffect, useState, useMemo } from "react";

const MemoComp = () => {
  const [count, setCount] = useState(1);
  const [val, setValue] = useState("");

  const getNum = useCallback(() => {
    return Array.from({ length: count * 100 }, (v, i) => i).reduce(
      (a, b) => a + b
    );
  }, [count]);

  return (
    <div>
      <Child getNum={getNum} />
      <div>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <input value={val} onChange={(event) => setValue(event.target.value)} />
      </div>
    </div>
  );
};

const Child = React.memo(function ({ getNum }) {
  console.log("子组件渲染了")
  return <h4>总和：{getNum()}</h4>;
});

export default MemoComp;
```

---

### useEffect和useLayoutEffect的区别
1. useEffect是异步执行的，而useLayoutEffect是同步执行的
2. useEffect的执行时机是浏览器完成渲染之后，而useLayoutEffect的执行时机是浏览器把内容真正渲染到界面之前，和componentDidMount等价
3. [参考链接](https://zhuanlan.zhihu.com/p/348701319)

---

### 说说虚拟DOM
虚拟DOM通过模拟真实DOM的树结构，收集大量DOM操作，通过diff算法对真实DOM进行最小化修改，减少浏览器重排、提升加载速度，达到优化网站性能的作用

---

### 什么是CRA以及它的好处
create-react-app CLI工具允许你快速创建和运行React应用程序，无需配置步骤。它包含了我们建立一个React应用程序所需要的一切。

---

### 挂载过程中的生命周期顺序是什么
+ `constructor`
+ `static getDerivedStateFromProps()`
+ `render()`
+ `componentDidMount()`

---

### React16中，即将废弃的生命周期有哪些
+ `componentWillMount`
+ `componentWillReceiveProps`
+ `componentWillUpdate`

---

### getDerivedStateFromProps的作用是什么？

1.将传入的props映射到state上面，是为了替代componentWillReceiveProps而存在的
```js
static getDerivedStateFromProps(nextProps, prevState){
  const { type } = nextProps;

  // 当传入的type发生变化时，更新state
  if(type !== prevState){
    return {
      type
    }
  }

  // 否则 对state不做任何操作
  return null
}
```
2.为什么是静态方法
静态函数的特点是，它不属于任何一个实例，因此，它内部的this指向并不是组件的本身，用户不能通过this.xxx去访问。
这样的设计，能够使得`getDerivedStateFromProps`变成一个纯函数，逻辑也相对比较简单，防止实例不安全的访问

---

### ES6 class类的静态方法有什么作用
1. 定义：类的静态的方法前面一般会加个static关键词，来声明它是个静态方法。静态方法通过实例不能访问到，只能直接通过类去访问
2. 作用：一般只有Array、String等原生类才会使用静态方法 自己写的组件我是没想到使用场景 就拿Array.isArray()来说 如果是Array的原型方法就没必要判断了 因为使用的肯定是Array的实例

---

### useImperativeHandle
对于子组件，如果是class组件，我们可以通过ref获取类组件的实例，但是在子组件是函数组件的情况，我们不能通过ref直接获取函数组件的实例，使用useImperativeHandle配合forwardRef就能达到效果

使用步骤：

#### 使用forWardRef包裹子组件
```js
const Son = (props)=>{}

const ForwarSon = forwardRef(Son); 

class Index extends React.Component{
  render(){
    return (
    <div>
      <ForwarSon  />
      <button onClick={this.handleClick.bind(this)}>操控子组件</button>
    </div>
  )
  }
}
```

---

#### 获取子组件
```js
const Son = (props,ref)=>{
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  return (
    <div>
      <input placeholder="请输入内容" ref={inputRef} value={inputValue} />
    </div>
  );
}

class Index extends React.Component{
  render() {
    return (
      <div style={{ marginTop: "50px" }}>
        <ForwarSon ref={(node) => (this.inputRef = node)} />
        <button onClick={this.handleClick.bind(this)}>操控子组件</button>
      </div>
    );
  }
}
```

---

#### 子组件暴露给外部调用的方法
```js
const Son = (props, ref) => {
  console.log(props);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  useImperativeHandle(
    ref,
    () => {
      const handleRefs = {
        /* 声明方法用于聚焦input框 */
        onFocus() {
          inputRef.current.focus();
        },
        /* 声明方法用于改变input的值 */
        onChangeValue(value) {
          setInputValue(value);
        },
      };
      return handleRefs;
    },
    []
  );

  return (
    <div>
      <input placeholder="请输入内容" ref={inputRef} value={inputValue} />
    </div>
  );
};
```

---

#### 父组件调用
```js
class Index extends React.Component {
  handleClick() {
    const { onFocus, onChangeValue } = this.inputRef;
    onFocus();
    onChangeValue("let us learn React!");
  }
  render() {
    return (
      <div style={{ marginTop: "50px" }}>
        <ForwarSon ref={(node) => (this.inputRef = node)} />
        <button onClick={this.handleClick.bind(this)}>操控子组件</button>
      </div>
    );
  }
}
```

---

### 