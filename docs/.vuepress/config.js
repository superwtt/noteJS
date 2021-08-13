module.exports = {
  title: " ",
  base: "/noteJS/",
  description: "Note JS -- JS学习之路",
  head: [
    [
      "link",
      {
        rel: "icon",
        href: `/favicon.ico`,
      },
    ],
  ],
  themeConfig: {
    logo: "/assets/img/logo.jpg",
    nav: [{ text: "Github", link: "https://github.com/superwtt" }],
    sidebar: [
      {
        title: "Introduction",
        collapsable: false,
        children: [["/introduction/introduction.html", "简介"]],
      },
      {
        title: "React",
        collapsable: false,
        children: [
          {
            title: "概念篇",
            collapsable: true,
            children: [
              {
                title: "react",
                children: [
                  {
                    title: "面试题集锦",
                    path: "/react/概念/react相关/面试题集锦/react1.html",
                    collapsable:true,
                    children:[
                      {
                        title: "react1",
                        path: "/react/概念/react相关/面试题集锦/react1.html",
                      },
                      {
                        title: "react2",
                        path: "/react/概念/react相关/面试题集锦/react2.html",
                      }
                    ]
                  },
                  {
                    title: "super的作用",
                    path: "/react/概念/react相关/super的作用.html",
                  },
                  {
                    title: "React的事件机制",
                    path: "/react/概念/react相关/React的事件机制.html",
                  }
                ],
              },
              {
                title: "Hooks",
                children: [
                  {
                    title: "Hooks简介",
                    path: "/react/概念/Hooks/Hooks简介.html",
                  },
                  {
                    title: "useState",
                    path: "/react/概念/Hooks/useState.html",
                  },
                  {
                    title: "useEffect",
                    path: "/react/概念/Hooks/useEffect.html",
                  },
                  {
                    title: "useMemo和useCallback",
                    path: "/react/概念/Hooks/useMemo和useCallback.html",
                  },
                ],
              },
              {
                title: "Redux",
                children: [
                  {
                    title: "redux1-10",
                    path: "/react/概念/redux/redux1-10.html",
                  },
                  {
                    title: "中间件的区别",
                    path: "/react/概念/redux/中间件的区别.html",
                  },
                ],
              },
            ],
          },
          {
            title: "原理篇",
            collapsable: true,
            children: [
              {
                title: "ReactElement",
                path: "/react/原理/ReactElement/ReactElement.html",
              },
              {
                title: "Children原理",
                path: "/react/原理/Children/children.html",
              },
              {
                title: "React渲染原理",
                children: [
                  {
                    title: "渲染流程一-没有root创建root",
                    path: "/react/原理/ReactRender/scheduler-render1.html",
                  },
                  {
                    title: "渲染流程二-有root直接创建更新",
                    path: "/react/原理/ReactRender/scheduler-render2.html",
                  },
                  {
                    title: "渲染流程三-任务调度",
                    path: "/react/原理/ReactRender/scheduler-调度.html",
                  },
                  {
                    title: "渲染流程四-协调流程",
                    path: "/react/原理/ReactRender/协调流程.html",
                  },
                  {
                    title: "流程图",
                    path: "/react/原理/ReactRender/流程图.html",
                  },
                  {
                    title: "完整流程",
                    path: "/react/原理/ReactRender/完整流程.html",
                  },
                ],
              },
              {
                title: "React更新原理",
                path: "/react/原理/ReactUpdate/update.html",
              },
              {
                title: "React架构",
                children: [
                  {
                    title: "React15与React16架构对比",
                    path: "/react/原理/React架构/React架构对比/React15与React16架构对比.html",
                  },
                  {
                    title: "调度",
                    path: "/react/原理/React架构/调度/调度.html",
                  },
                  {
                    title: "协调",
                    path: "",
                    children: [
                      {
                        title: "Fiber架构",
                        path: "/react/原理/React架构/协调/Fiber架构.html",
                      },
                      {
                        title: "协调具体流程",
                        path: "/react/原理/React架构/协调/介绍协调流程.html",
                        children: [
                          {
                            title: "协调流程-递阶段mount",
                            path: "/react/原理/React架构/协调/协调具体流程/协调流程-递阶段mount.html",
                          },
                          {
                            title: "协调流程-递阶段update",
                            path: "/react/原理/React架构/协调/协调具体流程/协调流程-递阶段update.html",
                          },
                          {
                            title: "协调流程-归阶段mount",
                            path: "/react/原理/React架构/协调/协调具体流程/协调流程-归阶段mount.html",
                          },
                          {
                            title: "协调流程-归阶段update",
                            path: "/react/原理/React架构/协调/协调具体流程/协调流程-归阶段update.html",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    title: "渲染",
                    path: "/react/原理/React架构/渲染/渲染.html",
                    children:[
                      {
                        title: "beforemutation阶段",
                        path: "/react/原理/React架构/渲染/1-beforemutation阶段.html",
                      },
                      {
                        title: "mutation阶段",
                        path: "/react/原理/React架构/渲染/2-mutation阶段.html",
                      },
                      {
                        title: "layout阶段",
                        path: "/react/原理/React架构/渲染/3-layout阶段.html",
                      },
                    ]
                  },
                ],
              },
              {
                title: "Diff算法",
                path: "/react/原理/Diff/diff.html",
              },
              {
                title: "生命周期原理",
                path: "/react/原理/生命周期/生命周期.html",
              },
              {
                title: "Hooks原理",
                path: "/react/原理/Hooks/hooks.html",
              },
              {
                title: "Ref",
                path: "/react/原理/Ref/ref.html",
              },
              {
                title: "Context",
                path: "/react/原理/Context/context.html",
              },
              {
                title: "SetState",
                path: "/react/原理/State/state.html",
              },
              {
                title: "路由",
                path: "",
              },
              {
                title: "Redux原理",
                path: "/react/原理/Redux/redux.html",
              },
              {
                title: "一个小型的redux",
                path: "/react/原理/Redux/一个小型的redux.html",
              },
              {
                title: "手写React",
                path: "/react/原理/React/React的实现.html",
              },
            ],
          },
        ],
      },
      {
        title: "Vue",
        collapsable: false,
        children: [
          {
            title: "路由",
            path: "/vue/概念/路由.html",
          },
          {
            title: "面试题集锦",
            path: "/vue/概念/面试题集锦/vue1.html",
          },
          {
            title: "原理",
            path: "/vue/原理/Vue的响应式原理.html",
            children:[
              {
                title: "new Vue发生了什么",
                path: "/vue/原理/new Vue发生了什么.html",
              },
              {
                title: "computed",
                path: "/vue/原理/computed初始化流程.html",
                children:[
                  {
                    title: "computed初始化流程",
                    path: "/vue/原理/computed初始化流程.html",
                  },
                  {
                    title: "computed缓存原理",
                    path: "/vue/原理/computed缓存原理.html",
                  },
                ]
              },
              {
                title: "watch",
                path: "/vue/原理/watch的初始化流程.html",
                children:[
                  {
                    title: "watch的初始化流程",
                    path: "/vue/原理/watch的初始化流程.html",
                  },
                  {
                    title: "watch的原理",
                    path: "/vue/原理/watch的原理.html",
                  },
                ]
              },
              {
                title: "Axios的原理",
                path: "/vue/原理/Axios的原理.html",
              },
              {
                title: "this.$nextTick原理",
                path: "/vue/原理/this.$nextTick原理.html",
              },
              {
                title: "Vue的响应式原理",
                path: "/vue/原理/Vue的响应式原理.html",
              },
              {
                title: "Vue双向绑定原理",
                path: "/vue/原理/Vue双向绑定原理.html",
              },
              {
                title: "KeepAlive",
                path: "/vue/原理/KeepAlive.html",
              },
              {
                title: "MVVM模式的理解",
                path: "/vue/原理/MVVM模式的理解.html",
              },
              {
                title: "this.$message的实现",
                path: "/vue/原理/this.$message的实现.html",
              },
              {
                title: "Vue的生命周期",
                path: "/vue/原理/Vue的生命周期.html",
              },
            ]
          },
        ],
      },
      {
        title: "General",
        collapsable: false,
        children: [
          {
            title: "前端如何更好的实现接口的缓存与更新",
            path: "/general/前端如何更好的实现接口的缓存与更新.html",
          },
        ],
      },
    ],
  },
  plugins: {
    "@vuepress/active-header-links": {
      sidebarLinkSelector: ".sidebar-link",
      headerAnchorSelector: ".header-anchor",
    },
    "@vuepress/search": {
      search: true, //默认false
      searchMaxSuggestions: 10, // 默认是5
    },
    "@vuepress/nprogress": false, //默认为true，设置为false可以关闭进度条
  },
  dest: "./docs/.vuepress/dist",
  ga: "",
  evergreen: true,
};
