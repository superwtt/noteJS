### 声明式编程和命令式编程

#### 区别：
1. 声明式编程：声明式编程是一种编程范式，它关注的是你要做什么，而不是如何做。它表达逻辑而不是定义步骤。
2. 命令式编程：描述了如何去做


#### 代码示例：

将数组的每个元素乘以2，使用声明式map函数，让编译器来完成其余的工作，而使用命令式，需要编写所有的流程步骤
```javascript
const numbers = [1,2,3,4];

// 声明式
const newArray = numbers.map(item=>item*2);

// 命令式
const newArray = [];
for(let i=0;i<numbers.length;i++){
   const num = numbers[i]*2;
   newArray.push(num) 
}
```

---

### 什么是React

1. React是一个用于构建用户界面的javascript库。
2. 使用虚拟DOM来有效的操作DOM
3. 遵循从高阶组件到低阶组件的单向数据流

---

### 构建React项目的几种方式

1. 浏览器通过标签直接引入
```javascript
// 引入react
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>

// 引入react-dom
<script src="https://unpkg.com/react-dom@16/umd/react-dom.deelopment.js" crossorigin></script>

// 引入Babel,使浏览器可以识别JSX语法，如果不使用JSX语法，可以不引入
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
```

2. 使用官方脚手架<code>create-react-app</code>
3. 使用<code>webpack</code>、<code>babel</code>、<code>react</code>自己动手搭建

---

### this.setState是同步还是异步的
回答这个问题分为三个层次：

1. 通过`ReactDOM.render(<App/>,rootNode)`创建的应用统称为`legacy`模式
2. legacy模式下，`this.setState`是异步的，但是也是可以跳出异步的限制，变成同步更新的
+ 为什么是异步的：
  + 基于React源码中的性能优化特性`batchedUpdates`：多次`setState`会被合并成一个，并且是异步执行
  + 当我们触发了多个`this.setState`，React只会将多次触发合并成一次，减少性能的开销。如果一次`setState`就触发一个完整的更新流程触发一次re-render，那么页面没几次就卡死了
  + `batchedUpdates`方法，会将一个全局变量打上批处理的标签，进来先锁上，将这个变量变成true，表示：当前正处于批量更新中。当被“锁上”时，任何需要更新的组件只能暂时进入`dirtyComponent`队列中等待更新
  
+ 如何跳出异步的限制：
  + `this.setState`之所以是异步并且批量更新的，是因为React进来就把全局变量锁住，默认就是异步且批量更新的。是否命中`batchedUpdates`，是靠全局变量`executionContext`锁住的；
  + 当执行完回调之后，React又会将这个变量重置，所以我们只要在React释放这个变量的时候，执行`this.setState`就不会就不会命中`batchedUpdates`，变成同步执行
  + 将`this.setState`放到`setTimeout`中变成异步执行，由于fn回调执行完，会重置`executionContext`，那么等这个`setState`执行的时候，全局上下文已经不存在那个flag了，就不会命中`batchedUpdates`

---

### React和Vue有什么优缺点

#### 区别
1. 生成方式
+ React的思路是All in JavaScript，通过JavaScript生成HTML、通过JavaScript操作CSS
+ Vue是把HTML、CSS、JavaScript组合到一起，有自己单独的文件和模板引擎
2. 数据
+ React中是单向数据流，结合imutable来实现数据的不可随意改变（指的是视图上修改数据不会自动更新到实例的state里，而是要绑定事件）
+ Vue可以实现双向绑定，实例中的data与渲染的DOM保持一致，无论谁被改变，另一方都会响应地更新数据
3. 学习曲线
+ React学习曲线比较曲折，适合大型项目
+ Vue比较好上手，语法简洁，体积小，适合小中型项目

---

#### 优点
1. 都有前端的现金概念：组件化思想、虚拟DOM、生命周期等等
2. 都比较灵活，比传统的JQ更好使用
3. 文档和社区都比较丰富，有专人在不停地维护

---

### 什么是Virtual DOM及其工作原理
1. 概念
 + Virtual DOM是一个轻量级的JavaScript对象，将元素、属性、内容作为对象及其属性，经过循环生成节点树

2. 工作原理
 + 当用户触发更新时，会生成一个新的VDOM树
 + 计算新旧VDOM树之间的差异
 + 将差异更新到页面上

