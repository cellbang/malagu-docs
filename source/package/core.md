---
title: '@malagu/core'
description: '@malagu/core是malagu框架的核心包，提供IOC、AOP、Appliction、Logger、Error等抽象定义和实现以及相关工具方法。'
type: package
lang: zh-CN
---

### Application

Application是Malagu应用的入口，以 [common/application-entry.ts](https://github.com/cellbang/malagu/blob/master/packages/core/src/common/application/application-entry.ts) 为例：

```typescript
import { container } from '../container/dynamic-container';
import { Application } from './application-protocol';
import { ContainerProvider } from '../container';
container.then(c => {
    ContainerProvider.set(c);
    const application = c.get<Application>(Application);
    application.start().catch(reason => {
        console.error(`Failed to start the ${application.constructor.name}.`);
        if (reason) {
            console.error(reason);
        }
    });
});
```

`const application = c.get<Application>(Application)`获取Application的实例，并调用`start`方法来启动应用。`Application`在core中的前后端实现如下：

- 前端 [browser/application/frontend-application.ts](https://github.com/cellbang/malagu/blob/master/packages/core/src/browser/application/frontend-application.ts)

- 后端 [node/application/backend-application.ts](https://github.com/cellbang/malagu/blob/master/packages/core/src/node/application/backend-application.ts)

先来看前端`Application`的`start`方法

```typescript
async start(): Promise<void> {
    await this.doStart();
    this.stateService.state = 'started';

    const host = await this.getHost();
    this._shell.attach(host);
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    this.stateService.state = 'attached_shell';

    await this.revealShell(host);
    this.registerEventListeners();
    this.stateService.state = 'ready';
}
```

start方法中调用了`this._shell.attach(host)`来处理前端的渲染，`this._shell`是`ApplicationShell`的实例，`ApplicationShell`在[browser/shell/application-shell.ts](https://github.com/cellbang/malagu/blob/master/packages/core/src/browser/shell/application-shell.ts)文件中的实现如下：

```typescript
import { Component } from '../../common';
import { ApplicationShell } from './shell-protocol';

@Component(ApplicationShell)
export class ApplicationShellImpl implements ApplicationShell {
    attach(host: HTMLElement): void {
        host.textContent = 'Hello, Malagu.';
    }
}
```

我们可以看到`attch`方法接为一个类型为`HTMLElement`的参数`host`，并调用`host.textContent = 'Hello, Malagu.'`赋值实现了一个前端的渲染动作。

后端的`Appliction`的`start`方法中仅调用父类`AbstractApplication`的`doStart`方法处理生命周期的回调。具体的启动逻辑由对应的package处理。

`Appliction`在日常应用开发基本不会接触，前端开发时可能需要自定义`ApplicationShell`来实现渲染。

### IOC
IoC 是面向对象编程的一种设计原则，Malagu中主要依靠一系列的注解器(`Annotation`)来组织代码使之匹配这种设计原则。来看一段示例代码：

```typescript
import { Component, Autowired } from '@malagu/core';

@Component('a')
export class A {
}

@Component()
export class B {
    @Autowired('a')
    protected a: A;
}
```

常用的注解器如下：

- `Component/Service`定义功能
- `Autowired`挂载功能
- `Constant`定义常量
- `Value`挂载配置

### AOP
AOP面向切面编程是一种编程方式，可以作为OOP的补充，针对特定方法做前置后置处理。下面展示一个针对Http请求处理的示例：

```typescript
// http-service-protocol.ts
export const HttpService = Symbol('HttpService');

export interface HttpService {
    get<T>: (url: string, data: any) => Promise<T>;
    post<T>: (url: string, data: any) => Promise<T>;
}
```

```typescript
// http-service.ts
import { Service } from '@malagu/core';
import { HttpService } from 'http-service-protocol';

@Service(HttpService)
export class HttpServiceImpl implements HttpService {
    get<T>(url: string, data: any) {
        // 发送get请求
    }

    post<T>(url: string, data: any) {
        // 发送post请求
    }
}
```

```typescript
// http-service-before.ts
import { Aspect, MethodBeforeAdvice } from '@malagu/core';

@Aspect(MethodBeforeAdvice)
export class MethodBeforeAdviceImpl implements MethodBeforeAdvice {
    async before(method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (method === 'get' || method === 'post') {
            console.log(`method: ${method} url: ${args[0]} data${args[1]}`);
        }
    }
}
```

### Logger


### Error

### 配置参考

1.malagu.hostDomId用来定义前端的根元素id，示例：

```yaml
malagu:
    hostDomId: root
```

