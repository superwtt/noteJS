### 传统的diff算法
通过循环递归对节点进行依次对比，算法复杂度达到O(n^3)，n是树的节点数，如果要展示1000个节点，得执行上亿次的比较。即便是CPU快能执行30亿条命令，也很难在一秒内计算出差异

---

### React的diff算法
React用三大策略 将O(n^3)复杂度转化为O(n)复杂度

1.tree diff，只对同层级的比较
 + 对树进行分层比较，两棵树只对同一层次节点进行比较。如果该节点不存在时，则该节点以及其子节点会被完全删除，不会再进一步比较
 + React只会对相同颜色框内的节点进行比较，根据对比结果，进行节点的新增和删除，只需遍历一次，就能完成整棵DOM树的比较

  ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/diff同级比较.png)

 + 如果出现跨层级操作，diff只考虑同层级的节点位置变换，只有创建节点和删除节点的操作
   + 如下图：通过分层比较得知，React并不会复用B节点以及其子节点，而是会直接删除A节点以下的B节点，然后再在C节点下创建新的B节点以及其子节点。
   + 因此，如果发生跨层级操作，React是不能复用已有的节点，可能会导致React进行大量重新创建操作，这会影响性能，所以React官方推荐尽量避免跨层级的操作

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/diff跨层级.png)

2.component diff，组件之间的比较
 + 如果是同类型的组件，首先使用`shouldComponentUpdate`方法判断是否需要进行比较，如果返回true，继续按照React diff策略比较组件的虚拟DOM树，否则不需要比较
 + 如果是不同类型的组件，则将该组件判断为dirtyComponent，从而替换整个组件下的所有子节点，如下图，组件C和组件H虽然结构相似，但是类型不同，React不会进行比较，而是直接删除组件C，创建组件H

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/不同类型组件.jpg)


3.element diff，对同一层级的一组子节点，通过唯一Key进行区分，涉及三种操作：移动、创建、删除
 + 不使用key，如下图：React对新老同一层级的子节点对比，发现新集合中的B不等于老集合中的A，于是删除A创建B，依次类推，直到删除D创建C。这会使得相同的节点不能复用，出现频繁的删除和创建操作，从而影响性能

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/不使用key.png)

 + 使用key，如下图：React会首先对新集合进行遍历，通过唯一key来判断老集合中是否有相同的节点，没有则创建，如果有，则判断是否需要进行移动的操作

  ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/使用key.png)

  ---

  ### 小结
  1. tree diff
  + React diff只会进行同层级比较，尽量避免跨层级操作
  2. component diff
   + 对于不同类型的组件，默认不需要进行比较操作，直接删除重新创建。
   + 对于同类型的组件，根据`shouldComponentUpdate`来进行优化，减少组件不必要的比较。如果没有自定义这个生命周期的返回值，默认都是true，每次组件发生数据变化时，都会进行比较
  3. element diff
   + element diff就是通过唯一key来进行diff优化，通过复用已有的节点，减少节点的删除和创建操作  

