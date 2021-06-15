### React的事件机制初步理解

#### 定义
1. React事件机制的基本理解：
+ React自身实现了一套自己的事件机制，包括事件注册、事件的合成、事件冒泡、事件派发等等，虽然和原生的是两码事，但是也是基于浏览器事件机制下完成的
+ React所有的事件并没有绑定到具体的dom节点上而是绑定在了document上，然后由统一的事件处理程序来处理，同时也是基于浏览器的事件机制（冒泡），所有节点的事件都会在document上触发

```js
class BindEvent extends React.Component{
   componentDidMount(){
      document.getElementById('btn-reactandnative').addEventListener('click',e=>{
         console.log('原生+react事件：原生事件执行') 
      })
   } 
   render(){
      return (
         <div className="pageIndex">
           <p>React Event!!!</p>
           <button id="btn-confirm" onClick={this.handleClick}>
             React事件
           </button>
           <button id="btn-reactandnative" onClick={this.handleNativeAndReact}>
             原生+React事件
           </button>
         </div> 
      ) 
   }
}
```

---

#### 冒泡关系
1. 如果一个节点同时绑定了合成和原生事件，那么 禁止冒泡后执行关系是怎么样的呢？

+ 原生事件阻止冒泡肯定会阻止合成事件的触发
+ 合成事件阻止冒泡不会影响原生事件的执行

2. 原因

浏览器事件的执行需要经过三个阶段，捕获阶段 -> 目标元素阶段 -> 冒泡阶段

<font color=deeppink>节点上原生事件的执行是在目标阶段，合成事件的执行是在冒泡阶段，所以原生事件会先合成事件执行，然后再往父节点冒泡</font>

---

#### 优点
1. 减少内存消耗，提升性能，不需要注册那么多事件了，一种事件类型只在document上注册一次
2. 统一规范，解决ie事件兼容问题，简化事件逻辑
2. 对开发者友好

---

### 对于合成的理解

合成包括：
1. 对原生事件的封装
2. 对某些原生事件的升级和改造
3. 不同浏览器的兼容处理

---

#### 对原生事件的封装
```js
handleClick=(e)=>{

}
```
1. 参数e不是原生事件对象而是React包装过的对象，同时原生事件对象被放在了属性`e.nativeEvent`内

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/e.png)

2. 对原生事件的升级和改造
+ 从图中可以看到，React不只是注册了一个onchange事件，还注册了很多其他事件。这个时候，我们向文本框中输入内容的时候，是可以实时得到内容的。
+ 原生只注册一个onChange的话，需要在失去焦点的时候才能触发这个事件，所以这个原生事件的缺陷React也帮我们弥补上了

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/事件改造.png)

---

#### 浏览器事件的兼容处理
React在给document注册事件的时候也是对兼容性做了处理

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/事件兼容.png)

---

### 事件注册机制

#### 事件注册过程
React的事件注册过程其实主要做了2件事情：事件注册、事件存储
1. 事件注册-组件的挂载阶段，根据组件内声明的事件类型`onclick`、`onchange`等，给document上添加事件-addEventListener，并指定统一的事件处理程序dispatchEvent


2. 事件存储-就是把React组件内所有事件统一存放到一个对象里，缓存起来，为了在触发事件的时候可以查找到对应的方法去执行

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/事件注册机制.png)

---

#### 关键步骤
首先React拿到将要挂载的组件的虚拟dom，其实就是React Element对象，然后处理`react dom`的props，判断属性内是否有声明为事件的属性，比如`onClick`、`onChange`，这个时候得到事件类型`click`、`change`和对应的事件处理程序fn，然后执行后面的3步
a. 完成事件注册














#### 对某些原生事件的升级和改造




















#### 不同浏览器的兼容处理










#### 











































### 参考链接
https://cloud.tencent.com/developer/article/1516369