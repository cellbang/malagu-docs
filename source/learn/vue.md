---
title: '创建Vue项目'
description: '本篇从零开始创建一个基于Malagu框架的vue项目，以便大家更好的了解Malagu框架'
type: learn
lang: zh-CN
---

本篇从零开始创建一个基于Malagu框架的vue项目，以便大家更好的了解Malagu框架。Malagu自带的cli工具可快速创建模板项目，可参考以下链接：[创建项目](https://www.yuque.com/cellbang/malagu/ogreg3)、[Vue 开发](https://www.yuque.com/cellbang/malagu/vgim9q)

### 创建项目

#### 创建目录及初始化

```bash
mkdir vue-example
cd vue-example
echo '{}'>package.json
```

#### 安装相关依赖

```bash
npm i -D @malagu/cli @malagu/cli-service
npm i -S @malagu/vue @malagu/serve-static @malagu/vue
```

#### 编辑package.json

加入以下内容:

```json
{
    "name": "vue-example",
    "keywords": ["malagu-component"],
    "scripts": {
        "start": "malagu serve",
        "build": "malagu build"
    },
}
```
* keywords必须添加且其中必须有`malagu-component`，框架通过此配置来循环查找依赖链

#### 添加文件

tsconfig.json
```json
{
    "compilerOptions": {
        "target": "esnext",
        "module": "commonjs",
        "strict": true,
        "jsx": "preserve",
        "moduleResolution": "node",
        "skipLibCheck": true,
        "declaration": true,
        "declarationMap": true,
        "noImplicitAny": true,
        "noEmitOnError": false,
        "noImplicitThis": true,
        "noUnusedLocals": true,
        "strictNullChecks": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "downlevelIteration": true,
        "strictPropertyInitialization": false,
        "lib": [
            "es6",
            "dom"
        ],
        "sourceMap": true,
        "rootDir": "src",
        "outDir": "lib",
        "baseUrl": "src",
        "paths": {
            "~/*": ["*"]
        }
    },
    "include": [
        "src"
    ]
}
```

* 添加ts配置

malagu.yml

```yaml
targets:
  - frontend
```

* 添加Malagu项目配置，仅加载前端模块

src/shims-vue.d.ts

```typescript
declare module "*.vue" {
    import { DefineComponent } from "vue"
    const component: DefineComponent<{}, {}, unknown>
    export default component
}
```

* 为ts添加.vue文件支持

#### 添加vue文件
src/root.vue

```vue
<template>
  <h1>{{ msg }}</h1>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const msg = ref("hello malagu");
    return { msg };
  }
})
</script>
```

* 默认为vue3

src/app.ts

```ts
import { createApp } from "vue";
import { App } from "@malagu/vue";
import Root from "./root.vue";

@App(createApp(Root))
export default class { }
```

* 为使用@malagu/core提供的`App`注解器挂载vue实例

src/module.ts

```ts
import { autoBind } from "@malagu/core";
import "./app";

export default autoBind();
```

* Malagu框架通过module.ts加载项目，必须引入`autoBind`方法并调用。在此文件中引app.ts使Malagu框架能引导vue项目

项目文件大概如下：
```
vue-example/
▸ node_modules/
▾ src/
    app.ts
    module.ts
    root.tsx
    shims-vue.d.ts
  malagu.yml
  package-lock.json
  package.json
  tsconfig.json
```

#### 启动项目

```bash
npm start
```

* 此时访问localhost:3000，可查看项目。默认端口为3000，可通过`-p`选项指定端口

### 添加路由

#### 安装vue-router组件

```bash
npm i -S vue-router@next
```

#### 编辑文件

添加src/views/home/index.vue

```vue
<template>
    <h1>index</h1>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
});
</script>
```

添加src/views/home/about.vue

```vue
<template>
    <h1>about</h1>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
});
</script>
```

添加src/config/router.ts

```ts
import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/home/index.vue";

const routes = [
    { path: "/", component: Home },
    { path: "/about", component: import("../views/home/about.vue") }
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
```

修改src/root.vue添加链接，修改后的文件如下：

```vue
<template>
  <div>
    <ul>
      <li><router-link to="/">首页</router-link></li>
      <li><router-link to="/about">关于</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
})
</script>
```

修改app.ts引用router并且在createApp后添加.use(router)，修改后的文件如下：

```ts
import { createApp } from "vue";
import { App } from "@malagu/vue";
import Root from "./root.vue";
import { router } from "./config/router";

@App(createApp(Root).use(router))
export default class { }
```

### 添加vuex

#### 安装vuex组件

```bash
npm i -S vuex@next
```

#### 编辑文件

src/store/index.ts

```ts
import { createStore } from "vuex";

export const store = createStore({
    state() {
        return {
            title: "首页"
        }
    }
});
```

修改src/app.ts引入store并调用use方法，修改后的文件如下：

```ts
import { createApp } from "vue";
import { App } from "@malagu/vue";
import Root from "./root.vue";
import { router } from "./config/router";
import { store } from "./store";

@App(createApp(Root).use(router).use(store))
export default class { }
```

#### 使用vuex读取state

修改src/views/home/index.vue文件读取store定义的state，示例如下：

```vue
<template>
  <h1>index</h1>
  <p>title: {{ title }}</p>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const title = computed(() => store.state.title);
    return { title }
  }
});
</script>
```
