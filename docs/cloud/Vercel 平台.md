---
title: Vercel 平台
order: 6
toc: menu
---

# Vercel 平台

[Vercel](https://vercel.com/) 是国外一个用户体验很棒的 Serverless 平台。我们可以使用 `@malagu/vercel-adapter` 组件把应用部署到 Vercel 平台。基于约定大于配置原则，零配置，开箱即用。适配器组件基于 Vercel CLI 工具实现部署，所有部署的体验与该工具是一样的，甚至部署规则也是简单适配该工具的配置，只是采用了框架的配置文件方式。


#### 云资源


适配器组件有一套默认的部署规则，该规则可以被覆盖。适配器组件在执行部署任务的时候，使用平台提供的 Vercel CLI 工具，根据部署规则，创建需要的云资源。


#### 部署规则


我们可以通过同名覆盖自定义部署规则。默认规则定义在 `@malagu/vercel-adapter` 组件的 `malagu-remote.yml` 配置文件中。部署规则的配置项与 Vercel CLI 工具的配置文件 [`vercel.json`](https://vercel.com/docs/configuration) 是相同的。默认配置如下：
```yaml
malagu:
  vercel:
    config:
      version: 2
        
frontend:
  malagu:
    vercel:
      config:
        builds:
          - src: 'frontend/**'
            use: '@now/static'
        routes:
          - src: /(.*)
            dest: frontend/$1

backend:
  malagu:
    vercel:
      config:
        builds:
          - src: 'backend/**'
            use: '@now/node'
        routes:
          - src: /api
            dest: backend/index.js
```



