---
title: 创建项目
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 创建项目

#### 创建目录及初始化

```bash
mkdir malagu-blog
cd malagu-blog
echo '{}' > package.json
yarn add --dev @malagu/cli
yarn add @malagu/core @malagu/mvc
```

#### 编辑package.json

加入以下内容:

```json
{
    "name": "malagu-blog",
    "keywords": ["malagu-component"],
    "scripts": {
        "start": "malagu serve",
        "build": "malagu build"
    },
    // npm依赖等
}
```
* keywords必须添加且其中必须有`malagu-component`，框架通过此配置来循环查找依赖链

#### 创建示例

在项目根目录创建 `tsconfig.json` 配置typescript编译参数

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

在项目根目录创建 `malagu.yml` 配置项目模块

```yaml
targets:
  - backend
backend:
  modules:
    - src/backend/module
```

创建 `src/backend/controllers/home-controller.ts` 测试输出

```ts
import { Controller, Get, Text } from "@malagu/mvc/lib/node";

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
import { autoBind } from "@malagu/core";
import "./controllers";

export default autoBind();
```

本地运行`yarn start`，用curl测试接口：`curl http://localhost:3000/api/home`此时应该能看到接口输出
