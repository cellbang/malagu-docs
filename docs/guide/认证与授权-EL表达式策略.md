---
title: EL 表达式策略
order: 15
toc: menu
---

# EL 表达式策略

Cell 框架提供给了一个默认策略：EL 表达式策略，当 EL 表达式计算结果为 true，表示允许，否则表示拒绝。用户可以在方法上通过相关的权限装饰器配置策略，也可以通过组件属性配置策略。

## 定义

```typescript
export interface Policy {
    type: PolicyType
    authorizeType: AuthorizeType;
}


export interface ElPolicy extends Policy {
    context: any;
    el: string;
}
```


## 权限装饰器

为了用户方便地配置 EL 表达式策略，框架提供了一些列权限装饰器 `@Authorize` 、 `@PreAuthorize` 、 `@PostAuthorize` 、 `@Anonymous` 和 `@Authenticated` 。

其中，`@PreAuthorize` 、 `@PostAuthorize`、 `@Anonymous` 和 `@Authenticated`是对 `@Authorize` 的扩展。

## @Authorize

装饰器的配置属性：

```typescript
export interface AuthorizeOption {
    el: string;
    authorizeType: AuthorizeType; // 授权类型包括前置授权和后置授权
}
```
## 
## @PreAuthorize

扩展 `@Authorize` 装饰器，等价于将 `@Authorize` 的 `authorizeType` 属性固定为前置授权。具体实现如下：

```typescript
export const PreAuthorize = function (el: string) {
    return Authorize({ el, authorizeType: AuthorizeType.Pre });
};
```

## @PostAuthorize

扩展 `@Authorize` 装饰器，等价于将 `@Authorize` 的 `authorizeType` 属性固定为后置授权。具体实现如下：

```typescript
export const PostAuthorize = function (el: string) {
    return Authorize({ el, authorizeType: AuthorizeType.Post });
};
```


## @Anonymous

扩展 `@Authorize` 装饰器，等价于将 `@Authorize` 的 `el` 属性固定为 `true` 和 `authorizeType` 属性固定为前置授权 。具体实现如下：

```typescript
export const Anonymous = function (): any {
    return Authorize({ el: 'true', authorizeType: AuthorizeType.Pre });
};
```


## @Authenticated

扩展 `@Authorize` 装饰器，等价于将 `@Authorize` 的 `el` 属性固定为 `authenticated`  和 `authorizeType` 属性固定为前置授权 。具体实现如下：

```typescript
export const Authenticated = function () {
    return Authorize({ el: 'authenticated', authorizeType: AuthorizeType.Pre });
};
```

其中，`authenticated` 是内置的 EL 上下文变量，当为 true 时，表示当前登录用户认证通过；当为 false 时，表认证失败。

## EL 表达式上下文

我们往往需要一些变量或者方法参与到 EL 表达式的计算中，框架通过 EL 表达式上下文来提供这些变量或者方法，默认提供的 EL 表达式上下文如下：

```typescript
export interface ElContext {
		authorizeType: AuthorizeType
    method: string;
    args: any[];
    target: any;
    returnValue?: any;
    policies: Policy[];
    credentials: any;
    details?: any;
    principal: any;
    authenticated: boolean;
}
```

## 扩展 EL 表达式上下文

框架提供了一个扩展接口 `SecurityExpressionContextHandler` 用于扩展 EL 表达式上下文。

### 定义

```typescript
export interface SecurityExpressionContextHandler {
    handle(context: any): Promise<void>
}
```

### 实现

```typescript
@Component(SecurityExpressionContextHandler)
export class SecurityExpressionContextHandlerImpl implements SecurityExpressionContextHandler {
    handle(context: any): Promise<void> {
    		context.foo = 'bar';
      	context.hasRole = () => { ... };
    }
}
```

