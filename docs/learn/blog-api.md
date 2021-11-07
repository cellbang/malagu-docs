---
title: 编写接口
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 创建接口

### 返回格式

统一返回json格式，说明如下：

```ts
{
    code: number // 0/1 0成功，1失败
    data: any // 返回数据
    message: string // 提示
}
```

定义接口数据结构`src/common/data/response-data.ts`

```ts
export interface ResponseData<T> {
    code: 0 | 1,
    data: T | null,
    message: string
}
```

导出数据构结定义`src/common/index.ts`

```ts
export * from './data/response-data';
```

创建工具函数格式化输出结果`src/common/backend/utils/index.ts`

```ts
import { ResponseData } from "../../common";

export const jsonFormat = <T>(data: T, error: any = null) : ResponseData<T> => {
    let code: 0 | 1 = error ? 1 : 0;
    let message: string = error ? (error.message || error) : '';
    return { code, data, message };
}
```


### Category分类接口

接口说明

Category分类CURD接口及路径如下：

| URI Pattren       | Verb   | Controller.Action          | Descripton |
| ----              | ----   | ----                       | ----       |
| /api/category     | GET    | category-controller.index  | 分类列表   |
| /api/category/:id | GET    | category-controller.show   | 分类详情   |
| /api/category     | POST   | category-controller.create | 创建分类   |
| /api/category/:id | PATCH  | category-controller.update | 修改分类   |
| /api/category/:id | DELETE | category-controller.delete | 删除分类   |

接口实现`src/backend/controllers/category-controller.ts`

```ts
import { Controller, Get, Json, Param, Post,
    Query, Body, Patch, Delete } from "@malagu/mvc/lib/node";
import { ResponseData } from "../../common";
import { Category } from "../entity";
import { jsonFormat } from '../utils';

@Controller("api/category")
export class CategoryController {
    @Get()
    @Json()
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
    @Json()
    async show(@Param("id" ) id: number): Promise<ResponseData<Category>> {
        let result = await Category.findOne({ id });
        return jsonFormat(result);
    }

    @Post()
    @Json()
    async create(@Body("json") postData): Promise<any> {
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
    @Json()
    async update(@Param("id") id: number, @Body("json") postData): Promise<any> {
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
    @Json()
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

修改`src/backend/controllers/index.ts`文件，导出接口类

```ts
export * from "./category-controller";
```

命令行测试接口

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

### Post内容接口

接口说明

Post内容CURD接口及路径如下：

| URI Pattren   | Verb   | Controller.Action      | Descripton |
| ----          | ----   | ----                   | ----       |
| /api/post     | GET    | post-controller.index  | blog列表   |
| /api/post/:id | GET    | post-controller.show   | blog详情   |
| /api/post     | POST   | post-controller.create | 创建blog   |
| /api/post/:id | PATCH  | post-controller.update | 修改blog   |
| /api/post/:id | DELETE | post-controller.delete | 删除blog   |

接口实现`src/backend/controllers/post-controller.ts`

```ts
import { Controller, Get, Post, Patch, Delete, Json, Param, Query, Body } from "@malagu/mvc/lib/node";
import { Post as PostModel, Tag } from "../entity";
import { ResponseData } from "../../common";
import { jsonFormat } from '../utils';

@Controller('api/post')
export class PostController {
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

    @Get(":id")
    @Json()
    async show(@Param('id') id: number): Promise<ResponseData<PostModel>> {
        let post: PostModel = await PostModel.findOne(id, {
            relations: ["category"]
        });
        return jsonFormat(post);
    }

    @Post()
    @Json()
    async create(@Body("json") postData): Promise<any> {
        let post = JSON.parse(postData);
        try {
            let saved = await PostModel.save(post);
            return jsonFormat(saved);
        }
        catch(e) {
            return jsonFormat(e);
        }
    }

    @Patch(":id")
    @Json()
    async update(@Param("id") id: number, @Body("json") postData): Promise<any> {
        let saveData = JSON.parse(postData);
        try {
            let saved = await PostModel.update(id, saveData);
            return jsonFormat(saveData);
        }
        catch(e) {
            return jsonFormat(null, e);
        }
    }

    @Delete(":id")
    @Json()
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

修改`src/backend/controllers/index.ts`文件，导出接口类

```ts
export * from "./category-controller";
```

命令行测试接口

```bash
# 新增内容
curl -X POST -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。", "category": { "id": 1 } }' \
  'http://localhost:3000/api/post'
# 查询数据列表
curl 'http://localhost:3000/api/post'
# 查询单条纪录，1为刚刚插入的纪录id
curl 'http://localhost:3000/api/post/1'
# 修改数据
curl -X PATCH -d 'json={ "title": "子夜四时歌-春歌", "desc": "测试post", "content": "兰叶始满地。梅花已落枝。持此可怜意。摘以寄心知。--萧衍", "category": { "id": 1 } }' \
  'http://localhost:3000/api/post/1'
# 删除数据
curl -X DELETE 'http://localhost:3000/api/post/1'
```
