---
title: '添加Node Api'
description: 'Malagu框加的优点在于前后端一体化开发，这里展示如何创建Node Api'
type: learn
lang: zh-CN
---

### 添加Node Api支持

#### 安装依赖

```bash
npm i -S @malagu/mvc
```

#### 整理文件及目录

将src/目录下，除hooks以外的文件都移动到src/frontend目录。

创建src/backend/module.ts文件，内容如下：

```ts
import { autoBind } from "@malagu/core";

export default autoBind();
```

修改malagu.yml，去除target配置，添加module相关配置，内容如下：

```yaml
frontend:
  modules:
    - src/frontend/module
backend:
  modules:
    - src/backend/module
```

* Malagu默认的目录名为node、browser，这里因为修改了默认目录，所以需要为前后端配置加载的模块。

#### 添加接口

添加src/backend/controllers/home-controller.ts

```ts
import { Controller, Get, Text } from "@malagu/mvc/lib/node";

@Controller("node-api")
export class HomeController {
    @Get()
    @Text()
    home(): string {
        return "Welcome to Malagu";
    }
}
```

修改src/backend/module.ts引入home-controller.ts

```ts
import { autoBind } from "@malagu/core";
import "controllers/home-controller";

export default autoBind();
```
