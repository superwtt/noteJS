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

3. setState的缺点就是：不能立即拿到更新之后的值
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

React的核心思想是声明式渲染和组件化开发

组件是React应用的基本构建模块，这些组件将整个应用分割成小的、独立、并且可以重用的部分。

React中有很多组件的概念：容器组件、展示（UI）组件、无状态组件、有状态组件、函数组件、高阶组件等等

+ 容器组件：容器组件中实现一些具体的逻辑，引入UI组件作为其子组件，将子组件需要的数据通过组件间传值的方式传递到UI组件，进行数据的渲染
+ 展示组件：控制组件的展示，没有逻辑的耦合
+ 无状态组件：不涉及状态的更新，基本组成结构就是属性props加上一个渲染函数render。由于没有状态的影响，所以就是纯静态展示的作用，例如UI库中的按钮、输入框、图标等等
+ 有状态组件：组件内部包含state状态，并且会随着事件或者外部的触发而发生改变。有状态组件通常带有生命周期，用来在不同的时刻触发状态的更新，在写业务逻辑时常常会用到，不同的场景所用的状态和生命周期也不相同
+ 函数组件：使用函数编程的方式返回React元素，没有生命周期和状态state，用hooks模拟生命周期的执行
+ 高阶组件：用来给基础组件增加功能，减少公共的代码，如打印日志、获取数据、校验数据时，常常会抽象出一个高阶组件，减少代码的重复。
+ 受控组件：受控组件这个概念一般用于表单，区别受控组件和非受控组件很贱，就是是否用react来管理表单的值。在表单中，通常维护自己的一套state，并随着用户的输入自己进行UI上的更新。如果将React中的state属性和表单元素的值建立依赖，再通过onChange事件与setState更新state的属性，就能达到控制用户输入过程中表单发生的操作，被React以这种方式取值的表单元素就叫做受控组件
+ 非受控组件：我们仅仅想要获取某个表单元素的值，而不关心它是如何改变的，获取数据就相当于操作DOM，比如点击一个按钮，我们通过ref获取到DOM元素，再获取该元素的value值，这就不需要我们单独的维护一个状态，对于这种场景我们就称为非受控组件

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

```js
// 简单的高阶组件示例
import React, {Component} from "react";
export default (WrapperedComponent)=>{
   return class extends Component{
     constructor(props){
         super(props);
         this.state = {
             count:1; // 定义可复用状态
         }
     }
     componentDidMount(){
         alert('111')
     }
     // 定义可复用方法
     getCode(mobile){
         this.setState({count:mobile})
         console.log(mobile)
     }
     postVcode(mobile){
         //...
     }
     render(){
         return(
             <div>
               <WrapperedComponent getCode={this.getCode} state={this.state} {...this.props} />
             </div>
         )
     }
    } 
   } 
}

// 传入高阶组件
import React from "react";
import HOC from "./index";

class Register extends Component{
   render(){
      return (
        <div>
           <button onClick={()=>{this.props.getCode('126823345')}}>使用高阶组件里复用的方法</button>
           {this.props.state.count}
        </div>  
      ) 
   } 
}
export default HOC(Register)
```

---

### React自定义组件你写过吗？说说看都写过哪些
#### 一般写过两种：
+ 类组件
+ 函数组件

#### 根据用途又分为：
+ 无状态组件
+ 有状态组件
+ 容器组件
+ UI组件
+ 高阶组件
+ 等等

---

### React中函数式组件和类组件的区别
1. 语法上
+ 函数组件可以看成一个纯函数，接收一个props并返回React元素
+ 类组件需要去继承`React.Component`并且创建`render`返回React元素，这会需要更多的代码

2. 状态管理
+ 函数组件不能使用`setState`，这也是为什么把函数组件称为无状态组件的原因
+ 类组件可以使用`setState`管理内部状态

