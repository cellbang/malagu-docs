---
title: 登录认证
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 登录认证

示例设计的是一个单用户 blog 系统，当用户登录成功返回 token ，请求传入 token 可以校验即允许用户操作。使用@malagu/security、@malagu/jwt、crypto-js等库

### 添加依赖

```bash
yarn add @malagu/security @malagu/jwt crypto-js
yarn add --dev @types/crypto-js
```

修改 `src/malagu-local.yml` 添加如下内容：

```yml
backend:
  malagu:
    # 新增内容
    logger:
      level: debug
    jwt:
      secret: abcdefg
```

### 添加工具函数

创建 `src/backend/utils/crypto.ts` 内容如下：

```ts
import * as SHA256 from "crypto-js/sha256";

export function sha256Encode(content: string) {
    return SHA256(content).toString();
}
```

### 添加用户实体

创建 `src/backend/entity/user.ts` 文件定义用户实体，内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, Unique } from "typeorm";

@Entity({ name: "users" })
@Unique(["username"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
```

修改 `src/backend/entity/index.ts` 导出实体，添加内容如下:

```ts
export * from "./user";
```

创建`src/backend/services/user-service.ts`文件处理用户加载，内容如下：

```ts
import { Service } from "@malagu/core";
import { UserService } from "@malagu/security/lib/node";
import { User } from "../entity/user";

@Service({ id: UserService, rebind: true })
export class UserServiceImpl implements UserService<string, any> {
    async load(username: string): Promise<any> {
        let user = await User.findOne({ where: { username: username } });
        return user;
    }
}
```

默认 [user-service](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/user/user-service.ts) 实现

因为我们刚刚创建数据库，数据库中还没有用户

创建`src/backend/controllers/user-controller.ts`初始化用户数据、返回用户信息，内容如下：

```ts
import { Controller, Get } from "@malagu/mvc/lib/node";
import { User } from "../entity/user";
import { Authenticated, SecurityContext } from "@malagu/security/lib/node"
import { sha256Encode } from "../utils/crypto";
import { Value } from "@malagu/core";
import { jsonFormat } from "../utils";

@Controller("api/user")
export class UserController {
    @Value("mode")
    mode: string;

    @Get()
    @Authenticated()
    indexAction() {
        const userInfo = SecurityContext.getAuthentication();
        return jsonFormat({ name: userInfo.name });
    }

    @Get("create")
    async createAction() {
        if (this.mode && this.mode.indexOf('local') > -1) {
            let user: any = { username: "admin", password: "123456", desc: "默认用户"};
            user.password = sha256Encode(user.password);
            try {
                let saved = await User.save(user);
                let result = await User.findOne({ where: { username: user.username }}) as User;
                return jsonFormat(result);
            }
            catch(err) {
                return jsonFormat(null, { message: err.message });
            }
        }
        else {
            return jsonFormat(null, { message: "not support" });
        }
    }
}
```

`正式环境请删除 createAction 方法`

修改 `src/backend/controllers/index.ts` 导出`user-controller`，新增内容如下：

```ts
export * from "./user-controller";
```

### 添加认证功能

创建`src/backend/authentication/user-checker.ts`文件处理用户检测，内容如下：

```ts
import { Service } from "@malagu/core";
import { UserChecker, UsernameNotFoundError } from "@malagu/security/lib/node";

@Service({id: UserChecker, rebind: true})
export class UserCheckerImpl implements UserChecker {
    
    async check(user: any): Promise<void> {
        if (!user || !user.username) {
            throw new UsernameNotFoundError("User account not found");
        }
    }
}
```

创建`src/backend/authentication/password-encoder.ts`文件处理密码比较，内容如下：

```ts
import { Service } from "@malagu/core";
import { PasswordEncoder } from "@malagu/security/lib/node";
import { sha256Encode } from "../utils/crypto";

@Service({ id: PasswordEncoder, rebind: true })
export class PasswordEncoderImpl implements PasswordEncoder {
    async encode(content: string): Promise<string> {
        return sha256Encode(content);
    }

    async matches(content: string, encoded: string): Promise<boolean> {
        let encodedContent = await this.encode(content);
        return encodedContent === encoded;
    }
}
```

默认 [password-encoder](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/crypto/password/password-encoder.ts) 实现

创建`src/backend/authentication/authentication-success-handler.ts`文件登录成功时返回 token ，内容如下：

```typescript
import { Component, Autowired } from "@malagu/core";
import { Context } from "@malagu/web/lib/node";
import { AuthenticationSuccessHandler, Authentication } from "@malagu/security/lib/node";
import { JwtService } from "@malagu/jwt";
import { jsonFormat } from "../utils";

@Component({ id: AuthenticationSuccessHandler, rebind: true })
export class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {
    @Autowired(JwtService)
    jwtService: JwtService;

    async onAuthenticationSuccess(authentication: Authentication): Promise<void> {
        const response = Context.getResponse();
        let token = await this.jwtService.sign({ username: authentication.name });
        response.body = JSON.stringify(jsonFormat({ token }));
    }
}
```

默认 [authentication-success-handler](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/authentication/authentication-success-handler.ts) 实现

创建`src/backend/authentication/security-context-store.ts`处理 header 带 Token 的请求，内容如下：

```typescript
import { Autowired, Component, Value } from "@malagu/core";
import { User } from "@malagu/security";
import { SecurityContext, SecurityContextStore, SecurityContextStrategy, UserMapper, UserService } from "@malagu/security/lib/node";
import { Context } from "@malagu/web/lib/node";
import { JwtService } from "@malagu/jwt";

@Component({ id: SecurityContextStore, rebind: true })
export class SecurityContextStoreImpl implements SecurityContextStore {
    @Value("malagu.security")
    protected readonly options: any;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(SecurityContextStrategy)
    protected readonly securityContextStrategy: SecurityContextStrategy;
    
    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    @Autowired(JwtService)
    jwtService: JwtService;

    async load(): Promise<any> {
        const request = Context.getRequest();
        const token = (request.get("Token") || "").trim()
        const securityContext = await this.securityContextStrategy.create();
        if (token) {
            const userInfo: any = await this.jwtService.verify(token);
            const user = await this.userService.load(userInfo.username);
            if (user) {
                await this.userMapper.map(user);
                securityContext.authentication = {
                    name: user.username,
                    principal: user,
                    credentials: "",
                    policies: user.policies,
                    authenticated: true
                };
            }
            
        }
        return securityContext;
    }

    async save(context: SecurityContext): Promise<void> {
    }
}
```

创建 `src/backend/authentication/error-handler.ts` 添加认证错误处理，内容如下：

```ts
import { Autowired, Component, Value } from "@malagu/core";
import { Context, ErrorHandler, RedirectStrategy } from "@malagu/web/lib/node";
import { AUTHENTICATION_ERROR_HANDLER_PRIORITY, AuthenticationError, RequestCache } from "@malagu/security/lib/node";
import { jsonFormat } from "../utils";

@Component(ErrorHandler)
export class AuthenticationErrorHandler implements ErrorHandler {
    readonly priority: number = AUTHENTICATION_ERROR_HANDLER_PRIORITY + 100;

    @Value("malagu.security.basic.realm")
    protected realm: string;

    @Value("malagu.security.basic.enabled")
    protected readonly baseEnabled: boolean;

    @Value("malagu.security.loginPage")
    protected loginPage: string;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    canHandle(ctx: Context, err: Error): Promise<boolean> {
        let isAuthError = err instanceof AuthenticationError;
        return Promise.resolve(isAuthError);
    }
    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        await this.requestCache.save();
        ctx.response.end(JSON.stringify(jsonFormat(null, err)));
    }
}
```

默认 [AuthenticationErrorHandler](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/error/error-handler.ts) 实现

创建 `src/backend/authentication/index.ts` 引入认证文件，内容如下：

```ts
export * from "./password-encoder";
export * from "./user-checker";
export * from "./authentication-success-handler";
export * from "./security-context-store";
export * from "./error-handler";
```

修改 `src/backend/index.ts` 引入认证文件，内容如下：

```ts
import { autoBind } from "@malagu/core";
import "./controllers";
import { autoBindEntities } from "@malagu/typeorm";
import * as entities from "./entity";
import "./authentication";
import "./services/user-service";

autoBindEntities(entities);
export default autoBind();
```

修改`src/backend/controllers/post-controller.ts` 给 Create、Update、Delete 方法添加认证修饰器 Authenticated，内容如下：

```ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from "@malagu/mvc/lib/node";
import { Post as PostModel, Tag } from "../entity";
import { ResponseData } from "../../common";
import { jsonFormat } from '../utils';
import { Authenticated } from "@malagu/security/lib/node";

@Controller('api/post')
export class PostController {
    // 列表
    @Get()
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
            relations: ["category", "tags"]
        }) as PostModel;
        return jsonFormat(post);
    }
    // 创建
    @Post()
    @Authenticated()
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
    @Authenticated()
    async update(@Param("id") id: number, @Body("json") postData: string): Promise<any> {
        let saveData = JSON.parse(postData);
        try {
            let tagText = "";
            if (saveData.tags) {
                tagText = saveData.tags;
                delete saveData.tags;
            }
            let saved = await PostModel.update(id, saveData);
            let post: PostModel = await PostModel.findOne({ where: { id } }) as PostModel;
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
    @Authenticated()
    async delete(@Param("id") id: number): Promise<any> {
        try {
            let post: PostModel = await PostModel.findOne({ where: { id }}) as PostModel;
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

用同样的方法修改 `src/backend/controllers/category-controller.ts` 文件



### 命令行测试

```bash
# 创建用户
curl http://localhost:3000/api/user/create
# 请求认证url此时返回需要认证
curl -X DELETE http://localhost:3000/api/user
# 登录获取token
curl -H 'Content-Type: application/json' -X POST -d '{"username": "admin", "password": "123456"}' http://localhost:3000/login
# 此时返回 {"code":0,"data":{"token":"xxx"},"message":""}
curl http://localhost:3000/api/user -H "Token: xxxx"
# 此时返回用户信息
```
