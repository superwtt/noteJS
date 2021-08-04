### MVVM模式

 ![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/Vue/viewmodel.png)

 ---

 ### MVVM的定义

1. Model层：数据层，仅仅关注数据本身，不关心其他任何行为

2. View层：用户界面层

3. ViewModel层：业务逻辑层，View需要什么数据，ViewModel就要提供这些数据，可以理解为Model for view

MVVM是Model-View-ViewModel的缩写，是一种前端开发的架构模式，核心是提供View层和ViewModel层的双向数据绑定，这使得ViewModel的状态改变可以自动传递给View，即所谓的数据双向绑定

Vue.js 是一个提供了 MVVM 风格的双向数据绑定的 Javascript 库，专注于View 层。它的核心是 MVVM 中的 VM，也就是 ViewModel。 ViewModel负责连接 View 和 Model，保证视图和数据的一致性，这种轻量级的架构让前端开发更加高效、便捷

 ---

 ### 优点
 MVVM模式简化了界面与业务的依赖，解决了数据频繁地更新。开发者只需要专注对数据的维护即可，而不需要自己操作dom

 ---

 ### 总结
 1. MVVM是一种前端开发模式，核心是View层和ViewModel层的数据双向绑定，View层也就是视图层操作数据，ViewModel层负责改变数据并且可以自动反应在View层上
 2. 这样的优点是，我们只需要专注维护数据，而不需要自己操作dom。

 ---

