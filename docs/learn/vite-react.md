---
title: 'React项目'
description: Cell框架结合React适配Vite
type: learn
lang: zh-CN
---

# React项目

### 创建项目

```bash
npm create vite@latest cell-react-for-vite --template react-ts
npm i
npm i -D @celljs/core
```

### 添加Shell和App修饰器

添加`src/common/constant.ts`

```ts
export const APP = Symbol("APP");
```

添加`src/annotation/app.ts`

```ts
import { Constant } from "@celljs/core";
import { APP } from "../common/constant";

export function App(app: any, rebind: boolean = false): ClassDecorator {
    return (t: any) => {
        Constant(APP, app, rebind)(t);
    };
}
```

添加`src/shell/index.ts`

```ts
import { Component, Autowired, Optional } from "@celljs/core";
import { ApplicationShell } from "@celljs/core/lib/browser";
import { APP } from "../common/constant";

@Component({ id: ApplicationShell, rebind: true })
export class Shell implements ApplicationShell {
    @Optional()
    @Autowired(APP)
    protected readonly app: any;

    attach(host: HTMLElement): void {
        this.app(host);
    }
}
```

### 适配项目
添加`src/createApp.tsx`

```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./App";

export function createApp(el: HTMLElement) {
    const root = ReactDOM.createRoot(el);
    root.render(<React.StrictMode>
        <App />
    </React.StrictMode>);
}
```

修改`src/main.tsx`为`src/main.ts`编辑内容如下：

```ts
import { App } from "./annotation/app";
import { createApp } from "./createApp";
import "./index.css"

@App(createApp)
export default class {
}
```

添加`src/module.ts`

```ts
import "./shell";
import { autoBind } from "@celljs/core";

import "./main";
export default autoBind();
```

### 添加启动文件

添加启动文件`src/boot.ts`

```ts
import "reflect-metadata";
import "setimmediate";
import { Container } from "inversify";
import { Application } from "@celljs/core/lib/common/application/application-protocol"
import { ContainerProvider } from "@celljs/core/lib/common/container/container-provider";
import { currentThis } from "@celljs/core/lib/common/utils";
import commonModule from "@celljs/core/lib/common/static-module";
import browserModule from "@celljs/core/lib/browser/static-module";

function bootstrap() {
    currentThis.cellProps = {
        cell: {
            hostDomId: "app"
        }
    };
    const container = new Container({ skipBaseClassChecks: true });
    container.load(commonModule, browserModule);
    import("./module")
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
-    <div id="root"></div>
+    <div id="app"></div>
-    <script type="module" src="/src/main.ts"></script>
+    <script type="module" src="/src/boot.ts"></script>
  </body>
</html>
```

### tsx文件启用decorator

默认请况下无法在后缀为`.tsx`的文件中使用decorator，需进行以下配置：

安装依赖

```bash
npm i -D @babel/plugin-proposal-decorators
```

修改配置`vite.confgi.ts`
```diff
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
-  plugins: [react()]
+  plugins: [react({
+    babel: {
+      parserOpts: {
+        plugins: ['decorators-legacy']
+      }
+    }
+  })]
})
```

验证：将`src/main.ts`修改为`src/main.tsx`尝试运行