### Layout阶段
`Layout阶段`会执行`commitLayoutEffectOnFiber`方法

`commitLifeCycles`会根据我们的tag不同来执行不同的操作。当我们的Fiber是`FunctionComponent`相关的类型时，会执行`commitHookEffectListMount`，参数是`useLayoutEffect`对应的hook


会调用`componentDidMount`和`componentDidUpdate`