### Vue双向绑定原理
数据变化后能够更新视图
视图变化后能够更新数据

---

#### 基本使用

```js
<template>
  <div>
    <p>
      {{name}}
      <button @click="changeName">修改名字</button>
    </p>
    <p>
      <input type="text" v-model="name">
    </p>
  </div>
</template>

<script>
  export default{
    data(){
      return {
        name:"这是初始时候的名字"
      }
    },
    methods:{
      changeName(){
         this.name = "这是修改过后的名字"
      }
    }
   }
<script>
```
解析：
1. 当我们点击按钮时，data数据的改变能够同步到视图 -> view to model
2. 当我们通过input修改时，数据也能映射到视图 -> model to view

这就是双向绑定

---

### 具体实现
在响应式原理实现的过程中，当我们编译静态文件时，会区分出是不是指令模式
```js
//model的更新
  modelUpdater({ vm, node, exp }) {
    node.value = vm.$data[exp];
    node.addEventListener("input", (e) => {
      this.vm.$data[exp] = e.target.value;
    });
  }
```
解析：
1. 监听input事件，将改变后的值给data数据
2. 而data数据是响应式的，当接收到新的值时，会去notify所有的依赖更新