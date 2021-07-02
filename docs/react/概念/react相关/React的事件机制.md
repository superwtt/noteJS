### React 的事件机制初步理解

1.我们写的事件是绑定在 dom 上吗？如果不是绑定在哪里?

- 我们在 JSX 中绑定的事件，没有注册到真实的 dom 上，是绑定在 document 上统一管理的
- 真实的 dom 上的 click 事件被单独处理，已经被 react 底层替换成空函数 noop
- 我们在 react 绑定的事件，比如 onChange，在 document 上可能有多个事件与之对应
2.为什么我们的事件不能绑定给组件

3.为什么我们的事件手动绑定 this（不是箭头函数的情况）

4.为什么不能通过 return false 来阻止事件的默认行为

5.react 是怎么通过 dom 元素，找到与之对应的 fiber 对象的？

- fiber 对象上有个 stateNode 属性指向当前的 dom 对象

6.onClick 是在冒泡阶段绑定的吗？那么 onClickCapture 就是在事件捕获阶段绑定的吗？

#### 定义

1. React 事件机制的基本理解：

- React 自身实现了一套自己的事件机制，包括事件注册、事件的合成、事件冒泡、事件派发等等，虽然和原生的是两码事，但是也是基于浏览器事件机制下完成的
- React 所有的事件并没有绑定到具体的 dom 节点上而是绑定在了 document 上，然后由统一的事件处理程序来处理，同时也是基于浏览器的事件机制（冒泡），所有节点的事件都会在 document 上触发

```js
class BindEvent extends React.Component {
  componentDidMount() {
    document
      .getElementById("btn-reactandnative")
      .addEventListener("click", (e) => {
        console.log("原生+react事件：原生事件执行");
      });
  }
  render() {
    return (
      <div className="pageIndex">
        <p>React Event!!!</p>
        <button id="btn-confirm" onClick={this.handleClick}>
          React事件
        </button>
        <button id="btn-reactandnative" onClick={this.handleNativeAndReact}>
          原生+React事件
        </button>
      </div>
    );
  }
}
```

---

#### 冒泡关系

1. 如果一个节点同时绑定了合成和原生事件，那么 禁止冒泡后执行关系是怎么样的呢？

- 原生事件阻止冒泡肯定会阻止合成事件的触发
- 合成事件阻止冒泡不会影响原生事件的执行

2. 原因

浏览器事件的执行需要经过三个阶段，捕获阶段 -> 目标元素阶段 -> 冒泡阶段

<font color=deeppink>节点上原生事件的执行是在目标阶段，合成事件的执行是在冒泡阶段，所以原生事件会先合成事件执行，然后再往父节点冒泡</font>

---

#### 优点

1. 减少内存消耗，提升性能，不需要注册那么多事件了，一种事件类型只在 document 上注册一次
2. 统一规范，解决 ie 事件兼容问题，简化事件逻辑
3. 对开发者友好

---

### 对于合成的理解

合成包括：

1. 对原生事件的封装
2. 对某些原生事件的升级和改造
3. 不同浏览器的兼容处理

---

#### 对原生事件的封装

```js
handleClick = (e) => {};
```

1. 参数 e 不是原生事件对象而是 React 包装过的对象，同时原生事件对象被放在了属性`e.nativeEvent`内

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/e.png)

2. 对原生事件的升级和改造

- 从图中可以看到，React 不只是注册了一个 onchange 事件，还注册了很多其他事件。这个时候，我们向文本框中输入内容的时候，是可以实时得到内容的。
- 原生只注册一个 onChange 的话，需要在失去焦点的时候才能触发这个事件，所以这个原生事件的缺陷 React 也帮我们弥补上了

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/事件改造.png)

---

#### 浏览器事件的兼容处理

React 在给 document 注册事件的时候也是对兼容性做了处理

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/事件兼容.png)

---

### 事件初始化-事件合成，插件机制

#### 必要概念

1. namesToPlugins
   `namesToPlugins`装事件名，事件模块插件的映射，`namesToPlugins`最终的样子如下：

```js
const namesToPlugins = {
  SimpleEventPlugin,
  EnterLeaveEventPlugin,
  ChangeEventPlugin,
  SelectEventPlugin,
  BeforeInputEventPlugin,
};
```

`SimpleEventPlugin`等是处理各个事件函数的插件，比如一次点击事件，就会找到`SimpleEventPlugin`对应的处理函数

2. plugins
   `plugins`，这个对象就是上面注册的所有插件列表，初始化为空
   `const plugins = [LegacySimpleEventPlugin, LegacyEnterLeaveEventPlugin, ...]`

