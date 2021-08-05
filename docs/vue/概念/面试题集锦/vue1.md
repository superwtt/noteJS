### v-model原理
v-model是语法糖，:value+@input
```js
<input v-model="val" />
// 等价于
<input :value="val" @input="val=$event.target.value" />
```