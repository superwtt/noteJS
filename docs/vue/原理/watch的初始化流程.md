### 基本使用
```js
// 普通监听
watch:{
  firstName(newName,oldName){
    this.fullName = newName; // 当firstName变化才执行
  }
}

// immediate属性
watch:{
  firstName:{
    handler(newName,oldName){
      this.fullName = newName
    },
    // 在watch里声明了firstName这个方法后立即先去执行handler方法，如果设置了false，那么效果和上边例子一样。
    // 子组件props首次获取到父组件传来的默认值时，如果需要监听，则需要设置为true
    immediate: true; 
  }
}

// deep深度监听

```