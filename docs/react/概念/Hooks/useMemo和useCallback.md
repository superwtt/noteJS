### useMemo和useCallback的区别
`useMemo`用于缓存一个需要经过计算的数值
`useCallback`用于缓存函数

---

### useMemo
```js
// 首次渲染时
function mountMemo(nextCreate,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps = undefined ? null:deps;

  // 调用我们传入的第一个参数的回调函数，通过回调函数计算出需要保存的value
  const nextValue = nextCreate();

  // 保存我们的value和依赖的数组
  hook.memoizedState = [nextValue,nextDeps];
  return nextValue;
}

// 更新时
function updateMemo(nextCreate,deps){
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined?null:deps;
  const prevState = hook.memoizedState;
  if(prevState !== null){
    if(nextDeps!==null){
      const prevDeps = prevState[1];
      if(areHookInputsEqual(nextDeps,prevDeps)){
        return prevState[0];// 上次依赖数组和本次依赖的数组浅比较相等
      }
    }
  }

  // 如果浅比较不相等
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue,nextDeps];
  return nextValue;
}
```

---

### useCallback
```js
function mountCallback(callback,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps===undefined?null:deps;

  // 不需要计算新的值
  hook.memoizedState = [callback,nextDeps];
  return callback;
}

function updateCallback(callback,deps){
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null:deps;
  const prevState = hook.memoizedState;
  if(prevState !== null){
    if(nextDeps !== null){
      const prevDeps = prevState[1];
      if(areHookInputsEqual(nextDeps,prevDeps)){
        return prevState[0];
      }
    }
  }

  // 如果浅比较不相等 缓存函数
  hook.memoizedState = [callback,nextDeps];
  return callback;
}
```