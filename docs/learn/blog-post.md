---
title: blog接口
description: 本篇通过使用Cell框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---
# blog接口

### 创建模型

创建post模型 `src/backend/entity/post.ts` 内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Category } from "./category";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: "category_id" })
    category: Category;

    @Column()
    title: string;

    @Column({
        length: 10000
    })
    content: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: number;
}
```

* typeorm中OneToOne和ManyToOne有不同的表中结构约束，不可混用。ManyToMany使用自定义的表名和表字段，需要手动指定

修改 `src/backend/entity/index.ts` 导出模型，添加内容如下:

```ts
export * from "./post";
```

### 添加接口实现

Post内容CURD接口及路径如下：

| URI Pattern   | Verb   | Controller.Action      | Description |
| ----          | ----   | ----                   | ----        |
| /api/post     | GET    | post-controller.index  | blog列表   |
| /api/post/:id | GET    | post-controller.show   | blog详情   |
| /api/post     | POST   | post-controller.create | 创建blog   |
| /api/post/:id | PATCH  | post-controller.update | 修改blog   |
| /api/post/:id | DELETE | post-controller.delete | 删除blog   |

创建接口controller `src/backend/controllers/post-controller.ts` 内容如下：

```ts
import { Controller, Get, Post, Patch, Delete, Json, Param, Query, Body } from "@celljs/mvc/lib/node";
import { Post as PostModel } from "../entity";
import { ResponseData } from "../../common";
import { jsonFormat } from '../utils';

@Controller('api/post')
export class PostController {
    // 列表
    @Get()
    @Json()
    async index(@Query("page") page: number = 1, @Query("size") size: number = 20): Promise<ResponseData<PostModel[]>> {
        let posts: PostModel[] = await PostModel.find({
            take: size,
            skip: size * (page - 1),
            order: { id: "DESC" },
            relations: ["category"]
        });
        return jsonFormat(posts);
    }
    // 查询
    @Get(":id")
    async show(@Param("id") id: number): Promise<ResponseData<PostModel>> {
        let post: PostModel = await PostModel.findOne({
            where: { id },
            relations: ["category"]
        }) as PostModel;
        return jsonFormat(post);
    }
    // 创建
    @Post()
    async create(@Body("json") postData: string): Promise<any> {
        let post = JSON.parse(postData);
        try {
            let saved = await PostModel.save(post);
            return jsonFormat(saved);
        }
        catch(e) {
            return jsonFormat(e);
        }
    }
    // 更新
    @Patch(":id")
    async update(@Param("id") id: number, @Body("json") postData: string): Promise<any> {
        let saveData = JSON.parse(postData);
        try {
            let saved = await PostModel.update(id, saveData);
            return jsonFormat(saveData);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }
    // 删除
    @Delete(":id")
    async delete(@Param("id") id: number): Promise<any> {
        try {
            let deleted = await PostModel.delete(id);
            return jsonFormat(deleted);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }
}
```
* 因为Post模型和Post修器命名冲突，所以这里用PostModel代替

修改 `src/backend/controllers/index.ts` 导出上面定义的 controller，添加内容如下：

```ts
export * from "./post-controller";
```

### 命令行接口测试

```bash
# 创建分类
curl -X POST -d 'json={"parentId":0,"title":"test","level":1,"desc":"测试分类"}' \
  'http://localhost:3000/api/category'

# 新增内容，假设此时创建分类id为2
curl -X POST -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。", "category": { "id": 2 } }' \
'http://localhost:3000/api/post'
# 查询数据列表
curl 'http://localhost:3000/api/post'
# 查询单条纪录，1为刚刚插入的纪录id
curl 'http://localhost:3000/api/post/1'
# 修改数据
curl -X PATCH -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。--萧衍", "category": { "id": 2 } }' \
  'http://localhost:3000/api/post/1'
# 删除数据
# curl -X DELETE 'http://localhost:3000/api/post/1'
```
