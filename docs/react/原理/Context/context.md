### 背景

在React中，父子组件之间的通信是通过props实现的。props的方式简化了开发也容易理解。

但在React应用中，不只是父子组件的关系，有些需要通信的组件之间跨了好几个层级，如果使用props的方式，中间组件就必须一层层的传递props值，这将使得组件之间的关系变得非常耦合难以维护。

React给出了一种解决方案context上下文：上级组件提供了context对象之后，下级子组件都能获取到数据

---

### 使用方式
1. childContextType：即将在React17中废弃
2. createContext

```javascript
//方式2: 1.context的提供方和订阅方
const { Provider, Consumer } = React.createContext("default");
//---- 等同于
const ThemeContext = React.createContext("light");

class Parent extends React.Component {
   // 方式1：1.父组件声明getChildContext，return的对象就是子组件能够获取到的值
   getChildContext(){
       return {
           value: this.state.value
       }
   }  
   render(){
       return (
           <>
              <Child1 />
              <Child2 />
           </>
       )
   }
}
class Child1 extends React.Component {
    render(){
        return <p>childContext:{this.context.value}</p>
    }
}
function Child2(){
    return <Consumer>
      {
          value=>(
            <p>
              newContext:{value} <br/>
            </p>
          )
      }
    </Consumer>
}

// 方式1：2. 声明组件的childContextTypes，声明的内容和protypes一样
Parent.childContextTypes = {
  value: PropTypes.string,  
}

// 方式1：3. 声明子组件的contextTypes，这个声明告诉React在渲染过程中，该组件希望去获取它的父组件所提供的context里面某几个属性，某几个属性即child1.contextTypes声明的属性，不声明则获取不到
Child1.contextTypes = {
   value:ProTypes.string 
}
```

---

### 实现原理

我们可以通过发布者-订阅者模式，手动实现一个createContext方法

1. 什么是发布者-订阅者模式（pub-sub）
  + 定义：发布者订阅者模式用来定义对象的一种一对多的依赖关系。当对象的状态发生变化时，所有依赖于它的值都将得到通知
  + 图例：

  ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/2973087-aa888000b5d66a7b.png)

  + 举例
    
    + DOM事件：DOM事件是一个典型的发布-订阅模式，对一个dom节点的事件进行监听，当操作dom节点时，触发相应的事件响应函数的执行
      ```javascript
      const loginBtn = document.getElementById("#loginBtn")

      // 订阅-添加监听事件
      loginBtn.addEventListener('click',fn)

      // 发布-触发点击事件 事件中心派发指定事件
      loginBtn.click()

      // 取消订阅
      loginBtn.removeEventListener('click',fn)
      ```

    + 自定义事件
      ```javascript
      let pubSub = {
          list:[],
          subscribe:(key,fn){
              if(!list[key]){
                  this.list[key] = fn
              }
              this.list[key].push(fn)
          },
          publish:(key,...arg){
              for(let fn in this.list[key]){
                  fn.call(this,...arg)
              }
          },
          unsubscribe:(key,fn){
              let fnList = this.list[key];
              if (!fnList) return false;

              if (!fn) {
                    fnList && (fnList.length = 0);
              } else {
                    fnList.forEach((item, index) => {
                  if (item === fn) {
                        fnList.splice(index, 1);
                  }
              });
          }

        // 订阅
        pubSub.subscribe('onwork',time=>{
            console.log(`上班了，${time}`)
        })
        pubSub.subscribe('offwork',time=>{
            console.log(`上班了，${time}`)
        })
        pubSub.subscribe('launch',time=>{
            console.log(`吃饭了，${time}`)
        })
        
        // 发布
        pubSub.publish('offwork','18:00:00')
        pubSub.publish('launch','18:00:00')
        
        // 取消订阅
        pubSub.publish('onwork','18:00:00')

      }
      ```


2. 如何通过pub-sub模式实现一个createContext，完整代码点击[这里](https://codesandbox.io/s/custom-createcontext-demo-forked-gstfm?file=/src/index.js:2646-2929)
```javascript
function createContext(){

    class Provider extends PureComponent{
       componentDidMount(){
           emitter.emit(this.props.value)
       }
       componentDidUpdate(){
           emitter.emit(this.props.value)
       }
       render(){
           return this.props.children
       }
    }
    class Consumer extends PureComponent{
       constructor(props){
           super(props)
           this.state = {
               value:defaultValue
           }
           emitter.on(value=>{
               this.setState({value})
           })
       }
       render() {
         return this.props.children(this.state.value);
       }
    }

    return { Provider,Consumer }
}
```
#### 解析
1. Consumer是订阅者，将事件添加到监听队列里，一旦value有变化，便setState，re-render自然会执行
2. Provider是发布者，一旦接收到数据变化，遍历事件队列，依次执行

