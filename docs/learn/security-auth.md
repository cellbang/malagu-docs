---
title: 添加认证
description: 本篇通过使用Malagu框架的Security组件来演示用法
type: learn
lang: zh-CN
---

# 添加认证

本篇演示使用 Security 模块实现用户登录和退出功能，并在登录错误展示错误信息。

### 添加模块依赖

```bash
yarn add @malagu/security
```

### 添加认证逻辑

修改`src/backend/controllers/home-controller.ts`给 indexAction 方法配置鉴权，修改后文件内容如下：

```typescript
import { Controller, Get, Html } from "@malagu/mvc/lib/node";
import { Authenticated } from "@malagu/security/lib/node";

@Controller("")
export class HomeController {
    @Get("/")
    @Html("home/index.mustache")
    @Authenticated()
    indexAction() {
        return { name: "sam zhang" };
    }
}
```

说明：Authenticated 修饰器表示当前请求需要登录，否则会跳转到登录页面。运行项目并访问 http://localhost:3000 此时会跳转到登录页面 http://localhost:3000/login 。目前还没有登录页面倒显示 Not found ，我们来配置一下登录页。

创建`src/assets/views/home/login.mustache`文件展示登录表单，内容如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>login</title>
</head>
<body>
    <p>login</p>
    <form method="post">
        <div>
            <label for="">
                username:
                <input type="text" name="username" />
            </label>
        </div>
        <div>
            <label for="">
                password:
                <input type="password" name="password" />
            </label>
        </div>
        <div>
            <button type="submit">login</button>
        </div>
    </form>
</body>
</html>
```

修改`src/backend/controllers/home-controller.ts`添加 loginAction 方法展示登录逻辑，修改后文件内容如下：

```typescript
import { Controller, Get, Html } from "@malagu/mvc/lib/node";
import { Authenticated } from "@malagu/security/lib/node";

@Controller("")
export class HomeController {
    @Get("/")
    @Html("home/index.mustache")
    @Authenticated()
    indexAction() {
        return { name: "sam zhang" };
    }

    @Get("/login")
    @Html("home/login.mustache")
    loginAction() {
        return {};
    }
}
```

默认的登录页面地址，登录用户名和密码定义在 Security 组件的 [malagu.yml](https://github.com/cellbang/malagu/blob/main/packages/security/malagu.yml) 中。我们来配置默认的登录密码为`123456`。

修改`malagu.yml`配置默认密码，内容如下：

```yaml
malagu:
  security:
    password: ${ 'MzQ0NTg4ZTk2NzQyYWI1ODY0M2NjM2VjNWFkYjA0YzcwYWZiMzg3MTJhZjY5NGYw' | onTarget('backend')}
    logoutMethod: GET
```

完整`malagu.yml`内容如下：

```yaml
backend:
  modules:
    - src/backend/module

malagu:
  security:
    password: ${ 'MzQ0NTg4ZTk2NzQyYWI1ODY0M2NjM2VjNWFkYjA0YzcwYWZiMzg3MTJhZjY5NGYw' | onTarget('backend')}
    logoutMethod: GET
```

运行项目并访问 http://localhost:3000 ，会跳转到登录页面。输入用户名`admin`密码`123456`登录成功后跳转至首页。

#### 展示登录用户信息

修改`src/backend/controllers/home-controller.ts`文件中的 indexAction 方法，修改后内容如下：

```ts
import { Controller, Get, Html } from "@malagu/mvc/lib/node";
import { Authenticated, SecurityContext } from "@malagu/security/lib/node";

@Controller("")
export class HomeController {
    @Get("/")
    @Html("home/index.mustache")
    @Authenticated()
    indexAction() {
        const userInfo = SecurityContext.getAuthentication();
        return { name: userInfo.name };
    }

    @Get("/login")
    @Html("home/login.mustache")
    loginAction() {
        return {};
    }
}
```

说明：SecurityContext.getAuthentication() 方法可以获取当前登录的用户信息。

运行项目并访问 http://localhost:3000 会展示登录成功的用户名。

#### 添加退出登录功能

修改`src/assets/views/home/index.mustache`添加退出登录按钮，完整文件内容如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>index</title>
</head>
<body>
    <p>home#index</p>
    <p>你好：{{ name }}</p>
    <a href="/logout">退出登录</a>
</body>
</html>
```

