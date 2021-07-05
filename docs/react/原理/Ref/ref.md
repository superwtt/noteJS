### 需求

当我们写了一个组件，会在render function里面渲染DOM节点或者子组件。有时候我们需要获取这个DOM节点或者这个子组件的实例去对它进行手动的操作而不仅仅是props的更新。

一方面我们可以通过querySelector这些元素选择器，自己去写获取这个节点的方法。而React中，给我们提供了Ref这样的API让我们拥有获取子节点的能力

---

### 使用方式
有三种使用ref的方式

+ string ref
+ function ref
+ createRef

```javascript
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.p3 = React.createRef(null);
  }

  componentDidMount() {
    setTimeout(()=>{
      this.refs.p1.textContent="string ref got"
      this.p2.textContent="function ref got"
      this.p3.current.textContent="createRef ref got"
    },1000)
  }

  render() {
    return (
      <>
        <p ref="p1">p1</p>
        <p ref={(r) => (this.p2 = r)}>p2</p>
        <p ref={this.p3}>p3</p>
      </>
    );
  }
}

export default Home;
```

---

### createRef
源码目录：<code>react/packages/react/src/ReactCreateRef.js</code>

```javascript
export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  if (__DEV__) {
    Object.seal(refObject);
  }
  return refObject;
}

```

#### 解析

1. `createRef`方法就是返回了一个对象`{current:xxx}`

---

### useRef的实现
```js
// mount时
function mountRef(initialValue){
  // 获取当前useRef hook
  const hook = mountWorkInProgressHook();
  // 创建ref
  const ref = {current: initialValue};
  hook.memorizedState = ref;
  return ref
}

// update时
function update(initialValue){
  // 获取当前useRef hook
  const hook = updateWorkInProgressHook();
  // 返回保存的数据
  return hook.memorizedState
}

```

可见，`useRef`仅仅是返回一个包含current属性的对象

---

### ref的工作流程
1.对于FunctionComponent，useRef负责创建并返回对应的ref
2.对于赋值了ref属性的HostComponent与ClassComponent，会在render阶段经历赋值Ref effectTag，在commit阶段执行对应ref操作

---

### createRef和useRef的区别
createRef每次渲染都会返回一个新的引用，而useRef每次都会返回相同的引用
```js
const RefComp = ()=>{
  const [renderIndex,setRenderIndex] = React.useState(1)
  const refFromUseRef = React.useRef();
  const refFromCreateRef = React.createRef();

  // 每次渲染都是相同的引用
  console.log(refFromUseRef);
  
  // 每次渲染都会创建新的引用
  console.log(refFromCreateRef);

  if(!refFromUseRef.current){
      refFromUseRef.current = renderIndex
  }

  if(!refFromCreateRef.current){
      refFromCreateRef.current = renderIndex
  }

  return (
      <>
       <p>Current render index: {renderIndex}</p>
       <p>
           <b>refFromUseRef</b> value: {refFromUseRef.current}
       </p>
       <p>
           <b>refFromCreateRef</b> value:{refFromCreateRef.current}
       </p>
       <button onClick={()=>setRenderIndex(prev=>prev+1)}>
          Cause re-render
       </button>
      </>
  )
}

export default RefComp
```