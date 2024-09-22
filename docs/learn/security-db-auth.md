---
title: 连接数据库
description: 本篇通过使用Cell框架的Security组件来演示用法
type: learn
lang: zh-CN
---

# 连接数据库

### 配置数据库

添加 Npm 组件

```bash
yarn add crypto-js @celljs/typeorm
yarn add --dev @types/crypto-js
```

修改`cell.yml`添加数据库配置，内容如下：

```yaml
backend: 
  cell:
    typeorm:
      ormConfig:
        - type: mysql
          host: <db_host>
          port: 3306
          synchronize: true
          username: <db_user>
          password: "<db_pass>"
          database: security-demo
          logging: true
```

* 将db_host、db_user、db_pass进行相应替换。

完整`cell.yml`内容如下：

```yaml
backend:
  modules:
    - src/backend/module
  cell:
    typeorm:
      ormConfig:
        - type: mysql
          host: <db_host>
          port: 3306
          synchronize: true
          username: <db_user>
          password: "<db_pass>"
          database: security-demo
          logging: true

cell:
  security:
    password: ${ 'MzQ0NTg4ZTk2NzQyYWI1ODY0M2NjM2VjNWFkYjA0YzcwYWZiMzg3MTJhZjY5NGYw' | onTarget('backend')}
    logoutMethod: GET
```

#### 创建数据库

使用工具或命令行创建数据库，示例中数据库名为 security-demo，名称和上面 cell.yaml 中的 datebase 字段对应即可。typeorm 会根据 entity 自动建表修改字段，不需要手动建表。

### 添加用户模型实体

创建`src/backend/entity/user.ts`文件定义用户表实体，内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, Unique } from "typeorm";

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

### 添加用户认证文件

创建`src/backend/services/user-service.ts`文件处理用户加载，内容如下：

```ts
import { Service } from "@celljs/core";
import { UserService } from "@celljs/security/lib/node";
import { User } from "../entity/user";

@Service({ id: UserService, rebind: true })
export class UserServiceImpl implements UserService<string, any> {
    async load(username: string): Promise<any> {
        let user = await User.findOne({ where: { username: username } });
        return user;
    }
}
```

默认 [user-service](https://github.com/cellbang/cell/blob/main/packages/security/src/node/user/user-service.ts) 实现

创建`src/backend/authentication/user-checker.ts`文件处理用户检测，内容如下：

```ts
import { Service } from "@celljs/core";
import { UserChecker, UsernameNotFoundError } from "@celljs/security/lib/node";

@Service({id: UserChecker, rebind: true})
export class UserCheckerImpl implements UserChecker {
    
    async check(user: any): Promise<void> {
        if (!user || !user.username) {
            throw new UsernameNotFoundError("User account not found");
        }
    }
}
```

默认 [user-checker](https://github.com/cellbang/cell/blob/main/packages/security/src/node/user/user-checker.ts) 实现

创建`src/backend/utils/crypto.ts`文件处理密码加密，内容如下：

```ts
import * as SHA256 from "crypto-js/sha256";

export function sha256Encode(content: string) {
    return SHA256(content).toString();
}
```

创建`src/backend/authentication/password-encoder.ts`文件处理密码比较，内容如下：

```ts
import { Service } from "@celljs/core";
import { PasswordEncoder } from "@celljs/security/lib/node";
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

默认 [password-encoder](https://github.com/cellbang/cell/blob/main/packages/security/src/node/crypto/password/password-encoder.ts) 实现

因为我们刚刚创建数据库，数据库中还没有用户

修改`src/backend/controllers/home-controller.ts`添加 createAction 方法创建默认用户，内容如下：

```ts
import { Controller, Get, Query, Html } from "@celljs/mvc/lib/node";
import { Authenticated, SecurityContext } from "@celljs/security/lib/node";
import { User } from "../entity/user";
import { sha256Encode } from "../utils/crypto";
import { Value } from "@celljs/core";

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

`正式环境请删除 createAction 方法`

修改`src/module.ts`引入上述文件，最终代码如下：
```ts
import { autoBind } from "@celljs/core";
import { autoBindEntities } from "@celljs/typeorm";
import "./controllers/home-controller";
import "./authentication/error-handler";
import "./authentication/user-checker";
import "./authentication/password-encoder";
import "./services/user-service";
import * as entities from "./entity/user";

autoBindEntities(entities);
export default autoBind();
```

运行项目，访问 http://localhost:3000/create 此时刷新数据库会看到刚刚创建的 admin 用户。访问项目 http://localhost:3000/ 输入用户名、密码并点击登录，此时会跳转到首页并显示用户信息，说明用户认证成功。
