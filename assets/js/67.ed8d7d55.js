(window.webpackJsonp=window.webpackJsonp||[]).push([[67],{198:function(t,a,s){"use strict";s.r(a);var n=s(6),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h3",{attrs:{id:"hash路由"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#hash路由"}},[t._v("#")]),t._v(" hash路由")]),t._v(" "),s("h4",{attrs:{id:"定义"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#定义"}},[t._v("#")]),t._v(" 定义")]),t._v(" "),s("p",[t._v("hash指的是地址中#号以及后面的字符，hash也称为锚点，是用来做页面跳转定位的，如"),s("code",[t._v("http://localhost/index.html#abc")]),t._v("，这里的"),s("code",[t._v("#abc")]),t._v("就是hash")]),t._v(" "),s("hr"),t._v(" "),s("h4",{attrs:{id:"注意点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#注意点"}},[t._v("#")]),t._v(" 注意点")]),t._v(" "),s("ul",[s("li",[t._v("hash值是不会随着请求发送到服务端的，所以改变hash值，不会重新加载页面")]),t._v(" "),s("li",[s("code",[t._v("window.onhashchange")]),t._v("可以监听到页面hash值的变化")]),t._v(" "),s("li",[s("code",[t._v("location.hash")]),t._v("可以用来获取和设置hash值，并且hash值的改变会直接反映到浏览器的地址栏")])]),t._v(" "),s("hr"),t._v(" "),s("h3",{attrs:{id:"history路由"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#history路由"}},[t._v("#")]),t._v(" history路由")]),t._v(" "),s("p",[t._v("利用H5 History Interface中新增的两个API "),s("code",[t._v("pushState()")]),t._v(" 和 "),s("code",[t._v("replaceState()")]),t._v("，以及事件的"),s("code",[t._v("onpopstate")]),t._v("监听URL的变化。")]),t._v(" "),s("p",[t._v("History api可以分为两大部分：切换和修改")]),t._v(" "),s("p",[t._v("（1）切换：切换历史状态包括"),s("code",[t._v("back")]),t._v("、"),s("code",[t._v("forward")]),t._v("、"),s("code",[t._v("go")]),t._v("三个方法，对应浏览器的前进、后退、跳转操作")]),t._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[t._v("history"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("go")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 后退两次")]),t._v("\nhistory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("go")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 前进两次")]),t._v("\nhistory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("back")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 后退")]),t._v("\nhistory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("forward")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 前进")]),t._v("\n")])])]),s("p",[t._v("（2）修改：修改历史状态包括"),s("code",[t._v("pushState")]),t._v("、"),s("code",[t._v("replaceState")]),t._v("两个方法，接收三个参数：")]),t._v(" "),s("ul",[s("li",[t._v("stateObj：一个对象，可以通过"),s("code",[t._v("history.state")]),t._v("取到，可以将对象内容传递到新页面中，如果不需要这个对象，可以填null")]),t._v(" "),s("li",[t._v("title：标题，几乎没有浏览器支持该参数，传一个空字符串比较安全")]),t._v(" "),s("li",[t._v("url：新的网址，必须与当前页面处于同一个域，如果设置了一个跨域网址，则会报错")])]),t._v(" "),s("hr"),t._v(" "),s("h3",{attrs:{id:"如何选择使用"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#如何选择使用"}},[t._v("#")]),t._v(" 如何选择使用？")]),t._v(" "),s("p",[t._v("一般情况下，hash和history都可以，除非你更在意颜值，#夹杂在url中确实不太美观。如果不想要很丑的hash值，我们可以选择history模式，该模式充分利用了history.pushState API来完成url重新跳转而无须重新加载页面")]),t._v(" "),s("hr"),t._v(" "),s("h3",{attrs:{id:"区别"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#区别"}},[t._v("#")]),t._v(" 区别")]),t._v(" "),s("ol",[s("li",[t._v("hash模式下，仅#之前的内容会被包含在请求中，如"),s("code",[t._v("http://www.abc.com")]),t._v("，因此对于后端来说，即使没有做到路由全覆盖，也不会返回404错误")]),t._v(" "),s("li",[t._v("history模式下，前端的url必须和实际向后端发起请求的url一致，如"),s("code",[t._v("http://www.abc.com/book/id")]),t._v("，如果后端缺少对"),s("code",[t._v("/book/id")]),t._v("的处理，将返回404错误。这种模式要玩好，需要后端配置的支持。需要后端在服务端增加一个覆盖所有情况的候选资源：如果URL匹配到任何资源，则应该返回一个默认的配置页面")])])])}),[],!1,null,null,null);a.default=e.exports}}]);