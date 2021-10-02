---
title: '编译打包'
description: '针对Malagu默认的build配置进行修改，方便前端项目部署'
type: learn
lang: zh-CN
---

# 编译打包

Malagu默认build输出目录为根目录下.malagu目录，frontend和backend文件夹，分别对应前端和node端的输出。纯vue项目前端大多输出到根目录下的dist目录，这里进行配置。

```ts
import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';
import * as path from 'path';

export default async (context: WebpackContext) => {
    const { configurations, dev } = context;
    const webpackConfig = ConfigurationContext.getFrontendConfiguration( configurations );
    if (webpackConfig) {
        // ...
        // 打包配置
        if (!dev) {
            let PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
            // 输出目录为根目录 dist
            webpackConfig.output
                .path(path.resolve(__dirname, '../../dist'))
                .publicPath(PUBLIC_PATH);
            // img目录为 dist/static/img，svg、font目录为dist/static/icon
            webpackConfig.module
                .rule('img')
                    .merge({
                        generator: {
                            publicPath: '../../',
                            filename: 'static/img/[hash][ext][query]'
                        }
                    })
                    .end()
                .rule('svg')
                    .merge({
                        generator: {
                            publicPath: '../../',
                            filename: 'static/icon/[hash][ext][query]'
                        }
                    })
                    .end()
                .rule('font')
                    .merge({
                        generator: {
                            publicPath: '../../',
                            filename: 'static/icon/[hash][ext][query]'
                        }
                    });
            // css目录为 dist/static/css
            webpackConfig.plugin('extract-css')
                .tap(options => {
                    return [ {...options[0],
                        filename: "static/css/[name].[contenthash:8].css",
                    }];
                });
        }
    }
}
```
