---
title: 创建项目
description: 本篇通过代码实例演示Malagu框架的Security组件用法
type: learn
lang: zh-CN
---


# 创建项目

本篇介绍使用命令行创建一个 Malagu 项目，并通过 Mvc 组件来展示一个简单的页面。

### 创建目录及初始化

```bash
mkdir security-demo
echo '{}' > package.json
yarn add @malagu/core @malagu/mvc
yarn add --dev @malagu/cli @malagu/cli-service
```


#### 配置Npm命令

编辑`package.json`添加如下内容：

```json
{
  "name": "security-demo",
  "keywords": [
    "malagu-components"
  ],
  "scripts": {
    "start": "malagu serve"
  },
  // ...
}
```

完整 package.json 内容如下：

```json
{
  "name": "security-demo",
  "keywords": [
    "malagu-components"
  ],
  "scripts": {
    "start": "malagu serve"
  },
  "dependencies": {
    "@malagu/core": "^2.56.0",
    "@malagu/mvc": "^2.56.0"
  },
  "devDependencies": {
    "@malagu/cli": "^2.56.0",
    "@malagu/cli-service": "^2.56.0"
  }
}
```

* `必须在keywords中包含malagu-components`，框架通过此配置来循环查找依赖链


### 创建示例

#### 配置文件

创建`tsconfig.json`配置typescript编译参数，内容如下：

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

创建`malagu.yml`配置项目模块，内容如下：

```yaml
backend:
  modules:
    - src/backend/module
```

#### 示例代码

创建`src/backend/controllers/home-controller.ts`文件处理请求，内容如下：

```typescript
import { Controller, Get, Html } from "@malagu/mvc/lib/node";

@Controller("")
export class HomeController {
    @Get("/")
    @Html("home/index.mustache")
    indexAction() {
        return { name: "sam zhang" };
    }
}
```

创建`src/assets/views/home/index.mustache`展示页面模板，文件内容如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>index</title>
</head>
<body>
    <p>home#index</p>
    <p>你好：{{ name }}</p>
</body>
</html>
```

创建`src/backend/module.ts`文件引入定义的controller并导出项目，内容如下：

```typescript
import { autoBind } from "@malagu/core";
import "./controllers/home-controller";

export default autoBind();
```

### 启动并访问项目

启动项目

```bash
yarn start
```

打开浏览器访问 `http://localhost:3000` 可以看到页面内容输出
