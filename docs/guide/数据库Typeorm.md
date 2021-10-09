---
title: Typeorm
order: 14
toc: menu
---

# Typeorm

Malagu 框架可以很方便集成第三方数据库操作相关的框架，比如 [Sequelize](https://sequelize.org/)、[Typeorm](https://typeorm.io/#/) 等等。基于 Malagu 的组件机制，让第三库扩展性更强，且支持属性配置，开箱即用。目前，框架提供了对 Typeorm 库的集成，让我们可以通过框架配置文件，配置数据库链接相关信息。另外，Malagu 框架是 Serverless First，框架在集成 Typeorm 的时候，对 **Serverless 场景做了最佳实践适配**。并且也**借鉴了 Spring 事务管理机制**，提供了**无侵入式的事务管理**，且支持事务的传播行为。

## 使用方法


框架提供了一个内置模板 `database-app` ，使用命令 `malagu init demo database-app` 可以快速初始化一个有关数据库操作的模板应用。初始化完成后，只需要把数据库链接配置改成我们自己的就好了。当然，我们也可以在项目里面直接安装 `@malagu/typeorm` 组件：


```bash
yarn add @malagu/typeorm # 或者 npm i @malagu/typeorm
```


## 配置数据源链接


在 Malagu 中，数据源链接配置与 Typeorm 几乎是一样的，只是配置的形式和位置不一样而已。框架为了让第三库的配置方式与框架组件的配置方式保持统一，框架在集成 Typeorm 的时候，将 Typeorm 的原有配置方式适配成了框架组件的配置方式。更多 Typeorm 数据源链接配置说明，请查看 [Typeorm 官方文档](https://typeorm.io/#/connection-options)。


#### 单数据源


数据源链接名称如果没有设置的话，默认是 `default` 。


```yaml
# malagu.yml
backend: 
  malagu:
    typeorm:
      ormConfig:
        - type: mysql
          host: localhost
          port: 3306
          synchronize: true
          username: root
          password: root
          database: test
```


#### 多数据源


为了区分不同的数据源链接，需要给数据源链接设置名称，有且只有一个可以不设置名称，且该链接默认名称为 `default` 。在使用 OrmContext 相关的 API 的时候，数据源链接的名称会用到。


```yaml
# malagu.yml
backend: 
  malagu:
    typeorm:
      ormConfig:
        - type: mysql
          host: localhost
          port: 3306
          synchronize: true
          username: root
          password: root
          database: test
        - type: mysql
        	name: 'datasource2'
          host: xxxx
          port: 3306
          synchronize: true
          username: root
          password: root
          database: test
        - type: mongodb
          name: 'mongo'
          host: localhost
          port: 27017
          database: test
```


## 数据库操作


以下示例使用 rest 风格来实现 API，当然我们也可以使用 RPC 风格来实现，没有什么区别。


```typescript
import { Controller, Get, Param, Delete, Put, Post, Body } from '@malagu/mvc/lib/node';
import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { User } from './entity';
import { Order } from './mongo_entity';

@Controller('users')
export class UserController {
    
    @Get()
    @Transactional({ readOnly: true })
    list(): Promise<User[]> {
        const repo = OrmContext.getRepository(User);
        return repo.find();
    }

    @Get(':id')
    @Transactional({ readOnly: true })
    get(@Param('id') id: number): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);
        return repo.findOne(id);
    }

    @Delete(':id')
    @Transactional()
    async reomve(@Param('id') id: number): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.delete(id);
    }

    @Put()
    @Transactional()
    async modify(@Body() user: User): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.update(user.id, user);
    }
		
  	//操作非默认数据源需要指定数据源的name
  	//操作mongodb示例
  	@Post('/order')
    @Transactional({ readOnly: true,  name: 'mongo' })
    create(@Body() order: Order): Promise<Order> {
      const repo = OrmContext.getMongoRepository(Order,'mongo');
      return repo.save(order);
    }
  
    @Post()
    @Transactional()
    create(@Body() user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        return repo.save(user);
    }
    
}
```


## 数据库上下文


在 Malagu 框架中，Typeorm 的事务托管给框架管理。框架提供了一个装饰器 `@Transactional` ，用于框架在执行方法前后如何开启、传播、提交和回滚事务。然后，框架把托管的 `Entitymanager` 对象放到数据库上下文中，方便我们在业务代码中使用。当然，我们也可以手动管理数据库事务和创建 `EntityManager` 对象。


数据库上下文是基于请求上下文实现，所以数据库上下文也是请求级别的。在数据库上下文中主要提供了获取 `EntityManager` 和 `Repository` 对象相关的方法：


```typescript
export namespace OrmContext {

    export function getEntityManager(name = DEFAULT_CONNECTION_NAME): EntityManager {
        ...
    }

    export function getRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): Repository<Entity>  {
		    ...
    }

    export function getTreeRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): TreeRepository<Entity>  {
			  ...
    }

    export function getMongoRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): MongoRepository<Entity>  {
        ...
    }

    export function getCustomRepository<T>(customRepository: ObjectType<T>, name?: string): T {
        ...
    }

    export function pushEntityManager(name: string, entityManager: EntityManager): void {
        ...
    }

    export function popEntityManager(name: string): EntityManager | undefined {
        ...
    }

}

```


## 事务管理


Malagu 框架提供了一个装饰器 `@Transactional` ，以声明的方式定义事务的行为，Malagu 框架根据装饰器声明决定事务的开启、传播、提交和回滚行为。


#### `@Transactional` 


本装饰器可以是加在类和方法上，如果类和方法同时加了该装饰器，最终的配置是拿方法的配置去合并类上的，且方法的配置优先级高于类上。装饰器配置选项：


```typescript
export interface TransactionalOption {
    name?: string;              // 多数据源链接情况下，指定数据源链接名称，默认为 default
    isolation?: IsolationLevel; // 数据库隔离级别
    propagation?: Propagation;  // 事务的传播行为，支持 Required 和 RequiresNew，默认为 Required
    readOnly?: boolean;         // 只读，不开启事务，默认为开启事务
}
```


示例：


```typescript
@Put()
@Transactional()
async modify(@Body() user: User): Promise<void> {
  const repo = OrmContext.getRepository(User);
	await repo.update(user.id, user);
}
```




#### @Transactional 与 OrmContext


Malagu 框架根据装饰器的配置，在方法调用前开启事务（也可能不开启），然后把 EntityManager 托管在 OrmContext 上下文中，通过  OrmContext 取到框架帮我们开启过事务的 EntityManager，其中 Repository 也是通过托管的 EntityManager 创建的。为了正确的取到 EntityManager，请确保装饰器配置的名称与 通过 OrmContext 要获取的 EntityMananger 名称保持一致，不指定名称，则默认为 `default` 。

方法执行完后，框架根据方法的执行情况，自动决定事务是提交还是回滚，方法执行出现异常则回滚事务，否则提交事务。

当方法存在嵌套调用带 `@Transactional` 装饰器的方法，由事务传播行为的配置决定是复用上层方法的事务，还是重新开启新的事务。


#### 数据库查询


数据库查询大部分情况不需要开启事务，但是我们也最好在方式加上 `@Transactional` 装饰器，然后把 readonly 配置为 true，让框架为我们创建一个不开启事务的 EntityManager，保持代码风格统一：


```typescript
@Get()
@Transactional({ readOnly: true })
list(): Promise<User[]> {
  const repo = OrmContext.getRepository(User);
	return repo.find();
}
```




#### 事务传播行为


事务传播行为决定事务在需要事务的不同方法之间事务是如何传播的，目前支持两种事务传播行为：


```typescript
export enum Propagation {
    Required, RequiresNew
}
```


**说明：**

- `Required` 需要开启一个事务，如果上一层方法已经开启过事务，则复用上一个事务，否则开启一个新事务
- `RequiresNew` 不管上一层方法有没有开启过事务，都开启一个新事物



**注意：事务在不同的方法传播的时候，请保证方法之间是同步调用的。如下：**

```typescript
...
@Transactional()
async foo(): Promise<void> {
  ...
  await bar();  // 必须加上 await
}
....

...
@Transactional()
async bar(): Promise<void> {
  ...
}
....


```


## 绑定实体类


框架提供了一个方法 `autoBindEntities` 用于绑定实体类，该方法一般在我们的模块入口文件里面调用。该方法包含两个参数：

- `entities` 是您定义的实体类
- `name` 是您希望实体类与哪个数据源连接绑定，默认与 `default` 绑定



```typescript
export function autoBindEntities(entities: any, name = DEFAULT_CONNECTION_NAME) {
    ...
}
```


示例：


```typescript
import { autoBindEntities } from '@malagu/typeorm';
import * as entities from './entity';
import * as mongo_entities from './mongo_entity';
import { autoBind } from '@malagu/core';

autoBindEntities(entities);
autoBindEntities(mongo_entities,'mongo'); // 多数据源链接情况下，需要指定数据源链接名称
export default autoBind();
```


## 工具类



| **工具** | **描述** |
| --- | --- |
| DEFAULT_CONNECTION_NAME | 默认数据库连接名称 default |
| autoBindEntities | 绑定实体类,非默认数据源时需要指定数据源的name |





