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
yarn add @malagu/core @malagu/mvc @malagu/typeorm
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
backend:
  modules:
    - src/backend/module
```

* 添加Malagu项目配置

src/backend/controllers/home-controller.ts

```ts
import { Controller, Get, Text } from "@malagu/mvc/lib/node";

@Controller('api/home')
export class HomeController {
    @Get()
    @Text()
    index(): string {
        return "hello";
    }
}
```

src/backend/controllers/index.ts

```ts
export * from "./home-controller";
```

src/backend/module.ts

```ts
import { autoBind } from "@malagu/core";
import "./controllers";

export default autoBind();
```

本地运行`npm start`，用curl测试接口：`curl http://localhost:3000/api/home`此时应该能看到接口输出
