### 需求
浏览器是不能直接渲染JSX的，我们写的JSX代码需要babel编译成JavaScript语法才能被浏览器识别。类似于这样：

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/babel.png)


通过<code>React.createElement</code>方法返回<code>ReactElement</code>元素。<code>ReactElement</code>是描述DOM节点的对象，它会告诉后续的操作关于这个节点的信息

---

### createElement
源码目录：<code>react/packages/react/src/ReactElement.js</code>

```javascript

// createElement方法接收三个参数：节点类型，节点属性，子节点
export function createElement(type, config, children) {
  let propName;

  // 提取保留名称 Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // RESERVED_PROPS 是保留的props
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```

#### 解析
1. JSX代码经过编译之后，会调用<code>React.createElement</code>方法。<code>React.createElement</code>方法用来返回<code>React Element</code>元素

2. <code>createElement</code>接收三个参数：<code>type</code>、<code>config</code>、<code>children</code>。
    + 其中，type类型有：

      + 字符串的<code>div</code>或者<code>span</code>等原生的DOM，称为<code>HostComponent</code>

      + 类组件，继承自<code>Component</code>或<code>PureComponent</code>，称为<code>ClassComponent</code>
  
      + 函数组件，称为<code>FunctionalComponent</code>
  
      + 内部的<code>Fragment</code>、<code>AsyncMode</code>等，属于<code>Symbol</code>类型

   + config

     + <code>ref</code>和<code>key</code>属性不会和config中的变量一起处理，而是单独作为变量出现在`ReactElement`上

     + 遍历config，将除保留属性以外的其他属性保存到<code>props</code>这个变量中

   + children

     + 如果children只有一个，那么直接赋值，如果有多个，就放到数组中。后面对<code>props.children</code>遍历的时候要注意是否是数组的情况  

3. 将传进来的三个参数，组装成<code>ReactElement</code>方法需要的参数，返回<code>ReactElement</code>方法

#### 调试流程

```javascript
// JSX
const Home = () => {
  const homeRef = useRef(null)  
  return (
    <div className="homeWrap" ref={homeRef} key="homeKey" customProp="This is customer props" >This is Home Page</div>
  );
};
```

![](https://raw.githubusercontent.com/superwtt/MyFileRepository/main/image/React/1.png)

---

### ReactElement
源码目录：<code>react/packages/react/src/ReactElement.js</code>

```javascript
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
  return element;
};
```

#### 解析
此方法进一步将<code>React.createElement</code>阶段传递过来的参数组装成自己的样子。

1. <code>$$typeof</code> 是<code>React Element</code>特有的属性，该属性主要用来防止XSS攻击
2. 其余属性都是上个阶段传递过来的

##### 关于$$typeof
   + 我们的JSX往往是 `<div>{item.msg}</div>`
   + 当服务端传递过来一串含有 `<a href="javascript:stealYourPassword"></a>`时，就可能会发生XSS攻击
   ```javascript
    // 服务端允许用户存储 JSON
    let expectedTextButGotJSON = {
    type: 'div',
    props: {
        dangerouslySetInnerHTML: {
        __html: '/* 把你想的放在这里 */'
        },
    },
    // ...
    };
    let message = { text: expectedTextButGotJSON };
    
    // React 0.13 中有风险
    <p>
    {message.text}
    </p>
   ```
   + 上面的列子中，在React0.13中很容易受到XSS攻击，虽然这个攻击是服务端存在漏洞导致的。不过，从React0.14开始这个问题修复了

   + React0.14中修复的手段就是，在虚拟DOM中添加`$$typeof`，使用`Symbol`标记每一个React元素

   + JSON类型不支持`Symbol`类型，所以，即使服务端存在用JSON作为文本返回安全漏洞，JSON里也不包含`Symbol.for('react.element')`。React会检测`element.$$typeof`，如果元素丢失或失效，会拒绝处理该元素

   + 我们在写JSX时，所有节点都是通过React.createElement生成的，那么`$$typeof`的类型永远都是`react.element`这个type


---