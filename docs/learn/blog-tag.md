---
title: 标签接口
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 标签接口

### 功能说明

之前的接口已经创建了blog相关api，现在需要给blog添加标签(tag)。blog和tag是多对多的关系，用一个中间表来关联。

### 数据说明

标签的提交内容为json中的tags字段，使用,分隔的字符串。

示例：

```json
{
    ...
    "tags": "malagu,framework,nodejs"
}
```

### 创建tag模型

创建tag模型 `src/backend/entity/tag.ts` 内容如下：

```typescript
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, ManyToMany, In } from "typeorm";
import { Post } from "./post";

@Entity({ name: "tags" })
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];

    @Column()
    title: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: number;

    static async buildTags(tagText: string) {
        let tagTextArray = tagText.split(',').map(
            (item: string) => item.replace(/^\s|\s$/g, '')
        );
        let tags = await Tag.find({
            select: ["id", "title"],
            where: { title: In(tagTextArray) }
        });
        let newTagText: string[] = [];
        if (tags.length < tagTextArray.length) {
            let existsTagText: string[] = tags.map((tag: any) => tag.title);
            for(let tag of tagTextArray) {
                if (existsTagText.indexOf(tag) < 0) {
                    newTagText.push(tag);
                }
            }
        }
        if (newTagText.length) {
            let newTags = newTagText.map((item: string) => {
                let tag = new Tag();
                tag.title = item;
                tag.desc = item;
                return tag.save();
            });
            let newSavedTags = await Promise.all(newTags);
            tags = tags.concat(newSavedTags);
        }
        return tags;
    }
}
```

这里将输入的文本进行拆分，然后查找不存在的标签执行插入动作后返回标签的数组。

修改 `src/backend/entity/index.ts` 导出模型，添加内容如下:

```ts
export * from "./tag";
```

同时修改 `src/backend/entity/post.ts` 添加对`tag`的引用，修改后内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, JoinColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Category } from "./category";
import { Tag } from "./tag";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: "category_id" })
    category: Category;

    @ManyToMany(() => Tag, (tag: Tag) => tag.posts)
    @JoinTable({
        name: "post_tags",
        joinColumn: {
            name: "post_id"
        },
        inverseJoinColumn: {
            name: "tag_id"
        }
    })
    tags: Tag[];

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

### 应用标签功能

修改 `src/backend/controller/post-controller.ts` 文件中的show、create、update、delete方法，修改后文件内容如下：

```typescript
import { Controller, Get, Post, Patch, Delete, Json, Param, Query, Body } from "@malagu/mvc/lib/node";
import { Post as PostModel, Tag } from "../entity";
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
    @Json()
    async show(@Param('id') id: number): Promise<ResponseData<PostModel>> {
        let post: PostModel = await PostModel.findOne(id, {
            relations: ["category", "tags"]
        }) as PostModel;
        return jsonFormat(post);
    }
    // 创建
    @Post()
    @Json()
    async create(@Body("json") postData: string): Promise<any> {
        let post = JSON.parse(postData);
        try {
            if (post.tags) {
                post.tags = await Tag.buildTags(post.tags);
            }
            let saved = await PostModel.save(post);
            return jsonFormat(saved);
        }
        catch(e) {
            return jsonFormat(e);
        }
    }
    // 更新
    @Patch(":id")
    @Json()
    async update(@Param("id") id: number, @Body("json") postData: string): Promise<any> {
        let saveData = JSON.parse(postData);
        try {
            let tagText = "";
            if (saveData.tags) {
                tagText = saveData.tags;
                delete saveData.tags;
            }
            let saved = await PostModel.update(id, saveData);
            let post: PostModel = await PostModel.findOne(id) as PostModel;
            post.tags = await Tag.buildTags(tagText);
            await post.save();
            return jsonFormat(post);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }

    // 删除
    @Delete(":id")
    @Json()
    async delete(@Param("id") id: number): Promise<any> {
        try {
            let post: PostModel = await PostModel.findOne(id) as PostModel;
            post.tags = [];
            await post.save();
            let deleted = await PostModel.delete(id);
            return jsonFormat(deleted);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }
}
```

### 命令行测试

```bash
# 新增内容
curl -X POST -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。", "category": { "id": 2 }, "tags": "诗歌,诗与歌" }' \
  'http://localhost:3000/api/post'
# 查询数据列表
curl 'http://localhost:3000/api/post'
# 查询单条纪录，2为刚刚插入的纪录id
curl 'http://localhost:3000/api/post/2'
# 修改数据
curl -X PATCH -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。--萧衍", "category": { "id": 2 }, "tags": "诗歌,诗与歌,乐府民歌"}' \
  'http://localhost:3000/api/post/2'
# 删除数据
curl -X DELETE 'http://localhost:3000/api/post/2'
```
