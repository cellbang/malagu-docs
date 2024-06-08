---
title: 添加jwt支持
description: 本篇通过使用Malagu框架的Security组件来演示用法
type: learn
lang: zh-CN
---

# 添加jwt支持

### 安装依赖

```bash
yarn add jsonwebtoken
yarn add --dev @types/jsonwebtoken
```

### 工具函数

创建`src/backend/utils/ajax.ts`文件通过 http header 判断请求是否为 ajax 请求，内容如下：

```ts
export const isAjax = (headers: any) => {
    let content = headers['x-requested-with'] || '';
    return content.toUpperCase() === 'XMLHTTPREQUEST';
}
```

创建`src/backend/authentication/token-utils.ts`文件处理jwt签名，内容如下：

```typescript
import { Service } from "@malagu/core";
import * as JWT from "jsonwebtoken";

const tokenExpireTime = 1800; // 30分钟
const privateKey = "privateKey"; // json-web-token的密钥，不能泄露

@Service()
export class TokenUtils {
    async getToken(username: string) {
        return JWT.sign(
            { username }, privateKey,
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

        if (decoded.username) {
            return {
                username: decoded.username
            };
        }
        throw new Error("TokenNotMatch");
    }
}
```

### 登录和认证

创建`src/backend/authentication/authentication-success-handler.ts`文件，登录成功时返回`token`，内容如下：

```typescript
import { Component, Autowired } from "@malagu/core";
import { Context } from "@malagu/web/lib/node";
import { AuthenticationSuccessHandler, Authentication } from "@malagu/security/lib/node";
import { TokenUtils } from "./token-utils";

@Component({ id: AuthenticationSuccessHandler, rebind: true })
export class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {
    @Autowired()
    tokenUtils: TokenUtils;

    async onAuthenticationSuccess(authentication: Authentication): Promise<void> {
        const response = Context.getResponse();
        let token = await this.tokenUtils.getToken(authentication.name);
        response.body = JSON.stringify({ token });
    }
}
```

默认 [authentication-success-handler](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/authentication/authentication-success-handler.ts) 实现

创建`src/backend/authentication/security-context-store.ts`处理`header`带`Token`的请求，内容如下：

```typescript
import { Autowired, Component, Value } from "@malagu/core";
import { User } from "@malagu/security";
import { SecurityContext, SecurityContextImpl, SecurityContextStore, SecurityContextStrategy, UserMapper, UserService } from "@malagu/security/lib/node";
import { Context } from '@malagu/web/lib/node';
import { TokenUtils } from "./token-utils";

@Component({ id: SecurityContextStore, rebind: true })
export class SecurityContextStoreImpl implements SecurityContextStore {
    @Value("malagu.security")
    protected readonly options: any;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired()
    tokenUtils: TokenUtils;

    @Autowired(SecurityContextStrategy)
    protected readonly securityContextStrategy: SecurityContextStrategy;
    
    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    async load(): Promise<SecurityContext> {
        const request = Context.getRequest();

        const token = (request.get("Token") || "").trim()
        if (token) {
            const userInfo = await this.tokenUtils.verifyToken(token);
            const user = await this.userService.load(userInfo.username);
            const securityContext = new SecurityContextImpl();
            securityContext.authentication = {
                name: user.username,
                principal: this.userMapper.map(user),
                credentials: '',
                policies: user.policies,
                authenticated: true
            };
            return securityContext;
        }
        else {
            return this.securityContextStrategy.create();
        }

    }
    async save(context: SecurityContext): Promise<void> {
    }
}
```

默认 [security-context-store](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/context/security-context-store.ts) 实现



修改`src/backend/controllers/home-controller.ts`文件，添加 userAction 方法返回用户信息，内容如下：

```ts
import { Controller, Get, Query, Html } from "@malagu/mvc/lib/node";
import { Authenticated, SecurityContext } from "@malagu/security/lib/node";
import { User } from "../entity/user";
import { sha256Encode } from "../utils/crypto";
import { Value } from "@malagu/core";

@Controller("")
export class HomeController {
    @Value("mode")
    mode: string;

    @Get("/")
    @Html("home/index.mustache")
    @Authenticated()
    indexAction() {
        const userInfo = SecurityContext.getAuthentication();
        return { name: userInfo.name };
    }

    @Get("/user")
    @Authenticated()
    userAction() {
        const userInfo = SecurityContext.getAuthentication();
        return { name: userInfo.name };
    }

    @Get("/login")
    @Html("home/login.mustache")
    loginAction(@Query('username') username: string = "", @Query("err") err: string = "") {
        console.log(err);
        return { username, err };
    }

    @Get("/create")    
    async createAction() {
        if (this.mode && this.mode.indexOf('local') > -1) {
            let user: any = { username: "admin", password: "123456", desc: "默认用户"};
            user.password = sha256Encode(user.password);
            try {
                let saved = await User.save(user);
                let result = await User.findOne({ where: { username: user.username }}) as User;
                return result;
            }
            catch(err) {
                return { message: err.message };
            }
        }
        else {
            return { message: "not support" };
        }
    }
}
```

修改`src/backend/module.ts`引入 security-context-store 文件，内容如下：

```typescript
import { autoBind } from "@malagu/core";
import { autoBindEntities } from "@malagu/typeorm";
import "./controllers/home-controller";
import "./authentication/error-handler";
import "./authentication/user-checker";
import "./authentication/password-encoder";
import "./services/user-service";
import * as entities from "./entity/user";
import "./authentication/authentication-success-handler";
import "./authentication/security-context-store";

autoBindEntities(entities);
export default autoBind();
```

### 运行并验证

启动项目，使用`curl`命令验证

```bash
curl -H 'Content-Type: application/json' -X POST -d '{"username": "admin", "password": "123456"}' http://localhost:3000/login
# 此时返回 { "token": "xxxx" }
curl http://localhost:3000/user -H "Token: xxxx"
# 此时返回用户信息
```
