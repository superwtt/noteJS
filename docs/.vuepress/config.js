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
        collapsable: true,
        children: [
          {
            title: "概念篇",
            children: [
              {
                title: "react",
                children: [
                  {
                    title: "react1-10",
                    path: "/react/react/react1-10.html",
                  },
                ],
              },
              {
                title: "Hooks",
                children: [
                  {
                    title: "Hooks简介",
                    path: "/react/Hooks/Hooks简介.html",
                  },
                  {
                    title: "useState",
                    path: "/react/Hooks/useState.html",
                  },
                  {
                    title: "useEffect",
                    path: "/react/Hooks/useEffect.html",
                  },
                ],
              },
              {
                title: "Redux",
                children: [
                  {
                    title: "redux1-10",
                    path: "/react/redux/redux1-10.html",
                  },
                ],
              },
            ],
          },
          {
            title:"原理篇"
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
