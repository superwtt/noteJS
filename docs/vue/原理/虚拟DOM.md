### 什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路？

#### 什么是虚拟DOM？
虚拟DOM就是用一个原生的JS对象来描述DOM节点，用JS对象的属性描述DOM节点的属性，包含了它比创建一个DOM的代价要小很多。

虚拟DOM就是一个普通的JavaScript对象，包含了tag、props、children三个属性。

```js
// html
<div id="app">
  <p class="text">Hello World!</p>
</div>

// html转换为虚拟DOM
{
  tag:'div',
  props:{
    id:'app'
  },
  children:[
    {
      tag:'p',
      props:{
        className:'text'
      },
      children:[
        'Hello world!'
      ]
    }
  ]
}
```
解析：
+ 上面的对象就是我们通常所说的虚拟DOM了
+ 原生的DOM操作是很昂贵的，即使创建一个新的空div也需要很大的代价。DOM是很慢的，其元素非常庞大，页面的性能问题，大部分都是由DOM操作引起的

---

#### 如何实现一个虚拟DOM
① 先看看VNode的结构，源码位置：`src/core/vdom/vnode.js`
```js
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    /*当前节点的标签名*/
    this.tag = tag
    /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.data = data
    /*当前节点的子节点，是一个数组*/
    this.children = children
    /*当前节点的文本*/
    this.text = text
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm
    /*当前节点的名字空间*/
    this.ns = undefined
    /*编译作用域*/
    this.context = context
    /*函数化组件作用域*/
    this.functionalContext = undefined
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key
    /*组件的option选项*/
    this.componentOptions = componentOptions
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined
    /*当前节点的父节点*/
    this.parent = undefined
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false
    /*静态节点标志*/
    this.isStatic = false
    /*是否作为跟节点插入*/
    this.isRootInsert = true
    /*是否为注释节点*/
    this.isComment = false
    /*是否为克隆节点*/
    this.isCloned = false
    /*是否有v-once指令*/
    this.isOnce = false
  }
  get child (): Component | void {
    return this.componentInstance
  }
}
```
---

② 如何解析虚拟DOM：
主流的虚拟DOM库，通常都有一个h函数，也就是React中的React.createElement，以及Vue中render方法中的createElement。

React是通过babel将jsx转换为h函数渲染的形式，Vue是通过vue-loader将模板转为h函数渲染的形式

---

### 实现一个虚拟DOM
① 用JS对象模拟DOM树：只需要记录它的节点类型、属性、子节点
```js
// element.js
function Element (tagName, props, children){
  this.tagName = tagName;
  this.props = props;
  this.children = children;
}
module.exports = function(tagName, props, children){
  return new Element(tagName, props, children)
}
```
---

② 得到虚拟DOM之后，还需要一个方法将它转为真正的DOM结构
```js
// element.js
Element.prototype.render = function(){
  var el = document.createElement(this.tagName);
  var props = this.props;
  
  for(var propName in props){// 设置节点的DOM属性
    var propValue = props[proName];
    el.setAttribute(propName,propValue)
  }

  var children = this.children||[]
  children.forEach(function(child){
    var childE1 = (child instanceof Element)
    ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
    : document.createTextNode(child) // 如果是字符串，只构建文本节点
  })
  return el 
}

```
render方法会根据tagName构建一个真正的DOM节点，然后设置这个节点的属性，最后递归地把自己的子节点也构建起来

---

③ 调用
```js
// HTML结构如下
<ul id="list">
  <li class="item">Item 1</li>
  <li class="item">Item 2</li>
  <li class="item">Item 3</li> 
</ul>

// 转为VDOM
var el = require('./element.js')
var ul = el('ul',{id:'list'},[
  el('li',{class:'item'},['Item 1']),
  el('li',{class:'item'},['Item 2']),
  el('li',{class:'item'},['Item 3']),
])

// VDOM解析
var ulRoot = ul.render()
document.body.appendChild(ulRoot)
```
---

