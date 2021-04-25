#### 声明式编程和命令式编程

**区别**：
1. 声明式编程：声明式编程是一种编程范式，它关注的是你要做什么，而不是如何做。它表达逻辑而不是定义步骤。
2. 命令式编程：描述了如何去做


**代码示例**

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

#### 什么是React

1. React是一个简单的javascript UI库，用于构建高效、快速的用户界面。
2. 使用虚拟DOM来有效的操作DOM
3. 遵循从高阶组件到低阶组件的单向数据流

---

#### 构建React项目的几种方式

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

#### React和Vue有什么优缺点

---

#### 什么是Virtual DOM及其工作原理