3. 生命周期钩子
+ 函数组件没有生命周期，只有hooks函数模拟生命周期的执行。函数组件本身是没有状态的，它的state是一种外部数据，用来维护内部的状态
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

```js
// MyComp看起来好像有状态，不是纯函数
function MyComp(){
  const [state,setState] = useState(0)
  return <div>{state}</div>
}
// 相当于
function MyComp({state,setState}){
  return <div>{state}</div>
}
// React内核生成“虚拟组件”，帮你维护组件状态
function MyCompoWrapper(){
  const [state,setState] = useState(0)
  return <MyComp state={state} setState={setState} />
}
// useState得到的状态，对于组件来说是一种外部传入的数据，和props、context本质上没有区别
// useState声明的状态，实际由React内核来维护，注入给函数组件，hooks时代的函数式组件依然是外部数据->view的纯函数
```

---

### React中render()的目的
1. 一个class组件必须要实现一个render方法，否则会报错`TypeError：instance.render is not a function`
2. render方法返回一个JSX元素，根据渲染原理将JSX渲染成真实的DOM映射到页面上

---

### React中的state和props
1. state是数据的来源，保存着该组件当前的数据状态，任何UI的改变，都可以从state的变化中反映出来
2. props是属性，一般用作父组件向子组件传值，是只读的，可以设置默认类型和默认值

---

### useLayoutEffect和useEffect的区别
1. 源码

---

### PureComponent和Component的区别
1. 区别：
`PureComponent`和`Component`唯一的差别就是：`PureComponent`帮我们做了`shouldComponentUpdate`的判断。而`Component`除非手写`shouldComponentUpdate`，否则一律返回true

```js
shouldComponentUpdate(nextProps, nextState){
   return !shallowEqual(this.props,nextProps) || !shallowEqual(this.state, nextState)
}

// 浅比较是否相等
function shallowEqual(objA, objB){
  if(objA, objB){ // Object.is相当于===
     return true 
  }
  if(
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null 
  ){
      return false
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  for(let i = 0; i<keysA.length; i++){
    if(
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ){
        return false
    }
  }
  return true
}
```

+ 当新的props即nextProps或者新的state即nextState与当前的值相比较没有发生变化时，组件不用更新;只有检测到state或者props发送变化的时候，才会重新调用render方法
+ 这里用了shallowEqual，只比较object的第一层key,value，因为进行deepEqual的对比是非常消耗性能的

2. 使用场景
`PureComponent`如果能够正确使用，那么可以代替一些`Component`的使用场景。那么如何正确使用呢？
+ 引用类型的数据，如果需要更新这个数据，那么必须重新创建一个再给这个数据赋值，这样始终保证props和state都是新的对象，这样浅比较就不会出错了


3. 优缺点
+ 优点：
  + `PureComponent` 不需要使用`shouldComponentUpdate`就可以使用简单的判断来提升性能，减少了不必要的render，不需要手写`shouldComponentUpdate`，节省了代码量

+ 缺点：
  + `PureComponent` 由于进行的是浅层比较，可能会由于深层数据的不一致而导致产生错误的判断，从而使得界面不更新；对于引用类型比较的只是内存的地址
  + 一个对象指向同一个地址会导致`PureComponent`不更新，相反地，每次都传入一个新对象就会导致`PureComponent`每次执行render，这样就跟`Component`没有区别了。
    ```js
     let a = {list:{title:'react line1'}}
     let b = {list:{title:'react line1'}}
     a !== b
    ```
  + `Component` 除非手写`shouldComponentUpdate`，否则一律返回true，也就是即使props和state没有改变，也会进行一遍re-render

4. `PureComponent`是不是任何情况下都比`Component`性能好？
```js
render(){
   const { item } = this.props;
   return <Post item={item} style={{'width': 120}}> 
}
```
+ 由于每次传入style都是一个新对象，所以我们可以预知这个组件每次都是需要renderer的。此时`PureComPonent`每次都要执行一次shadowEqual的对比，反而比 `Component`更耗性能

