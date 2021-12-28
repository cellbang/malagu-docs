---
title: 登录认证
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 添加认证

### 功能说明

示例设计的是一个单用户blog系统，所以只要用户登录成功token可以效验即允许用户操作。使用@malagu/security、jsonwebtoken、crypto-js等库。

### 添加依赖

```bash
yarn add @malagu/security jsonwebtoken crypto-js
yarn add --dev @types/crypto-js @types/jsonwebtoken
```

修改 `src/malagu-local.yml` 添加如下内容：

```yml
backend:
  malagu:
    # 新增内容
    logger:
      level: debug

    security:
      enabled: false
```

打开日志，禁用掉security默认的认证策略

### 添加token和加密工具函数

创建token工具类 `src/backend/auth/token-utils.ts` 内容如下：

```ts
import { Service } from "@malagu/core";
import * as JWT from "jsonwebtoken";

const tokenExpireTime = 1800; // 30分钟
const privateKey = "privateKey"; // json-web-token的密钥，不能泄露

@Service()
export class TokenUtils {
  async getToken(uid: number, username: string) {
    return JWT.sign(
      { uid, username }, privateKey,
      { expiresIn: tokenExpireTime }
    );
  }

  async verifyToken(token: string) {
    let decoded: any = {};
    try {
      decoded = JWT.verify(token, privateKey);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new Error("TokenExpired");
      }
      throw new Error("TokenError");
    }

    if (decoded.uid) {
      return {
        uid: decoded.uid,
        user_name: decoded.user_name
      };
    }
    throw new Error("TokenNotMatch");
  }
}
```

创建加密工具函数 `src/backend/utils/crypto.ts` 内容如下：

```ts
import * as SHA256 from "crypto-js/sha256";

export function sha256Encode(content: string) {
    return SHA256(content).toString();
}
```

### 添加认证实现

认证提供者 `src/backend/auth/auth-provider.ts`

```ts
import { Autowired, Component, Logger } from "@malagu/core";
import { Context } from "@malagu/web/lib/node";
import { AuthenticationProvider, BASE_AUTHENTICATION_PROVIDER_PRIORITY, Authentication } from "@malagu/security/lib/node";
import { TokenUtils } from "./token-utils";
import { jsonFormat } from "../utils";

interface AuthInfo extends Authentication {
    uid: number;
    name: string;
}

@Component(AuthenticationProvider)
export class CustomAuthenticationProviderImpl implements AuthenticationProvider {
    priority:number = BASE_AUTHENTICATION_PROVIDER_PRIORITY+10;

    @Autowired()
    tokenUtils: TokenUtils;

    @Autowired(Logger)
    logger: Logger;

    responseNoAuth(statusCode: number = 401, message = "no auth") {
        const res = Context.getResponse();
        res.statusCode = statusCode;
        let result = jsonFormat(null, message);
        res.body = JSON.stringify(result);
    }

    async authenticate(): Promise<AuthInfo> {
        this.logger.debug("----------------------------------------");
        this.logger.error("authenticate");
        this.logger.debug("----------------------------------------");
        const request = Context.getRequest();
        let headerToken = request.get("Token") || "";
        if (headerToken) {
          headerToken = headerToken.trim();
        }
        if (!headerToken) {
            this.responseNoAuth(401, "no auth");
        }
        try {
            const tokenResult = await this.tokenUtils.verifyToken(headerToken);
            return {
                uid: tokenResult.uid,
                name: tokenResult.user_name,
                policies: [],
                credentials: null,
                principal: null,
                authenticated: true,
                next: true,
            };
        } catch (error) {
            this.responseNoAuth(403, "auth failure");
        }
        return {
            uid: -1,
            name: "",
            policies: [],
            credentials: null,
            principal: null,
            authenticated: false,
            next: false,
        };
    }

    async support(): Promise<boolean> {
        this.logger.debug("----------------------------------------");
        this.logger.debug("support called");
        const request = Context.getRequest();
        let { url, method } = request;
        let whiteUrl: any = {
            "/api/post": ["GET", "POST", "PATCH", "DELETE"]
        }
        // request.url
        // let token = request.get("Token");
        // this.logger.debug(`token: ${token}`);
        this.logger.debug("----------------------------------------");
        // if (!token) {
        //     return false;
        // }
        if (whiteUrl[url] && whiteUrl[url].indexOf(method) > -1) {
            return true;
        }
        return false;
    }
}
```

* 在support中拦截要认证的url和请求方法。

创建 `src/backend/auth/index.ts` 导出工具和认证类，内容如下：

```ts
export * from "./token-utils";
export * from "./auth-provider";
```

修改 `src/backend/module.ts` 导出认证模块，修改后内容如下：

```ts
import { autoBind } from "@malagu/core";
import "./controllers";
import "./auth";
import { autoBindEntities } from "@malagu/typeorm";
import * as entities from "./entity";

autoBindEntities(entities);
export default autoBind();
```

### 添加用户登录和token生成

创建用户模型 `src/backend/entity/user.ts` 内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";

@Entity({ name: "users" })
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

修改 `src/backend/entity/index.ts` 导出模型，添加内容如下:

```ts
export * from "./user";
```

创建用户controller `src/backend/controllers/user-controller.ts` 内容如下：

```ts
import { Autowired } from "@malagu/core";
import { Controller, Post, Json, Body, Get } from "@malagu/mvc/lib/node";
import { TokenUtils } from "../auth";
import { User } from "../entity";
import { ResponseData } from "../../common";
import { jsonFormat } from "../utils";
import { sha256Encode } from "../utils/crypto";

@Controller('api/user')
export class UserController {
    @Autowired()
    tokenUtils: TokenUtils;

    @Post("login")
    @Json()
    async login(
        @Body("username") username: string,
        @Body("password") password: string
    ): Promise<ResponseData<any>> {
        if (username && password) {
            let passwordHash = sha256Encode(password);
            // let passwordHash = password; 
            let user = await User.findOne({ where: {
                username, password: passwordHash
            } });
            if (user) {
                let token = await this.tokenUtils.getToken(user.id, user.username);
                return jsonFormat({ token, id: user.id, username: user.username, desc: user.desc });
            }
            return jsonFormat(null, "用户名或密码不正确");
        }
        return jsonFormat(null, "请输入用户名和密码登录")
    }
}
```

因为没有注册功能，我们直接写一个方法创建一个用户，在`user-controller.ts`中添加如下代码:

```ts
    @Get("create")
    @Json()
    async create(): Promise<ResponseData<User>> {
        let user: any = { username: "admin", password: "123456", desc: "默认用户"};
        user.password = sha256Encode(user.password);
        let saved = await User.save(user);
        let result = await User.findOne({ where: { username: user.username }}) as User;
        return jsonFormat(result);
    }
```

注意，创建用户后请注释掉这个方法

修改 `src/backend/controllers/index.ts` 导出`user-controller`

```ts
export * from "./user-controller";
```

用户登录后会返回 id、token、username 等字段，请求需要授权的接口，在header中添带上token即可

### 命令行测试

我们刚刚已经在 `src/backend/auth/auth-provider.ts` 拦截了 `/api/blog`，此处用这个地址来测试：

```bash
# 请求认证url
curl http://localhost:3000/api/post
# 创建用户
curl http://localhost:3000/api/user/create
# 登录获取token
curl -X POST -d "username=admin&password=123456" http://localhost:3000/api/user/login
curl -H 'token: <token>' http://localhost:3000/api/post
```
