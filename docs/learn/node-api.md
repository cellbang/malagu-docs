---
title: '用nodejs编写接口'
description: 'Cell框加的优点在于前后端一体化开发，这里展示如何在vue项目中集成nodejs接口'
type: learn
lang: zh-CN
---

### 准备工作

安装依赖

```bash
npm i -S @celljs/mvc
```

整理文件及目录

将src/目录下，除hooks以外的文件都移动到src/frontend目录。

修改src/hooks/webpack.ts中的`~/`路径为`~/frontend/`

修改src/frontend/config/router.ts中的`~/`路径为`~/frontend/`

### 添加node-api接口

添加src/backend/controllers/home-controller.ts

```ts
import { Controller, Get, Text } from "@celljs/mvc/lib/node";

@Controller("node-api")
export class HomeController {
    @Get("hello")
    @Text()
    home(): string {
        return "Welcome to Cell";
    }
}
```

添加src/backend/module.ts引入home-controller.ts

```ts
import { autoBind } from "@celljs/core";
import "./controllers/home-controller";

export default autoBind();
```

* 实际项目中controller会很多，会在controllers/index.ts中export出所有的controller，在module.ts中import './controllers'即可。

修改cell.yml，去除target配置，添加module相关配置修改后内容如下：

```yaml
frontend:
  modules:
    - src/frontend/module
backend:
  modules:
    - src/backend/module
cell:
  serve-static: 
    apiPath: /node-api/*
```

* cell.serve-static.apiPath配置node-api的路径转发到node服务

### 创建前端请求类

创建src/common/index.ts

```ts
export const HttpService = Symbol("HttpService");

export interface HttpService {
    get<T>(url: string, data?: any, options?: any): Promise<T>;
    post<T>(url: string, data?: any, options?: any): Promise<T>;
}
```

创建src/frontend/services/common/http-request.ts

```ts
import { Service } from "@celljs/core";
import { RestOperations, DefaultRestOperationsFactory } from "@celljs/web";
import { HttpService } from '~/common';

@Service(HttpService)
export class HttpServiceImpl extends DefaultRestOperationsFactory implements HttpService {
    _http: RestOperations;

    // 初始化
    get http() {
        if (!this._http) {
          this._http = this.create();
          this._http.interceptors.response.use(
              (res) => res.data,
              (err) => Promise.reject(err)
              );
        }
        return this._http;
    }

    get<T>(url: string, data: any = {}, options: any = {}): Promise<T> {
        return this.http.request<any, T>({
            url, data,
            method: 'GET',
            ...options
        });
    }

    post<T>(url: string, data: any = {}, options: any = {}) {
        return this.http.request<any, T>({
            url, data,
            method: 'POST',
            ...options
        });
    }
}
```

修改 src/frontend/app.ts，加入一行`import './services/common/http-service';`修改后内容如下：

```ts
import { createApp } from "vue";
import { App } from "@celljs/vue";
import Root from "./root.vue";
import { router } from "./config/router";
import { store } from "./store";
import './services/common/http-service';

@App(createApp(Root).use(router).use(store))
export default class { }
```

* Cell默认的目录名为node、browser，这里因为修改了默认目录，所以需要为前后端配置加载的模块。

完成修改后项目文件如下：

```
vue-example/
▸ node_modules/
▾ src/
  ▾ backend/
    ▾ controllers/
        home-controller.ts
      module.ts
  ▸ common/
  ▾ frontend/
    ▾ config/
        router.ts
    ▾ services/common/
        httpRequest.ts
    ▾ store/
        index.ts
    ▾ styles/
        variables.scss
    ▾ views/home/
        about.vue
        index.vue
      app.ts
      module.ts
      root.vue
      shims-vue.d.ts
  ▾ hooks/
      webpack.ts
  cell.yml
  package-lock.json
  package.json
  tsconfig.json
```


### 前端应用

修改src/frontend/views/home/index.vue，添加接口引用，修改后内容如下：

```vue
<template>
  <h1>index</h1>
  <p>title: {{ title }}</p>
  <button @click="request">click</button>
  <p>text: {{ text }}</p>
  <button @click="updateText">update text</button>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { ContainerUtil } from '@celljs/core';
import { HttpService } from '~/common';
export default defineComponent({
  setup() {
    const store = useStore();
    const title = computed(() => store.state.title);
    const text = ref("");
    const http = ContainerUtil.get<HttpService>(HttpService);
    const updateText = () => {
      http.get<string>('/node-api/hello').then(res => text.value = res);
    }
    return { title, updateText, text }
  },
  methods: {
    request() {
      fetch('/api/index.html').then((res: any) => console.log(res));
    }
  }
});
</script>
```

点击update-text按钮，会显示从node-api获取的内容
