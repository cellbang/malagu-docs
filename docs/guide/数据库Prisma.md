---
title: Prisma
order: 14
toc: menu
---

# Prisma

## 本地开发

在本地调试的时候可以参照 [官方教程](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgres) 引入，引入后在打包前可以正常使用，具体步骤如下。

#### 1.设置 Prisma

```shell
npm install prisma
or
yarn add prisma
```

#### 2.初始化 Prisma

```shell
npx prisma init
```

#### 3.连接数据库

```ts
datasource db { 
    provider = "postgresql" // 可以选择如Mysql等其他数据库
    url = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
}

generator client {
    provider = "prisma-client-js"
    output = "../prisma-client"
    binaryTargets = ["darwin", "rhel-openssl-1.0.x"]
}
```

> binaryTargets 需要根据部署的目标平台的架构选择不同的引擎， [参考文档](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options)

![](https://img.jaryn.ink/img/202210211610727.png)

#### 4.安装 Prisma Client

```shell
npm install @prisma/client
or 
yarn add @prisma/client
```

#### 5.生成 Prisma Client

```
npx prisma generate
```

#### 6.创建迁移

```
npx prisma migrate dev --name init
```

#### 7.使用 Prisma

``` ts
import { PrismaClient } from '../prisma-client'
// 如果指定了导出地址，这里需要指定为导出地址

const prisma = new PrismaClient()

async function main() {
     await prisma.user.create({
         data: {
             name: 'Alice',
             email: 'alice@prisma.io',
             posts: {
                 create: { title: 'Hello World' },
            }
        },
    })
}
```

> 上述使用到的 [schema](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/introspection-typescript-postgres)

## 打包发布

发布的时候 Prisma Client 和 Prisma Schema 默认不会打包，所以需要 webpack 插件，参考如下示例。

#### 1.创建 src/hooks/webpack.ts

```ts
import { ConfigurationContext,WebpackContext } from "@celljs/cli-service/lib/context/context-protocol";
import { PathUtil } from "@celljs/cli-common/lib/utils/path-util";

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getBackendConfiguration(configurations);
    if (config) {
        const CopyPlugin = require("copy-webpack-plugin");
        const to = PathUtil.getProjectHomePath();
        config.plugin("copyPrisma").use(CopyPlugin, [
            {
                patterns: [
                    {
                        from: "your project path" + "/prisma",
                        to: to + "/dist/prisma",
                    },
                    {
                        from: "your project path" + "/prisma-client",
                        to: to + "/dist/prisma-client",
                    },
                ],
            },
            ]);
        }
};
```

#### 2.使用 Cos 方式部署代码

因为 Prisma 生成的 client 体积非常大，使用直接上传代码包的方式上传的话，可能会超出接口限制，建议使用 cell 的 ` 通过 Cos 方式部署 ` 能力进行部署。