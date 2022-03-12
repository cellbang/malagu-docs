import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Malagu',
  mode: 'site',
  // hash: true,
  // more config: https://d.umijs.org/config
  favicon: 'favicon.ico',

  // locales: [['zh-CN', '中文'], ['en-US', 'English'] ],
  locales: [['zh-CN', '中文']],
  logo: 'https://cellbang-lib.oss-cn-hangzhou.aliyuncs.com/Malagu%20Logo%20Green.svg',

  menus: {
    // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
    '/guide': [
      {
        title: '基础',
        // path: '/guide',
        children: [
          // 菜单子项（可选）
          'guide/介绍.md', // 对应的 Markdown 文件，路径是相对于 resolve.includes 目录识别的
          'guide/更新日志.md',
          'guide/常见问题.md',
          'guide/快速开始.md',
          'guide/创建第一个应用.md',
          'guide/命令行工具.md',
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
          'guide/组件扩展.md'
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
    '/learn': [
      {
        title: 'Vue 项目',
        children: [
          'learn/vue.md',
          'learn/config-vue.md',
          'learn/vue-build.md'
        ]
      },
      {
        title: 'Malagu Blog 项目',
        children: [
          'learn/blog-intro.md',
          'learn/blog-create-project.md',
          'learn/blog-db-conn.md',
          'learn/blog-api.md',
          'learn/blog-category.md',
          'learn/blog-post.md',
          'learn/blog-tag.md',
          'learn/blog-auth.md'
        ]
      }
    ],
    // 如果该路径有其他语言，需在前面加上语言前缀，需与 locales 配置中的路径一致
    // '/zh-CN/guide': [
    //   // 省略，配置同上
    // ],
  },

  navs: [
    // null, // null 值代表保留约定式生成的导航，只做增量配置
    { title: '教程', path: '/guide' },
    { title: '概念', path: '/concepts' },
    { title: '示例', path: '/example' },
    { title: '开发', path: '/dev' },
    { title: '云平台', path: '/cloud' },
    {
      title: '生态',
      // path: '链接是可选的',
      // 可通过如下形式嵌套二级导航菜单，目前暂不支持更多层级嵌套：
      children: [
        { title: '学习 Malagu', path: '/learn' },
        { title: 'Package 文档', path: '/package' },
        { title: '参与贡献', path: '/malagu' },
      ],
    },
    // {
    //   title: '更多文档',
    //   path: 'https://www.yuque.com/cellbang/malagu',
    // },
    {
      title: 'API 参考',
      path: 'https://cellbang.github.io/malagu/docs/next/',
    },
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