5. 结论

<font style="color:blue">如果你已经预知到某个组件的props或者state会频繁变动，那根本就不用使用PureComponent</font>

6. 参考链接

[segmentfault](https://segmentfault.com/a/1190000018641319)

---

### 说说你喜欢React的原因是什么？它有什么优缺点？
+ 喜欢的原因：React更加具有函数式编程的特点，代码更加规范化、组件化
+ 优点：函数式编程，代码规范、组件化、跨浏览器表现都很好
+ 缺点：只是一个UI框架，数据的管理、路由等 都需要额外的插件支持

---

### React中发起网络请求应该在哪个生命周期
1. `constructor`
2. `componentWillMount`
3. `componentDidMount`，这个时候已经渲染完成，更新数据不会发生渲染冲突

---

### JSX语法和HTML有什么不同
1. 类名
2. 模板
3. 内嵌样式
4. 事件绑定
5. 列表

---

### React如何提高列表的渲染性能
1. 给列表设置key，避免使用index作为key
2. 懒加载
3. 仅加载可视区域数据

---

### 为什么建议setState的第一个参数是一个回调而不是一个对象呢
因为this.state和this.props的更新可能是异步的，不能依赖它们去计算下一个state。而回调函数中可以传两个参数prevState和props，能够获取到state更新之前的值和应用更新时的props值
```js
this.setState((prevState, props)=>{
  // ...
})
```

---

### 请你描述下对纯函数的理解

#### 定义
所谓的纯函数，即固定的输入有固定的输出，没有额外的依赖，并且没有任何副作用

---

#### 副作用
函数的副作用是指在正常工作任务之外对外部环境所施加的影响。比如对外部函数的读写操作、调用DOM Api、发送ajax请求、调用window.load刷新浏览器

---

#### 为什么需要纯函数
纯函数非常靠谱，不用担心它会干其他什么事情产生不可预料的结果，也不会对外部产生影响。

React中reducer对state的管控就采用了纯函数的思想，践行了React单一数据流的思想理念

---

### 如何提高React应用的性能
+ 适当地使用`PureComponent`或者`shouldComponentUpdate`生命周期方法，它避免了不必要的渲染
+ 使用React.memo缓存组件，只有当传入组件的状态值发生变化时才会重新渲染，如果传入相同的值，则缓存组件
+ 使用useMemo缓存大量的计算，只有传入的参数发生变化 函数才会重新计算新的结果，如果你的组件是功能性组件，重新渲染会导致每次都调用大型的计算函数，这是非常耗性能的
+ 延迟加载不是立即需要的组件，React.lazy()
+ 使用React.Fragment避免添加额外的DOM 

---

### 为什么不建议将key作为index

不建议index作为key，如果内容只是作为纯展示，而不涉及到数组的动态变更，是可以使用的。

+ 当数组顺序发生改变之后，key对应的实例都没有被销毁而是重新更新。比如key=0.发现只有文字更新了，而input没有更新，所以input不会变化
+ 索引作为key，当数组中删除时，虽然对应的组件删除了，但是对应的索引会被自动替代，比如3个组件，删除第2个，真正想要的是[1,3]，但是展示的可能是[1,2]

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/改变顺序前.png)
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/改变顺序后.png)

---

### React中怎么改变组件的状态？以及改变的过程是什么？

#### 从生命周期的角度

如果是已经挂载的组件，props传进来之后：
+ 先调用`componentWillReceiveProps`
+ 然后继续调用`shouldComponentUpdate`
+ 若`shouldComponentUpdate`返回true，则继续调用`componentWillUpdate`计算`nextState`
+ 然后render，最后调用`componentDidUpdate`完成整个过程


#### 从redux的角度
+ 用户触发`action`
+ `dispatch action` 到`store`中
+ 通过`reducer`改变`state`
+ `store`再将新的`state`发布给组件 

---






