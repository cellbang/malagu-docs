---
title: 创建项目
description: 本篇通过使用Cell框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 创建项目

#### 创建目录及初始化

```bash
mkdir cell-blog
cd cell-blog
echo '{}' > package.json
yarn add @celljs/core @celljs/mvc
yarn add --dev @celljs/cli @celljs/cli-service
```

#### 编辑package.json

加入以下内容:

```json
{
    "name": "cell-blog",
    "keywords": ["cell-component"],
    "scripts": {
        "start": "cell serve",
        "build": "cell build"
    },
    // npm依赖等
}
```
* keywords必须添加且其中必须有`cell-component`，框架通过此配置来循环查找依赖链

完整 package.json 内容如下：

```json
{
  "name": "cell-blog",
    "keywords": ["cell-component"],
    "scripts": {
        "start": "cell serve",
        "build": "cell build"
    },
  "dependencies": {
    "@celljs/core": "^2.56.0",
    "@celljs/mvc": "^2.56.0"
  },
  "devDependencies": {
    "@celljs/cli": "^2.56.0",
    "@celljs/cli-service": "^2.56.0"
  }
}
```

#### 创建示例

在项目根目录创建 `tsconfig.json` 配置typescript编译参数

```json
{
  "compilerOptions": {
    "target": "ES2017",
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
    "baseUrl": "./src",
    "paths": {
      "~/*": ["*"],
      "@/*": ["frontend/*"]
    }
  },
  "include": [
    "src"
  ],
  "ts-node": {
    "transpileOnly": true
  }
}
```

在项目根目录创建 `cell.yml` 配置项目模块

```yaml
targets:
  - backend
backend:
  modules:
    - src/backend/module
```

创建 `src/backend/controllers/home-controller.ts` 测试输出

```ts
import { Controller, Get, Text } from "@celljs/mvc/lib/node";

@Controller("api/home")
export class HomeController {
    @Get()
    @Text()
    index(): string {
        return "hello";
    }
}
```

创建 `src/backend/controllers/index.ts` 导出上面定义的controller

```ts
export * from "./home-controller";
```

创建 `src/backend/module.ts` 引入定义的controller并导出项目模块

```ts
import { autoBind } from "@celljs/core";
import "./controllers";

export default autoBind();
```

本地运行`yarn start`，用curl测试接口：`curl http://localhost:3000/api/home`此时应该能看到接口输出
