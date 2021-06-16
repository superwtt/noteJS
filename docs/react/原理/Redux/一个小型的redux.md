### 一个小型的redux

```js
function createStore(initialState){
    let currentState = initialState;
    let listener = ()=>{}

    function getState(){
       return currentState 
    }
    function dispatch(action){
       currentState = reducer(currentState,action); // 更新数据
       listener(); // 执行订阅函数
       return action 
    }
    function subscribe(newListener){
       listener = newListener
       
       // 取消订阅
       return function unsubscribe(){
          listener = ()=>{};  
       }
    }

    return {
      getState,
      dispatch,
      subscribe
    }
}
```