### Axios是什么
Axios是一个基于promise的HTTP库，可以用在浏览器和node.js中

---

### Axios的基本使用
```js
import axios from "axios"

// 1.0 请求
axios(config) // 直接传入配置 与 axios.request()等价
axios(url[,config]) // 传入url和配置
axios[method](url[, option]) // 直接调用请求方法，传入url和配置
axios[method](url[, data[, option]]) // 直接调用请求方式方法，传入data、url和配置
axios.request(option) // 调用 request 方法
axios.all([axiosInstance1, axiosInstance2]).then()

// 2.0 自定义实例
axios.create(config) // 自定义配置，创建实例instance

// 3.0 请求拦截器
axios.interceptors.request.use(function(config){
  // 这里写发送请求前处理的代码
   return config
},function (error){
   // 这里写发送请求错误相关代码 
   return Promise.reject(error) 
})

// 4.0 响应拦截器
axios.interceptors.response.use(function(){
   // 这里写得到响应数据后处理的代码
   return response 
},function (error){
   // 这里写得到错误响应处理的代码
   return Promise.reject(error) 
})

// 5.0 取消请求
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
axios.get('xxx',{
  cancelToken: source.token  
})
source.cancel('主动取消请求')
```
---

### Axios特点

---

### Axios原理


















---

### 手动实现一个Axios


























https://juejin.cn/post/6844904199302430733
https://cloud.tencent.com/developer/article/1794288
https://lq782655835.github.io/blogs/project/axios-usage-theory.html