---
title: '创建一个Vue项目'
description: '从零创建一个Vue项目'
type: learn
lang: zh-CN
---

### 创建项目

#### 1.创建目录及初始化

```bash
mkdir vue-example
cd vue-example
echo '{}'>package.json
```

#### 2.安装相关依赖

```bash
npm i -D @malagu/cli @malagu/cli-service
npm i -S @malagu/vue @malagu/mvc @malagu/serve-static @malagu/vue
```

#### 3.编辑package.json

加入以下内容:

```json
{
  "name": "vue-example",
  "keywords": ["malagu-component"],
  "scripts": {
    "start": "malagu serve"
  },
}
```
* keywords必须添加，Malagu框架通过此配置来循环查找依赖链。

#### 4.添加文件

tsconfig.json
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "importHelpers": true,
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

malagu.yml

```yaml
targets:
  - frontend
```
src/shims-vue.d.ts

```typescript
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, unknown>
    export default component
}
```

#### 5.添加项目文件
src/root.tsx

```tsx
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return (<h1>hello malagu</h1>)
  }
})
```

src/app.ts

```ts
import { createApp } from 'vue';
import { App } from '@malagu/vue';
import Root from './root';

@App(createApp(Root))
export default class { }
```

src/module.ts

```ts
import { autoBind } from '@malagu/core';
import './app';

export default autoBind();
```

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

#### 6.启动项目

```bash
npm start
```
