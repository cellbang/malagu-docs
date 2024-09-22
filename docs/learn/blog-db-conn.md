---
title: 连接数据库
description: 本篇通过使用Cell框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---
# 连接数据库

### 添加依赖

```bash
yarn add  @celljs/typeorm
```

### 添加配置文件

在项目根目录创建 `cell-local.yml` 配置数据库

```yaml
backend: 
  cell:
    typeorm:
      ormConfig:
        - type: mysql
          host: <db_host>
          port: 3306
          synchronize: true
          username: <db_user>
          password: "<db_pass>"
          database: cell-blog
          logging: true
```
* 请将db_host、db_user、db_pass进行相应替换。

### 创建数据库

使用工具或命令行创建数据库，示例中数据库名为cell-blog，名称和上面yaml中的datebase字段对应即可。暂时不用建表，typeorm会根据entity自动建表修改字段
