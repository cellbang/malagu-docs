---
title: '项目介绍'
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 项目介绍

### 项目目录
- src/frontend 前端
- src/backend 后端

### 表数据表结构如下

![数据表结构](/images/learn/blog-structure.svg)

### 接口定义如下

Category分类CURD接口及路径如下：

| URI Pattren       | Verb   | Controller.Action          | Descripton |
| ----              | ----   | ----                       | ----       |
| /api/category     | GET    | catetory-controller.index  | 分类型表   |
| /api/catetory/:id | GET    | catetory-controller.show   | 分类详情   |
| /api/category     | POST   | catetory-controller.create | 创建分类   |
| /api/category/:id | PATCH  | catetory-controller.update | 修改分类   |
| /api/category/:id | DELETE | catetory-controller.delete | 删除分类   |
