---
title: 'Vue项目'
description: Malagu框架结合Vue适配Vite
type: learn
lang: zh-CN
---

# Vue项目

### 创建项目

```bash
npm create vite@latest malagu-vue-for-vite --template vue-ts
npm i
npm i -D @malagu/core @malagu/vue
```

### 适配项目

编辑`src/main.ts`

```ts
import { createApp } from "vue";
import { App } from "@malagu/vue";
import Root from './App.vue'

@App(createApp(Root))
export default class {}
```

添加`src/module.ts`

```ts
import { autoBind } from "@malagu/core";
import "./main";

export default autoBind();
```

### 添加启动文件

添加启动文件`src/boot.ts`

```ts
import "reflect-metadata";
import "setimmediate";
import { Container } from "inversify";
import { Application } from "@malagu/core/lib/common/application/application-protocol"
import { ContainerProvider } from "@malagu/core/lib/common/container/container-provider";
import { currentThis } from "@malagu/core/lib/common/utils";
import commonModule from "@malagu/core/lib/common/static-module";
import browserModule from "@malagu/core/lib/browser/static-module";

function bootstrap() {
    currentThis.malaguProps = {
        malagu: {
            hostDomId: "app"
        }
    };
    const container = new Container({ skipBaseClassChecks: true });
    container.load(commonModule, browserModule);
    import("@malagu/vue/lib/browser/module")
        .then(res => container.load(res.default))
        .then(() =>import("./module"))
        .then(res => container.load(res.default))
        .then(() => {
            ContainerProvider.set(container);
            const application = container.get<Application>(Application);
            application.start().catch(reason => {
                console.error(`Failed to start the ${application.constructor.name}.`);
                if (reason) {
                    console.error(reason);
                }
            });
        });
}

bootstrap();
```

### 配置启动

编辑`index.html`文件，修改入口文件为`src/boot.ts`

```diff
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
-    <script type="module" src="/src/main.ts"></script>
+    <script type="module" src="/src/boot.ts"></script>
  </body>
</html>
```