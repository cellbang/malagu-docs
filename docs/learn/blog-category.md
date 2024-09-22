---
title: 分类接口
description: 本篇通过使用Cell框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---
# 分类接口

### 创建模型

创建分类模型 `src/backend/entity/category.ts` 内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn } from "typeorm";

@Entity({ name: "categories" })
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "parent_id" })
    parentId: number;

    @Column()
    title: string;

    @Column()
    level: number;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
```

* 字段名和表中定义不一样的可以用@Column选项来指定表中的字段名，@CreateDateColumn、@UpdateDateColumn会修改数据库字段的默认值，所以需`cell-local.yml`中要开启`synchronize`选项

创建 `src/backend/entity/index.ts` 导出模型

```ts
export * from "./category";
```

修改 `src/backend/module.ts` 添加实体绑定，修改后内容如下：

```ts
import { autoBind } from "@celljs/core";
import "./controllers";
import { autoBindEntities } from "@celljs/typeorm";
import * as entities from "./entity";

autoBindEntities(entities);
export default autoBind();
```

### 添加接口实现

Category分类CURD接口及路径如下：

| URI Pattern       | Verb   | Controller.Action          | Description |
| ----              | ----   | ----                       | ----        |
| /api/category     | GET    | catetory-controller.index  | 分类型表   |
| /api/catetory/:id | GET    | catetory-controller.show   | 分类详情   |
| /api/category     | POST   | catetory-controller.create | 创建分类   |
| /api/category/:id | PATCH  | catetory-controller.update | 修改分类   |
| /api/category/:id | DELETE | catetory-controller.delete | 删除分类   |

创建接口controller `src/backend/controllers/category-controller.ts` 内容如下：

```ts
import { Controller, Get, Param, Post,
    Query, Body, Patch, Delete } from "@celljs/mvc/lib/node";
import { ResponseData } from "../../common";
import { Category } from "../entity";
import { jsonFormat } from '../utils';

@Controller("api/category")
export class CategoryController {
    @Get()
    async index(@Query("page") page: number = 1,
                @Query("size") size: number = 20):Promise<ResponseData<Category[]>> {
        let result = await Category.find({ 
          take: size,
          skip: size * (page - 1),
          order: { id: "DESC" }
        });
        return jsonFormat(result);
    }

    @Get(":id")
    async show(@Param("id" ) id: number): Promise<ResponseData<Category | null>> {
        let result = await Category.findOne({ where: { id }});
        return jsonFormat(result);
    }

    @Post()
    async create(@Body("json") postData: any): Promise<any> {
        let category = JSON.parse(postData);
        try {
            let saved = await Category.save(category);
            return jsonFormat(saved);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }

    @Patch(":id")
    async update(@Param("id") id: number, @Body("json") postData: any): Promise<any> {
        let saveData = JSON.parse(postData);
        try {
            let saved = Category.update(id, saveData);
            return jsonFormat(saveData);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }

    @Delete(":id")
    async delete(@Param("id") id: number): Promise<any> {
        try {
            let deleted = Category.delete({ id });
            return jsonFormat(deleted);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }
}
```

修改 `src/backend/controllers/index.ts` 导出上面定义的 controller，添加内容如下：

```ts
export * from "./category-controller";
```

### 命令行测试接口

```bash
# 新增分类
curl -X POST -d 'json={"parentId":0,"title":"test","level":1,"desc":"测试分类"}' \
  'http://localhost:3000/api/category'
# 查询数据列表
curl 'http://localhost:3000/api/category'
# 查询单条纪录，1为刚刚插入的纪录id
curl 'http://localhost:3000/api/category/1'
# 修改数据
curl -X PATCH -d 'json={"parentId":0,"title":"testaaa","level":1,"desc":"测试分类"}' \
  'http://localhost:3000/api/category/1'
# 删除数据
curl -X DELETE 'http://localhost:3000/api/category/1'
```
