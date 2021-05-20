### 背景
`React.Children`是顶层API之一，为处理`this.props.children`这个封闭的数据提供了有用的工具，比如遍历子节点、限制子节点种类和数量、强制使用某一种子节点等等。

基于这些考虑，React提供了`React.Children`一系列方法，方便开发者操作

---

### 方法
React导出的`Children`中包含5个处理子元素的方法

+ map类似array.map

+ forEach类似array.forEach

+ count类似array.length

+ toArray

+ only

### 实例
```javascript
import React, { useState,useEffect } from "react"

const ChildDemo = (props)=>{
  console.log(props.children)
  console.log(React.Children.map(props.children,c=>[c,[c,[c],c]]))
  return props.children
}


const Child = (props)=>{
    return <ChildDemo>
      <span>1</span>
      <span>2</span>
    </ChildDemo> 
 }
 
 export default Child;
```
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/react-children.png)

#### 解析
从打印结果可以看到：

1.`props.children`返回的是组件内的子组件数，有几个就返回几个

2.`React.Children`返回的一定是个一维数组，多维数组会被铺平，`map`语法是第一个参数是要遍历的`children`，第二个参数是遍历的函数

---

### 源码
源码目录：<code>react/packages/react/src/ReactChildren.js</code>

React内部处理`Children`的几个重要函数包括：
+ mapChildren

+ mapIntoWithKeyPrefixInternal

+ traverseAllChildren

+ traverseAllChildrenImpl

+ mapSingleChildIntoContext

+ getPooledTraverseContext和releaseTraverseContext

---


① mapIntoWithKeyPrefixInternal

首先进入`mapIntoWithKeyPrefixInternal`，去`contextpool`获取`context`对象，用完之后释放，这一步利用了对象池的概念，避免频繁创建对象带来的性能损耗；之后调用`traverseAllChildren`方法

```javascript
function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  let escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  // 1.0 去对象池中获取一个对象
  const traverseContext = getPooledTraverseContext(
    array,
    escapedPrefix,
    func,
    context,
  );
  // 2.0 调用traverseAllChildren方法
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);

  // 3.0 用完之后释放该对象回对象池
  releaseTraverseContext(traverseContext);
}
```


② traverseAllChildren

`traverseAllChildren`内部就是调用`traverseAllChildrenImpl`方法，没有什么特别

```javascript
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}
```


③ traverseAllChildrenImpl

将`props.children` 传入 `traverseAllChildrenImpl`方法，该方法会去判断`props.chilren`的类型，如果是`string`、`number`、`object`类型，调用`mapSingleChildIntoContext`，将该节点传入`mapSingleChildIntoContext`方法；
如果是数组类型，递归调用自身，直到节点类型不是数组类型，调用`mapSingleChildIntoContext`

```javascript
function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext,
) {
  const type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  let invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    // 判断节点的类型
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }
    }
  }

  // callback就是指mapSingleChildIntoContext
  if (invokeCallback) {
    callback(
      traverseContext,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
    );
    return 1;
  }

  let child;
  let nextName;
  let subtreeCount = 0; // Count of children found in the current subtree.
  const nextNamePrefix =
    nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  // 如果不是字符串，数字，对象类型，递归调用自身
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext,
      );
    }
  } else {
   // ...
  }
  return subtreeCount;
}
```

④ mapSingleChildIntoContext

+ `mapSingleChildIntoContext` 会调用我们传入`React.Children.map`方法的回调函数，这里是`c=>[c]`，传入我们上一步遍历出来的单个节点，返回我们想要map出来的数据。

+ 如果`map`之后的节点还是一个数组，那么再次进入`mapIntoWithKeyPrefixInternal`，那么这个时候我们就会再次从`pool`里面去`context`了，而`pool`的意义大概也就是在这里：如果循环嵌套多了，可以减少很多对象的创建和损耗.

+ 如果不是一个数组，就推入`result`结果了

```javascript
function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  const {result, keyPrefix, func, context} = bookKeeping;

  let mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, c => c);
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(
        mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        keyPrefix +
          (mappedChild.key && (!child || child.key !== mappedChild.key)
            ? escapeUserProvidedKey(mappedChild.key) + '/'
            : '') +
          childKey,
      );
    }
    result.push(mappedChild);
  }
}
```

---

### 参考链接
[Good](https://blog.csdn.net/qq_32281471/article/details/99743122)

[流程图](https://react.jokcy.me/book/api/react-children.html)