3. registrationNamesModules
   `registrationNamesModules`记录了 React 合成的事件-对应的插件的关系。在 React 中，处理 props 中事件的时候，会根据不同事件的名称，找到对应的事件插件，然后统一绑定在 document 上。
   对于没有出现过的事件，就不会绑定。`registrationNameModules`大致长这样：

```js
{
  onBlur: SimpleEventPlugin,
  onClick: SimpleEventPlugin,
  onClickCapture: SimpleEventPlugin,
  onChange: ChangeEventPlugin,
  onChangeCapture: ChangeEventPlugin,
  onMouseEnter: EnterLeaveEventPlugin,
  onMouseLeave: EnterLeaveEventPlugin,
  ...
}
```

4. 事件插件
   我们需要知道，`SimpleEventPlugin`、`EnterLeaveEventPlugin` 每个插件是什么？以`SimpleEventPlugin`为例：

```js
const SimpleEventPlugin = {
  eventTypes: {
    click: {
      // 处理点击事件
    },
    blur: {
      // 处理失焦事件
    },
  },
  extractEvents: function (topLevelType, targetInst) {},
};
```

- 首先插件是一个对象，有两个属性
- 第一个 eventTypes 是一个对象，保存了原生事件名和对应的配置项的映射关系
- 第二个 extractEvents 是事件处理函数

5. registrationNameDependencies
   `registrationNameDependencies`用来记录合成事件，比如`onClick`和原生事件`click`的对应关系

```js
{
   onBlur:['blur'],
   onClick:['click'],
   onClickCapture:['click'],
   onChange:['blur','change','click','focus','input','keydown','keyup','selectionchange'],
   onMouseEnter:['mouseout','mouseover'],
}
```

#### 事件初始化

① 注册事件 `react-dom/src/client/ReactDOMClientInjection.js`

+ `injectEventPluginsByName`做的事情很简单，形成上述的`namesToPlugins`，然后执行`recomputePluginOrdering`

```js
/* 第一步：注册事件：  */
injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin,
});
/* 注册事件插件 */
export function injectEventPluginsByName(injectedNamesToPlugins) {
  for (const pluginName in injectedNamesToPlugins) {
    namesToPlugins[pluginName] = injectedNamesToPlugins[pluginName];
  }
  recomputePluginOrdering();
}
```

② `recomputePluginOrdering`用来形成上述plugins数组

```js
const eventPluginOrder = [ 'SimpleEventPlugin' , 'EnterLeaveEventPlugin','ChangeEventPlugin','SelectEventPlugin' , 'BeforeInputEventPlugin' ]

function recomputePluginOrdering(){
    for (const pluginName in namesToPlugins) {
        /* 找到对应的事件处理插件，比如 SimpleEventPlugin  */
        const pluginModule = namesToPlugins[pluginName];
        const pluginIndex = eventPluginOrder.indexOf(pluginName);
        /* 填充 plugins 数组  */
        plugins[pluginIndex] = pluginModule;
        const publishedEvents = pluginModule.eventTypes;
    for (const eventName in publishedEvents) {
       // publishedEvents[eventName] -> eventConfig , pluginModule -> 事件插件 ， eventName -> 事件名称
        publishEventForPlugin(publishedEvents[eventName],pluginModule,eventName,)
    } 
    }
}
```

③ `publishEventForPlugin`，形成上述的`registrationNameModules`和`registrationNameDependencies`对象的映射关系

```js
/*
  dispatchConfig -> 原生事件对应配置项 { phasedRegistrationNames :{  冒泡 捕获  } ，   }
  pluginModule -> 事件插件 比如SimpleEventPlugin  
  eventName -> 原生事件名称。
*/
function publishEventForPlugin (dispatchConfig,pluginModule,eventName){
    eventNameDispatchConfigs[eventName] = dispatchConfig;
    /* 事件 */
    const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
    for (const phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
            // phasedRegistrationName React事件名 比如 onClick / onClickCapture
            const phasedRegistrationName = phasedRegistrationNames[phaseName];
            // 填充形成 registrationNameModules React 合成事件 -> React 处理事件插件映射关系
            registrationNameModules[phasedRegistrationName] = pluginModule;
            // 填充形成 registrationNameDependencies React 合成事件 -> 原生事件 映射关系
            registrationNameDependencies[phasedRegistrationName] = pluginModule.eventTypes[eventName].dependencies;
        }
    }
    return true;
    }
}
```

#### 事件合成总结
到这里，整个初始化阶段已经完事了，这个阶段主要形成了上述的几个重要的对象，构建初始化React合成事件和原生事件的对应关系，合成事件和对应的事件处理插件关系。接下来就是事件绑定阶段

---

### 事件绑定-从一次点击事件开始

