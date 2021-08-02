### Axios的基本使用
```js
import axios from "axios"

// 1.0 请求
axios.get({...})

// 2.0 请求拦截器
axios.interceptors.request.use(function(config){
  // 这里写发送请求前处理的代码
   return config
},function (error){
   // 这里写发送请求错误相关代码 
   return Promise.reject(error) 
})

// 3.0 响应拦截器
axios.interceptors.response.use(function(){
   // 这里写得到响应数据后处理的代码
   return response 
},function (error){
   // 这里写得到错误响应处理的代码
   return Promise.reject(error) 
})

// 4.0 取消请求
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
axios.get('xxx',{
  cancelToken: source.token  
})
source.cancel('主动取消请求')
```
---

### Axios原理


















---

### 手动实现一个Axios



























https://cloud.tencent.com/developer/article/1794288
https://lq782655835.github.io/blogs/project/axios-usage-theory.html