④ 比较两棵虚拟DOM树的差异：diff算法。
比较两棵DOM树的差异是Virtual DOM算法最核心的部分。Virtual DOM只会对同一个层级的元素进行对比

第一步：深度优先遍历，记录差异,在深度优先遍历的时候，每遍历到一个节点，就把该节点和新的树进行对比，如果有差异的话就记录到一个对象里面
```js
// diff函数，对比两棵树
function diff(oldTree, newTree){
  var index = 0;
  var patches = {};
  dfsWalk(oldTree,newTree,index,patches);
  return patches
}
// 对两棵树进行深度优先遍历
function dfsWalk(oldNode,newNode,index,patches){
  // 对比oldNode和newNode的不同，记录下来
  patches[index] = [...]
  diffChildren(oldNode.children,newNode.children,index,patches)
}
// 遍历子节点
function diffChildren(oldChildren,newChildren,index,patches){
  var leftNode = null;
  var currentNodeIndex = index
  oldChildren.forEach(function(child,i){
    var newChild = newChild[i];
    currentNodeIndex = (leftNode&&leftNode.count)
      ? currentNodeIndex+leftNode.count+1
      : currentNodeIndex+1
    dfsWalk(child,newChild,currentNodeIndex,patches)// 深度遍历子节点
    leftNode = child
  })
}
```
解析：
+ 如果旧的div和新的div有差异，那么patches记录下来是这样的：
`patches[0]=[{difference},{difference},...]`

---

第二步：差异类型：
+ 替换原来的节点
+ 移动、删除、新增子节点
+ 修改节点属性
+ 文本节点的内容改变

```js
var REPLACE = 0
var REORDER = 1
var PROPS = 2
var TEXT = 3

patches[0] = [{
  type: REPLACE
  node: newNode
}]
```
---

第三步：把差异应用到真正的DOM树上，深度优先遍历步骤一生成的DOM树，从步骤二中生成的patches对象中找出当前遍历的节点差异，然后进行DOM操作
```js
function patch(node,patches){
  var walker = {index:0};
  dfsWalk(node,walk,patches)
}
function dfsWalk(node,walker,patches){
  var currentPatches = patches[walker.index] // 从patches拿出当前节点的差异
  var len = node.childNodes?node.childNodes.length:0;
  for(var i=0;i<len;i++){
    var child = node.childNodes[i]
    walker.index++
    dfsWalk(child,walker,patches)
  }
  if(currentPatches){
    applyPatches(node,currentPatches); // 对当前节点进行DOM操作
  }
}

// applyPatches，根据不同类型的差异对当前节点进行DOM操作
function applyPatches(node,currentPatches){
  currentPatches.forEach((currentPatch)=>{
    switch(currentPatch.type){
      case REPLACE:
        node.parentNode.replaceChild(currentPatch.node.render(),node)
        break
      case REORDER:
        reorderChildren(node,currentPatch.moves)
        break
      case PROPS:
        setProps(node,currentPatch.props)
        break
      case TEXT:
        node.textContent = currentPatch.content      
    }
  })
}
```
---

### diff算法
diff算法的整体策略为：同级比较、深度优先

---

### 总结
1. VirtualDOM就是用JS对象模拟DOM节点，用对象的属性描述DOM的属性，由于真实DOM的操作开销是巨大的，所以用VirtualDOM的方式大大节约了开销，提高了网页的性能

2. VirtualDOM到真实DOM的过程，经历了三个阶段：element、diff、patch。
+ element阶段，是将我们写的模板生成VirtualDOM节点
+ diff阶段，是将前后两个DOM树进行对比，将差异以数组的形式记录下来
+ patch补丁阶段，是再次遍历DOM树，将差异应用到真正的DOM树上

3. diff算法只会同级比较，差异类型有：
+ 替换原来的节点
+ 移动、删除、新增子节点
+ 修改节点的属性
+ 文本节点的内容变化