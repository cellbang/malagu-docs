---
title: Vue 开发
order: 4
toc: menu
---

# Vue 开发

## 如何开始


Malagu 命令行工具提供了一些列的应用开发模板，我们不需要完全从零开始创建项目。基于模块快速创建项目，然后再根据情况增减相关组件。模板内提供示例代码，让我们快速学习上手。
```bash
$ malagu init -o vue-app # 基于 vue-app 模板初始化项目
```
接入 Vue 比较简单，只需要使用 App 装饰器把 Vue app 实例放进容器中即可。
具体代码如下：
```typescript
import { createApp } from 'vue';
import { App } from '@malagu/vue';
import Root from './Root.vue';   // 这里是你项目的 vue 根组件
import plugin from './plugin'

const app = createApp(Root);
app.use(plugin);                // 这里你可以像普通 vue3 项目注册插件和调用任何 app 实例上的方法

@App(app)
export default class {}         // 框架会默认把 vue 挂载到 document.body 下的一个 id 为 malagu-root 的 div 容器下
```
如果您想更改默认挂载点，只需要在 malagu.yml 中指定新的 hostDomId 值, 这样 Vue 会挂载到一个 id 为 malagu.hostDomId 值的 div 容器下。
```yaml
malagu:
	hostDomId: "root"
```


## Vue 开启 CDN


Vue 开启 CDN 其实跟 React 的类似， 可以参照 [React 开启 CDN](https://www.yuque.com/cellbang/malagu/fum7u8#Bsvqr)。
如果您想替换默认的 CDN 加载地址，配置如下：
```yaml
# 在项目的 malagu.yml 文件中配置
frontend:
  malagu:
    webpack:
      htmlWebpackTagsPlugin:
        vue3: "您的 vue3 cdn 地址"
```


## **前后端项目分离**

如果您不喜欢上述的开发方式，或者需要迁移旧项目， 或者喜欢用 vite 等不基于 webpack 的工具开发前端，malagu 也是支持的。我们可以使用 malagu 托管前端 build 后的产物，从而使用任意前端框架。推荐使用 Monorepo 风格管理前后端项目。具体可以参照 [前后端项目分离](https://malagu.cellbang.com/example/%E5%89%8D%E5%90%8E%E7%AB%AF%E9%A1%B9%E7%9B%AE%E5%88%86%E7%A6%BB)。

