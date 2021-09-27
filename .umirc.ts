import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Malagu',
  mode: 'site',
  // hash: true,
  // more config: https://d.umijs.org/config
  favicon: 'favicon.ico',
  base: '/malagu-docs/',
  publicPath: '/malagu-docs/',

  // locales: [['zh-CN', '中文'], ['en-US', 'English'] ],
  locales: [['zh-CN', '中文']],
  logo: 'https://camo.githubusercontent.com/dfde52786510e76a6c47b2a51a28e4dce9e44fcaa6e6e71bb3167fd9c444a38e/68747470733a2f2f63656c6c62616e672d6c69622e6f73732d636e2d68616e677a686f752e616c6979756e63732e636f6d2f4d616c6167752532304c6f676f253230477265656e2e7376673f457870697265733d31363332323532353436264f53534163636573734b657949643d544d502e334b6672454c6f5a44784a447a654d346951466b67426e4546436d6e6241683734635165336d756e534c5a6f774558456148566e366d783739754e375a69364476704b7a415844774e7a5a4c69536a364453335a5533514266745a71424c265369676e61747572653d7947596c4e7238377154355047366c25324233674774645439584125324259253344',

  menus: {
    // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
    '/guide': [
      {
        title: '基础',
        // path: '/guide',
        children: [
          // 菜单子项（可选）
          'guide/介绍.md', // 对应的 Markdown 文件，路径是相对于 resolve.includes 目录识别的
          'guide/快速开始.md',
          'guide/创建第一个应用.md',
          'guide/命令行工具.md',
          'guide/基本概念.md',
          'guide/控制器.md',
          'guide/中间件.md',
          'guide/请求上下文.md',
          'guide/依赖注入.md',
          'guide/组件设计.md',
          'guide/模块.md',
          'guide/错误处理.md',
          'guide/HTTP客户端.md',
          'guide/基础组件.md',
          'guide/前端架构.md',
          'guide/持续集成和持续部署（CICD）.md',
          'guide/一级组件属性.md',
          'guide/跨域设置（CORS）.md',
          'guide/应用程序.md',
          'guide/常用工具.md',
          'guide/日志.md',
          'guide/EL表达式.md',
          'guide/数据校验.md',
          'guide/缓存管理.md',
          'guide/静态资源服务.md',
          'guide/管道.md',
          'guide/Session管理.md',
          'guide/链路追踪.md',
          'guide/方法拦截（AOP）.md',
          'guide/组件扩展.md',
          'guide/云平台适配.md',
        ],
      },
      {
        title: '数据库',
        children: [
          'guide/数据库Typeorm.md',
        ],
      },
      {
        title: '认证与授权',
        children: [
          'guide/认证与授权.md',
          'guide/认证与授权-访问控制机制.md',
          'guide/认证与授权-认证机制.md',
          'guide/认证与授权-认证提供者.md',
          'guide/认证与授权-安全元信息.md',
          'guide/认证与授权-安全元信息上下文.md',
          'guide/认证与授权-安全元信息源.md',
          'guide/认证与授权-访问决策管理器.md',
          'guide/认证与授权-访问决策投票器.md',
          'guide/认证与授权-权限策略.md',
          'guide/认证与授权-EL表达式策略.md',
          'guide/认证与授权-集中式认证与授权.md',
        ],
      },
    ],
    // 如果该路径有其他语言，需在前面加上语言前缀，需与 locales 配置中的路径一致
    // '/zh-CN/guide': [
    //   // 省略，配置同上
    // ],
  },

  navs: [
    // null, // null 值代表保留约定式生成的导航，只做增量配置
    {
      title: '文档',
      children: [
        { title: '教程', path: '/guide' },
        { title: '示例', path: '/example' },
        { title: '开发', path: '/dev' },
        { title: '云平台', path: '/cloud' },
      ],
    },
    {
      title: '示例',
      path: 'https://github.com/cellbang/malagu/tree/master/examples',
    },
    {
      title: 'API参考',
      path: 'https://cellbang.github.io/malagu/docs/next/',
    },
    {
      title: '生态',
      // path: '链接是可选的',
      // 可通过如下形式嵌套二级导航菜单，目前暂不支持更多层级嵌套：
      children: [
        { title: 'Package文档', path: 'https://cellbang.github.io/malagu-docs/package/' },
        { title: '参与贡献', path: '/malagu' },
      ],
    },
    // {
    //   title: '更多文档',
    //   path: 'https://www.yuque.com/cellbang/malagu',
    // },
    {
      title: 'GitHub',
      path: 'https://github.com/cellbang/malagu',
    },
  ],

  // 多语言配置方式如下
  // navs: {
  //   // 多语言 key 值需与 locales 配置中的 key 一致
  //   'en-US': [
  //     null, // null 值代表保留约定式生成的导航，只做增量配置
  //     {
  //       title: 'GitHub',
  //       path: 'https://github.com/umijs/dumi',
  //     },
  //   ],
  //   'zh-CN': [
  //     null, // null 值代表保留约定式生成的导航，只做增量配置
  //     {
  //       title: 'GitHub',
  //       path: 'https://github.com/umijs/dumi',
  //     },
  //   ],
  // },


});
