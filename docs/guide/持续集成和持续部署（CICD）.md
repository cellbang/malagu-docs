---
title: 持续集成和持续部署（CICD）
order: 18.8
toc: menu
---

# 持续集成和持续部署（CICD）

在一个多人的开发团队，为了提升集成和部署的效率，同时也为了一些秘钥的安全性，我们需要提供持续集成和持续部署（CICD）能力。供持续集成和持续部署（CICD）的关键在于我们如何将秘钥注入到 CICD 的环境中，已经框架如何正确的获取该秘钥。注入秘钥一般由相关的平台来做，比如 GitHub；而获取秘钥，一般是由应用本身来处理。

## 框架默认提供 CICD 脚本


Malagu 框架提供了一系列开箱即用的模板，在模板中，默认提供了基于 GitHub Actions 实现 CICD 脚本，我们只需要在平台中注入相应的秘钥即可使用。脚本如下：


```yaml
name: Malagu Deploy

on: push

jobs:
  malagu-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup node
        uses: actions/setup-node@v1
        with:
          node-version: '12'
      - uses: bahmutov/npm-install@v1
      - run: npm run lint --if-present  # 存在代码风格检查命令则执行该代码风格检查命令
      - run: npm test                   # 执行测试命令
      - if: ${{ github.ref == 'refs/heads/master' }}  # 如果提交的主分支，则部署到生成环境
        env: ${{ secrets }}
        run: npx malagu deploy -m prod
      - if: ${{ github.ref == 'refs/heads/pre' }} # 如果提交的 pre 分支，则部署到预发环境
        env: ${{ secrets }}
        run: npx malagu deploy -m pre
      - if: ${{ github.ref != 'refs/heads/master' && github.ref != 'refs/heads/pre' }} # 如果提交的既不是主分支，又不是 pre 分支，则部署到测试环境
        env: ${{ secrets }}
        run: npx malagu deploy -m test
```


说明：

- 如果提交的主分支，则部署到生成环境： `npx malagu deploy -m prod` 
- 如果提交的 pre 分支，则部署到预发环境: `npx malagu deploy -m pre`
- 如果提交的既不是主分支，又不是 pre 分支，则部署到测试环境: `npx malagu deploy -m test`



## 如何获取注入的秘钥


GitHub 平台会将秘钥，通过环境变量注入到 CICD 运行环境中，在 Malagu 框架中，我们可以通过属性配置文件引用当前环境中的环境变量，如下所示：
```yaml
password: ${env.PASSWORD}
```


## 云厂商必须配置的秘钥


如果需要部署到云厂商的 Serverless 平台上，需要将相关的 AKSK 相信配置为秘钥，并注入到 CICD 环境中，配置一下秘钥即可：
```
MALAGU_REGION
MALAGU_ACCESS_KEY_ID
MALAGU_ACCESS_KEY_SECRET
MALAGU_ACCOUNT_ID # 部分云厂商可以不提供
```


