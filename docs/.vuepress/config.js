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
                    title: "react1-10",
                    path: "/react/概念/react/react1-10.html",
                  },
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
                ],
              },
              {
                title: "Redux",
                children: [
                  {
                    title: "redux1-10",
                    path: "/react/概念/redux/redux1-10.html",
                  },
                ],
              },
            ],
          },
          {
            title:"原理篇",
            collapsable: true,
            children:[
              {
                title: "ReactElement",
                path: "/react/原理/ReactElement/ReactElement.html",
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
                title: "Hooks原理",
                path: "/react/原理/Hooks/hooks.html",
              },
              {
                title: "Children原理",
                path: "/react/原理/Children/children.html",
              },
              {
                title: "React渲染原理",
                children:[
                  {
                    title:"渲染流程一",
                    path: "/react/原理/ReactDomRender/render1.html",
                  },
                  {
                    title:"渲染流程二",
                    path: "/react/原理/ReactDomRender/render2.html",
                  },
                  {
                    title:"流程图",
                    path: "/react/原理/ReactDomRender/流程图.html",
                  },
                ]
              },
              {
                title: "React更新原理",
                path: "",
              },
              {
                title: "Diff算法",
                path: "",
              },
              {
                title: "useState",
                path: "",
              },
              {
                title: "生命周期执行原理",
                path: "",
              },
              {
                title: "路由",
                path: "",
              },
              {
                title: "Redux原理",
                path: "",
              }
            ]
          }
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
