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