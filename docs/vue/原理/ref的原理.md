### ref 的使用

```js
<template>
  <div>
    <div ref="divRef"></div>
    <slider ref="slider"></slider>
  </div>
</template>;

// 取值
this.$refs.divRef;
this.$refs.slider;
```

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/ref.png)

---

### 原理

ref 的绑定发生在 patch 的过程中。我们从 patch 的流程开始看。

VNode 创建完毕后，进入`Vue.prototype._update`方法，该方法进行新旧 DOM 的对比，然后生成 DOM 挂载到页面。`_update`的核心是调用`_patch_`方法。

我们看看 patch 的调用链

① 源码目录：`src/platforms/web/runtime/index.js`

```js
import { patch } from "./patch";
Vue.prototype.__patch__ = inBrowser ? patch : noop;
```

---

② 源码目录：`src/platforms/web/runtime/patch.js`

```js
import { createPatchFunction } from "core/vdom/patch";
export const patch: Function = createPatchFunction({ nodeOps, modules });
```

---

③ 源码目录：`src/core/vdom/patch.js`，这边是 patch 的实现核心

```js
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend

// const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
// modules = ['ref','directives','attrs','class','events','domProps','style','transition']

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  let inPre = 0
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {} else {
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        insert(parentElm, vnode.elm, refElm)
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

  // ...

  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    return vnode.elm
  }
}

```
解析：
+ 在patch的过程中，会调用`createElm`去生成DOM元素。`createElm`内部调用了`invokeCreateHooks`
+ `invokeCreateHooks`函数的作用是处理模板上的相关数据，比如处理属性、类名、style、DOM事件等等
+ `createPatchFunction`的开头部分，会把所有属性、类名、syle等的create函数push进cbs数组，随后会在`invokeCreateHooks`调用的时候被调用，其中就包含了ref这个属性
---

④ ref的create函数
```js
var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};
```
不管是`create`还是`update`还是`destory`，都会调用`registerRef`函数
---

⑤ 我们看看`registerRef`做了什么
```js
export function registerRef (vnode: VNodeWithData, isRemoval: ?boolean) {
  const key = vnode.data.ref
  if (!key) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}
```
解析：
该函数就是将ref指向的实例挂在Vue实例的refs对象上
---

### 总结
1. 在创建Vue实例的过程中，ref的绑定发生在将虚拟Node转为真实DOM的过程中
2. 会有一个专门负责处理模板上数据，包含ref、attr、class、DOM事件等的函数`invokeCreateHooks`
3. `invokeCreateHooks`函数内部，会调用模板这些数据上定义的create方法
4. 以ref的create方法为例，该create方法，就是直接将名为ref="xxx"的数据，指向真实的DOM元素，并挂载在vm实例的$refs对象上以供调用
