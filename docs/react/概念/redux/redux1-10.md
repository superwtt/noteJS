#### Redux是如何实现异步的？
方法1. 简单使用axios模块实现

1. 在actionTypes中添加异步数据需要的action类型
2. 在actionCreator中添加生成action的函数
3. 在组件componentDidMount(useEffect)中发送ajax请求，发送action

方法2. 使用中间件

1. redux-thunk
+ 配置中间件，在store的创建中配置
```javascript
import {createStore, applyMiddleware, compose} from 'redux';
import reducer from './reducer';
import thunk from 'redux-thunk'

// 设置调试工具
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
// 设置中间件
const enhancer = composeEnhancers(
  applyMiddleware(thunk)
);

const store = createStore(reducer, enhancer);

export default store;
```
+ 将异步请求的逻辑放在actionCreator里
+ 在组件componentDidMount(useEffect)中生成action并发送

缺点：action一旦发出了就无法取消，如果A/B两个请求同时发送，A的请求后返回，那么界面最终会渲染成A的样子

2. redux-saga，旨在更好、更易的解决异步操作，相当于在redux原有的数据流中多了一层，对action进行监听，捕获到监听的action后可以派生一个新的任务对state进行维护

+ 配置中间件
+ 将异步请求放在sagas.js文件中
+ 发送action
