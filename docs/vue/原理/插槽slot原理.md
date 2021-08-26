### 插槽的原理

#### 定义
通过插槽可以让用户拓展组件，更好地复用组件，对其做定制化的处理，相当于一个占位符

---

#### 分类
1. 默认插槽
```js
// Child.vue
<template>
  <slot>
    <p>插槽后的内容</p>
  </slot>
</template>
// 父组件
<Child>
  <div>默认插槽</div>
</Child>
```

2. 具名插槽
```js
// 子组件
<template>
  <slot name="content">
    <p>插槽后的内容</p>
  </slot>
</template>

// 父组件
<Child>
  <template v-slot:content>内容</template>
</Child>
```

3. 作用域插槽：子组件在作用域上绑定属性来将子组件的信息传递给父组件，这些属性会被挂在父组件v-slot接收的对象上，父组件在使用时通过v-slot获取子组件的信息，在内容中使用
```js
// 子组件
<template>
  <slot name="footer" testProps="子组件的值"></slot>
</template>

// 父组件
<Child>
  <template v-slot:default="slotProps">{{slotProps.testProps}}</template>
</Child>
```
---

#### 原理
