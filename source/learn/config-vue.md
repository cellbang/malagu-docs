---
title: '配置vue项目'
description: 'Malagu框架整合了webpack，这里展示如何进行项目相关配置'
type: learn
lang: zh-CN
---

### 配置路径别名

刚刚可以看到，我们在src/config/router.ts文件中引用vue文件使用的是相对路径，实际开发中会为路径定义别名。现在我们给Malagu根目录配置别名

#### 修改ts别名配置

修改tsconfig.json，添加paths设置:

```json
{
  "compilerOptions": {
      // ...
      "paths": {
        "~/*": ["*"]
      }
  }
}
```

#### 添加webpack配置

添加src/hooks/webpack.ts配置webpack别名

src/hooks/webpack.ts

```ts
import { WebpackContext, ConfigurationContext } from "@malagu/cli-service";
import * as path from "path";

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const webpackConfig = ConfigurationContext.getFrontendConfiguration( configurations );
    if (webpackConfig) {
        const basePath = path.resolve(__dirname, "../");
        webpackConfig.resolve
            .alias
                .set("~", basePath);
    }
}
```

* 修改配置使用webpack-chain语法，可搜索相关api用法。

#### 修改路由文件

将src/config/router.ts中的路径，将`../`修改为`~`

* 因为之前项目启动前没有加载src/hook/webpack.ts所以需要重启项目加载该配置

### 为scss加载全局变量

#### 添加scss变量文件

src/styles/variables.scss

```scss
$backgrond-color: #DDD;
```

#### 添加webpack配置

通过webpack相关配置可以为scss全局载入变量。编辑src/hooks/webpack.ts在刚刚别名配置后面加入以下内容：

```ts
        let oneOfKeys = ["normal", "normal-modules", "vue", "vue-modules"];
        for (let oneOfKey of oneOfKeys) {
            webpackConfig.module
                .rule("scss")
                    .oneOf(oneOfKey)
                    .use("sass-loader")
                        .tap((options: any) => ({
                            ...options,
                            additionalData: "@import '~/styles/variables.scss';"
                        }))
                .end().end().end()
                .rule("sass")
                    .oneOf(oneOfKey)
                        .use("sass-loader")
                            .tap((options: any) => ({
                                ...options,
                                additionalData: "@import '~/styles/variables.scss'"
                            }));
        };
```

#### 设置样式

编辑src/root.vue添加以下内容：

```vue
<style lang="scss">
body {
  background-color: $backgrond-color;
}
</style>
```

### 为webpack配置proxy

修改src/hooks/webpack.ts，加入以下内容即可：

```ts
        webpackConfig.devServer
            .proxy({
                "/api": {
                    target: "http://example.com",
                    changeOrigin: true,
                    pathRewrite: {
                        "^/api": ""
                    }
                }
            });
```