#### diffProperties处理React合成事件
```js
<div>
  <button onClick={this.handerClick} className="button">点击</button>
</div>
```
此时button的fiber节点上，memoizedProps和pendingProps两个属性保存这个绑定事件
```js
// button对应fiber
memoizedProps = {
   onClick:function handerClick(){},
   className:'button'
}
```
---

#### diffProperties阶段判断当前propKey是不是React合成事件
```js
function diffProperties(){
  /* 判断当前的 propKey 是不是 React合成事件 */
  if(registrationNameModules.hasOwnProperty(propKey)){
    /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
    legacyListenToEvent(registrationName, document）;
  }
}
```

+ 如果发现是合成事件，就会调用`legacyListenToEvent`，注册事件监听器

```js
// legacyListenToEvent 注册事件监听器
//  registrationName -> onClick 事件
//  mountAt -> document or container
function legacyListenToEvent(registrationName，mountAt){
   const dependencies = registrationNameDependencies[registrationName]; // 根据 onClick 获取  onClick 依赖的事件数组 [ 'click' ]。
   for (let i = 0; i < dependencies.length; i++) {
   const dependency = dependencies[i];
   //这个经过多个函数简化，如果是 click 基础事件，会走 legacyTrapBubbledEvent ,而且都是按照冒泡处理
   legacyTrapBubbledEvent(dependency, mountAt);
  }
}
```
+ legacyTrapBubbledEvent 就是执行将绑定真正的dom事件的函数legacyTrapBubbledEvent（冒泡处理）

```js
function legacyTrapBubbledEvent(topLevelType,element){
   addTrappedEventListener(element,topLevelType,PLUGIN_EVENT_SYSTEM,false)
}
```

---

#### 在legacyListenToEvent函数中，找到React合成事件对应的原生事件集合

比如onClick->['click']，onChange->['blur','change','input','keydown','keyup']，然后遍历依赖项的数组，绑定事件。

---

#### 绑定dispatchEvent，进行事件监听
```js
function addTrappedEventListener(targetContainer,topLevelType,eventSystemFlags,capture){
   const listener = dispatchEvent.bind(null,topLevelType,eventSystemFlags,targetContainer) 
   if(capture){
       // 事件捕获阶段处理函数。
   }else{
       /* TODO: 重要, 这里进行真正的事件绑定。*/
      targetContainer.addEventListener(topLevelType,listener,false) // document.addEventListener('click',listener,false)
   }
}
```

---

#### 事件绑定过程总结
1. 在React中，diff DOM元素的propKey类型，如果发现是合成事件，就会按照事件系统逻辑单独处理
2. 根据React合成事件的类型，找到对应的原生事件类型，然后调用判断原生事件类型，大部分事件按照冒泡逻辑处理，少数事件会按照捕获逻辑处理，比如scroll事件
3. 调用addTrappedEventListener进行真正的事件绑定，绑定在document上，dispatchEvent为统一的事件处理函数

---

### 事件触发-一次点击事件，在React底层系统会发生什么？
```js
<div>
  <button onClick={ this.handerClick }  className="button" >点击</button>
</div>
```

#### 事件触发处理函数dispatchEvent
当我们点击按钮之后，首先执行的是dispatchEvent函数

+ 首先根据真实的事件源对象，找到e.target真实的dom元素
+ 然后根据dom元素，找到与它对应的fiber对象targetInst
+ 然后正式进入legacy模式的事件处理系统

```js
function dispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
  /* 尝试调度事件 */
  const blockedOn = attemptToDispatchEvent( topLevelType,eventSystemFlags, targetContainer, nativeEvent);
}

function attemptToDispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
  /* 获取原生事件 e.target */
  const nativeEventTarget = getEventTarget(nativeEvent)
  /* 获取当前事件，最近的dom类型fiber ，我们 demo中 button 按钮对应的 fiber */
  let targetInst = getClosestInstanceFromNode(nativeEventTarget); 
  /* 重要：进入legacy模式的事件处理系统 */
  dispatchEventForLegacyPluginEventSystem(topLevelType,eventSystemFlags,nativeEvent,targetInst,);
  return null;
}
```

---

#### legacy 事件处理系统与批量更新
---

#### 事件触发总结
1.首先通过统一的事件处理函数dispatchEvent进行批量更新batchUpdates
2.然后执行事件对应的处理插件extrectEvents
3.执行事件队列，如果发现有阻止冒泡，那么跳出break循环，最后重置事件源，放回事件池中

---

### 图片
![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/React事件系统.png)

---

### 参考链接

[阿里](https://cloud.tencent.com/developer/article/1516369)
[掘金](https://juejin.cn/post/6955636911214067720#heading-5)
