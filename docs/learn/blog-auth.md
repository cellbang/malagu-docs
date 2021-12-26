---
title: 添加认证
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
yarn add --dev @types/crypto-js
```

### 添加token和加密工具函数

token工具类 `src/backend/token-utils.ts`

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
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new Error('TokenExpired');
      }
      throw new Error('TokenError');
    }

    if (decoded.uid) {
      return {
        uid: decoded.uid,
        user_name: decoded.user_name
      };
    }
    throw new Error('TokenNotMatch');
  }
}
```

密码加密函数 `src/backend/utils/crypto.ts`

```ts
import * as SHA256 from "crypto-js/sha256";

export function sha256Encode(content: string) {
    return SHA256(content).toString();
}
```

### 添加认证功能实现

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
        let headerToken = request.get("Token")?.trim();
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
        let whiteUrl = {
            "/api/post": ["POST", "PATCH", "DELETE"]
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

导出相工具和认证类 `src/backend/auth/index.ts`

```ts
export * from "./token-utils";
export * from "./auth-provider";
```

### 添加用户登录发放token

添加 `src/backend/controllers/user-controller.ts`

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
    @Body("password") password: string): Promise<ResponseData<any>> {
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

因为没有注册功能，我们直接写一个方法创建一个类认用户，在`user-controller.ts`中添加如下代码:

```ts
  @Get("create")
  @Json()
  async create(): Promise<ResponseData<User>> {
    let user: any = { username: "admin", password: "123456", desc: "默认用户"};
    user.password = sha256Encode(user.password);
    let saved = await User.save(user);
    let result = await User.findOne({ where: { username: user.username }});
    return jsonFormat(result);
  }
```

注意，创建用户后请注释掉这个方法

修改 `src/backend/controllers/index.ts` 导出`user-controller`

```ts
export * from "./user-controller";
```

用户登录后会返回 id、token、username 等字段，请求需要授权的接口，在header中添带上token即可

这里为了测试，我们将 '/api/post/1' 加到认证列表中

命令行测试

```bash
# 登录获取token
curl -X POST -d "username=admin&password=123456" http://localhost:3000/api/user/login
curl -H curl -H 'token: <token>' http://localhost:3000/api/post/1
```