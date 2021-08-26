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
axios的github地址上明确写了axios的特点是：
+ 浏览器发起`XMLHttpRequests`请求
+ 从nodejs发起http请求
+ 支持`PromiseAPI`
+ 拦截请求和响应
+ 转换请求和响应数据
+ 取消请求
+ 自动转换json数据
+ 客户端支持自动防止XSRF

---

### 为什么要封装Axios
axios的API很友好，我们完全可以在项目中直接使用。

但是随着项目规模增大，如果每发起一次HTTP请求，就要把这些比如设置超时时间、设置请求头、根据项目环境判断使用哪个请求地址、错误处理等操作重新写一遍的话，会让代码冗余不堪，而且难以维护。

这个时候我们就需要对axios进行二次封装，让使用更加便利

---

### 如何封装
开始封装的前提是跟后端沟通好一些约定：比如请求头、状态码、请求超时时间等。

1. 设置请求前缀：根据开发、测试、生产环境的不同，区分前缀
```js
if(process.env.NODE_ENV === 'dev'){
  baseUrl = 'http://dev.xxx.com' 
} else if(process.env.NODE_ENV === 'prod'){
  baseUrl = 'http://prod.xxx.com'  
}
```
在本地调试的时候，还需要在`vue.config.js`文件中配置devServer实现代理转发，从而实现跨域
```js
devServer:{
  proxy:{
    '/proxyApi':{
       target:'http://dev.xxx.com',
       changeOrigin: true,
       pathRewrite:{
        '/proxyApi': ''  
       }
    } 
  } 
}
```

2. 封装请求头：设置请求头与超时时间
```js
const service = axios.create({
  //...
  timeout: 30000 , //请求30s超时
  headers:{
     get:{
       'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
     },
     post:{
       'Content-Type': 'application/json;charset=utf-8'
     }
  } 
})
```

3. 状态码：根据接口返回的不同statusCode，响应不同的操作


4. 封装请求方法：根据get/post等方法需要进行再一次封装，使用起来更加方便
```js
// get
export function httpGet({url,params={}}){
   return new Promise((resolve,reject)=>{
     axios.get(url,{
        params
     }).then(res=>{
        resolve(res.data)
     }).catch(err=>{
        reject(err)
     })
   })
}
// post
export function httpPost({
   url,data={},params={}
}){
   return new Promise((resolve,reject)=>{
      //...
   })
}
```

5. 请求拦截：请求发送之前做的操作
```js
axios.interceptors.request.use(
   config=>{
     // 每次发送请求之前判断是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况，此处token一般是用户完成登录后储存到localstorage里的
    token && (config.headers.Authorization = token)
    return config
   },
   error =>{
      return Promise.error(error)
   }
)
```

6. 响应拦截：请求响应之后做的操作，根据业务定制
```js
axios.interceptors.response.use(response=>{
   if(response.status === 200){
     if(response.data.code === 511){
        // 未授权调取授权接口
     } else if(response.data.code === 510){
        // 未登录跳转登录页
     } else{
        return Promise.resolve(response)
     }
   } else{
      return Promise.reject(response)
   }
},error=>{
   // 异常处理
})
```
---

### 手动实现一个Axios
① 构建一个Axios构造函数，核心代码为request，实现axios({})这种方式的请求

```js
// 1.0 构建Axios构造函数
class Axios{
  constructor(){}
  request(config){
    return new Promise(resolve=>{
       const {url='',method='get',data={}}
       // 发送ajax请求
       const xhr = new XMLHttpRequest();
       xhr.open(method,url,true);
       xhr.onload = function(){
         resolve(xhr.responseText); 
       }
       xhr.send(data);
    }) 
  }
}

// 2.0 导出Axios实例
function createAxios(){
  let axios = new Axios();
  let req = axios.request.bind(axios);
  return req; 
}

// 3.0 得到Axios实例
let axios = createAxios();
// 这时候就可以通过axios({})这种形式请求了
```

---

②-1 实现axios.methods()这种形式的请求
```js
const methodsArr = ['get','delete','head','options','put','patch',];
methodsArr.forEach(met=>{
   Axios.prototype[met] = function(){
    console.log('执行'+met+'方法');  
    return this.request({
      method: met,
      url: arguments[0],
      ...arguments[1] || {}
    })
   }
})
```

---

②-2 将Axios原型上的方法与createAxios导出的axios.request实例混入。
```js
const utils = {
   extend(a,b,context){
      for(let key in b){
         if(b.hasOwnProperty(key)){
            if(typeof b[key]==='function'){
               a[key] = b[key].bind(context)
            } else{
               a[key] = b[key]
            }
         }
      }
   }
}
// 混入
function createAxios(){
   let axios = new Axios;
   let req = axios.request.bind(axios);

   utils.extend(req,Axios.prototype,axios);

   return req
}
// 这样就可以通过axios.methods({})的方式调用axios了
```

---

③-1 构建拦截器
```js
class InterceptorsManage {
  constructor() {
    this.handlers = [];
  }

  use(fullfield, rejected) {
    this.handlers.push({
      fullfield,
      rejected
    })
  } 
}
```
---
③-2 实现`axios.interceptors.response.use`和`axios.interceptors.request.use`
```js
class Axios {
  constructor(){
    this.interceptors= {
      request: new InterceptorsManage,
      response: new InterceptorsManage 
    } 
  } 
}
```






















https://www.cnblogs.com/mfyngu/p/13912132.html
https://juejin.cn/post/6844904199302430733
https://cloud.tencent.com/developer/article/1794288
https://lq782655835.github.io/blogs/project/