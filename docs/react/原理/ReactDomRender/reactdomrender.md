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

### 参考链接
[Good](https://segmentfault.com/a/1190000020064411)