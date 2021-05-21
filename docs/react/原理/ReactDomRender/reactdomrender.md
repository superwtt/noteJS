### ReactDOM.render
1. 作用：用于将模板转换成HTML语言，渲染DOM，并插入到指定的DOM节点中
2. 用法示例：`ReactDOM.render(<App />, document.getElementById('root'));`
3. 编译后会调用`createElement`方法
```javascript
ReactDOM.render(
  React.createElement(App),  
  document.getElementById('root')
);
```

---

### 疑问
1. `ReactDOM.render`方法如何转换成真实的dom
2. `React.createElement`方法如何实例化react组件

---

### 步骤
`ReactDOM.render`步骤大致可以分为三步：
1. 创建`ReactRoot`，这是包含了整个React应用的顶点的对象
2. 创建`FiberRoot`和`RootFiber`
3. 创建更新

---

### 源码
源码目录：`src/react/packages/react-dom/src/client/ReactDOM.js`

① 首先执行`ReactDOM.render`，顺着render进去，调用`legacyRenderSubtreeIntoContainer`

```javascript
const ReactDOM: Object = {
  // ...
  render(
    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  ) {
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    );
}
```

② legacyRenderSubtreeIntoContainer 顾名思义，legacy模式下render子树到container容器里，用来初始化container。

container是dom实例，第一次渲染肯定没有`_reactRootContainer`，所以`root=container._reactRootContainer`被赋值给了`legacyCreateRootFromDOMContainer(container, )`

```javascript
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback: ?Function,
) {
  
  let root: Root = (container._reactRootContainer: any);
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    // Initial mount should not be batched.
    unbatchedUpdates(() => {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    });
  } else {
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      );
    } else {
      root.render(children, callback);
    }
  }
  return getPublicRootInstance(root._internalRoot);
}
```

③ `legacyCreateRootFromDOMContainer`里面return了`createLegacyRoot`，然后`createLegacyRoot`又return了`new ReactDOMBlockingRoot`


---
### 参考链接
[Good](https://segmentfault.com/a/1190000020064411)

[Good](https://www.zhihu.com/question/361787198)