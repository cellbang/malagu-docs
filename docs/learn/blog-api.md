---
title: 接口格式
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---
# 接口格式

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

创建工具函数格式化输出结果`src/backend/utils/index.ts`

```ts
import { ResponseData } from "../../common";

export const jsonFormat = <T>(data: T, error: any = null) : ResponseData<T> => {
    let code: 0 | 1 = error ? 1 : 0;
    let message: string = error ? (error.message || error) : '';
    return { code, data, message };
}
```