---

### 为什么浏览器无法读取JSX
1. 浏览器只能处理JavaScript对象，而无法直接读取JSX。
2. 为了让浏览器能够读取JSX，需要babel这样的JSX转换器将JSX文件转换成JavaScript对象，然后将其传给浏览器

---

### 你是怎么理解，React中一切皆组件这句话

组件是React应用的基本构建模块，这些组件将整个应用分割成小的、独立、并且可以重用的部分。

React中有很多组件的概念：容器组件、展示（UI）组件、无状态组件、有状态组件、函数组件、高阶组件等等

+ 容器组件：容器组件中实现一些具体的逻辑，引入UI组件作为其子组件，将子组件需要的数据通过组件间传值的方式传递到UI组件，进行数据的渲染
+ 展示组件：控制组件的展示，没有逻辑的耦合
+ 无状态组件：不涉及状态的更新，基本组成结构就是属性props加上一个渲染函数render。由于没有状态的影响，所以就是纯静态展示的作用，例如UI库中的按钮、输入框、图标等等
+ 有状态组件：组件内部包含state状态，并且会随着事件或者外部的触发而发生改变。有状态组件通常带有生命周期，用来在不同的时刻触发状态的更新，在写业务逻辑时常常会用到，不同的场景所用的状态和生命周期也不相同
+ 函数组件：使用函数编程的方式返回React元素，没有生命周期和状态state，用hooks模拟生命周期的执行
+ 高阶组件：用来给基础组件增加功能，减少公共的代码，如打印日志、获取数据、校验数据时，常常会抽象出一个高阶组件，减少代码的重复。

```javascript
// 1.0 展示组件和容器组件在一起，这个组件是没法复用的，因为数据的请求和数据的展示都在一个组件内进行，要实现组件的复用，我们就需要将展示组件和容器组件分离出来
class TodoList extends React.Component{
   constructor(props){
      super(props);
      this.state = {
         todos:[]
      }
   }
   componentDidMount(){
      this.fetchData();
    }
    fetchData(){
        fetch('/api/todos').then(data =>{
            this.setState({
                todos:data
            })
        })
    }
    render(){
      const {todos} = this.state;
      return (<div>
                <ul>
                  {todos.map((item,index)=>{
                      return <li key={item.id}>{item.name}</li>
                  })}
                </ul>
            </div>)
   }
}
// 2.0 拆分展示组件
class TodoList extends React.Component{
  constructor(props){
     super(props);
  }
  render(){
     const {todos} = this.props;
     return (<div>
             <ul>
                 {todos.map((item,index)=>{
                     return <li key={item.id}>{item.name}</li>
                 })}
             </ul>
         </div>)
  }
// 2.1 拆分容器组件  
class TodoListContainer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            todos:[]
        }
        this.fetchData = this.fetchData.bind(this);
    }
    componentDidMount(){
        this.fetchData();
    }
    fetchData(){
        fetch('/api/todos').then(data =>{
            this.setState({
                todos:data
            })
        })
    }
    render(){
        return (<div>
                <TodoList todos={this.state.todos} />    
            </div>)
    }
}
```

---

### React中函数式组件和类组件的区别
1. 语法上
+ 函数组件可以看成一个纯函数，接收一个props并返回React元素
+ 类组件需要去继承`React.Component`并且创建`render`返回React元素，这会需要更多的代码

2. 状态管理
+ 函数组件不能使用`setState`，这也是为什么把函数组件称为无状态组件的原因
+ 类组件可以使用`setState`管理内部状态

3. 生命周期钩子
+ 函数组件没有生命周期，只有hooks函数模拟生命周期的执行
+ 类组件的所有生命周期钩子都来自于继承的`React.Component`中

4. 调用方式
+ 如果`SayHi`是一个函数组件，React需要调用它：`const result = SayHi()`即可
+ 如果`SayHi`是一个类组件，React需要先用new操作符实例化，然后调用render方法
```javascript
// 函数组件
function SayHi(){
  return <p>Hello React</p> 
}
const result = SayHi(); //  <p>Hello React</p> 

// 类组件
class SayHi extends React.Component { 
    render() { 
        return <p>Hello, React</p> 
    } 
} 
const sh = new SayHi();
sh.render(); // <p>Hello, React</p>
```

---

### React中render()的目的


















