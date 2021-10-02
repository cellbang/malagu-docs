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

创建接口`src/common/data/response-data.ts`

```ts
export interface ResponseData<T> {
    code: 0 | 1,
    data: T | null,
    message: string
}
```

导出接口`src/common/index.ts`

```ts
export * from './data/response-data';
```

创建格式化工具`src/common/backend/utils/index.ts`

```ts
import { ResponseData } from "../../common";

export const jsonFormat = <T>(data: T, error: any = null) : ResponseData<T> => {
    let code: 0 | 1 = error ? 1 : 0;
    let message: string = error ? (error.message || error) : '';
    return { code, data, message };
}
```


### Catetory分类接口

接口说明

Category分类CURD接口及路径如下：

| URI Pattren       | Verb   | Controller.Action          | Descripton |
| ----              | ----   | ----                       | ----       |
| /api/category     | GET    | catetory-controller.index  | 分类型表   |
| /api/catetory/:id | GET    | catetory-controller.show   | 分类详情   |
| /api/category     | POST   | catetory-controller.create | 创建分类   |
| /api/category/:id | PATCH  | catetory-controller.update | 修改分类   |
| /api/category/:id | DELETE | catetory-controller.delete | 删除分类   |

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