运行项目并访问 http://localhost:3000 点击`退出登录`，会退出当前登录的用户跳转到登录页。

#### 启动项目验证功能

启动项目

```bash
yarn start
```

- 访问 http://localhost:3000 此时因为没有登录已经跳转至 http://localhost:3000/login
- 输入默认用户名`admin`默认密码`123456`点击 login 登录成功后跳转至首页
- 在首页可以看到登录成功的用户名
- 点击退出登录，可以退出当前用户的登录

### 添加错误处理

借助 Security 组件的能力我们实现了用户登录的功能，用户可以登录、退出。当输入错误的用户名或密码时，会重定向到登录页。为了给用户更好的体验，当登录失败时能够跳转到登录页面，并给用到户相应的提示。通过实现 Web 模块的 ErrorHandler 接口，我们可以实现自定义的错误处理逻辑。

创建`src/backend/authentication/error-handler.ts`文件处理鉴权错误，内容如下：

```typescript
import { Autowired, Component, Value } from "@malagu/core";
import { HttpHeaders, XML_HTTP_REQUEST, HttpStatus } from "@malagu/web";
import { Context, ErrorHandler, RedirectStrategy } from "@malagu/web/lib/node";
import { AUTHENTICATION_ERROR_HANDLER_PRIORITY, AuthenticationError, RequestCache } from "@malagu/security/lib/node";

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
        let isUnAutherized = err.message === "Unauthorized";
        return Promise.resolve(isAuthError && !isUnAutherized);
    }

    async handle(ctx: Context, err: AuthenticationError): Promise<void> {
        if (ctx.request.get(HttpHeaders.X_REQUESTED_WITH) !== XML_HTTP_REQUEST && !this.baseEnabled) {
            await this.requestCache.save();
            let username = ctx.request.body["username"];
            await this.redirectStrategy.send(this.loginPage+
                "?username="+encodeURIComponent(username)+
                "&err="+encodeURIComponent(err.message)
            );
            ctx.response.end(err.message);
        } else {
            if (this.baseEnabled) {
                ctx.response.setHeader(HttpHeaders.WWW_AUTHENTICATE, `Basic realm="${this.realm}"`);
            }
            ctx.response.statusCode = HttpStatus.UNAUTHORIZED;
            ctx.response.end(err.message);
        }
    }
}
```

默认 [AuthenticationErrorHandler](https://github.com/cellbang/malagu/blob/main/packages/security/src/node/error/error-handler.ts) 实现


编辑`src/backend/controllers/home-controller.ts`文件修改 loginAction 方法将错误信息返回到模板文件，内容如下：

```typescript
import { Controller, Get, Query, Html } from "@malagu/mvc/lib/node";
import { Authenticated, SecurityContext } from "@malagu/security/lib/node";

@Controller("")
export class HomeController {
    @Get("/")
    @Html("home/index.mustache")
    @Authenticated()
    indexAction() {
        const userInfo = SecurityContext.getAuthentication();
        return { name: userInfo.name };
    }

    @Get("/login")
    @Html("home/login.mustache")
    loginAction(@Query('username') username: string = "", @Query("err") err: string = "") {
        console.log(err);
        return { username, err };
    }
}
```

修改`src/assets/views/home/login.mustache`文件展示错误信息，内容如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>login</title>
</head>
<body>
    <p>login</p>
    <form method="post">
        <div>
            <label for="">
                username:
                <input type="text" name="username" value="{{username}}" />
            </label>
        </div>
        <div>
            <label for="">
                password:
                <input type="password" name="password" />
            </label>
        </div>
        <div style="color: red;">{{ err }}</div>
        <div>
            <button type="submit">login</button>
        </div>
    </form>
</body>
</html>
```

修改`src/backend/module.ts`文件，引入定义的 error-handler.ts，内容如下：

```typescript
import { autoBind } from "@malagu/core";
import "./controllers/home-controller";
import "./authentication/error-handler";

export default autoBind();
```

启动项目并访问，尝试输入错误的用户名或密码，会跳转到登录页面并显示相关错误信息
