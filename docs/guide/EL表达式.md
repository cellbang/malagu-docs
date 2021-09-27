---
title: EL 表达式
order: 21
toc: menu
---

# EL 表达式

Malagu 框架很多地方使用到了 EL 表达式功能，EL 表达式使用了开源库 [jexl](https://www.npmjs.com/package/jexl) 实现。EL 表达式让组件属性的定义与使用变得极度灵活。


## 在配置文件中使用 EL 


在 Malagu 框架中，使用 Yaml 文件配置组件属性。为了让属性普通值与 EL 表达式区别开来，Malagu 使用 `${}` 和 `${{}}` 包裹 EL 表达式。一个属性值可以包含多个 EL 表达式和字符串的组合，并且 EL 表达式还可以嵌套使用。

- `${}` 编译时 EL 表达式，在项目编译构建时计算
- `${{}}` 运行时 EL 表达式，在项目运行时计算



1. 引用其他属性值
```yaml
port: 3000
host: localhost
url: 'https://${host}:${port}'

```


2. 引用环境变量值
```yaml
password: ${env.PASSWORD}
```


3. 默认值设置
```yaml
password: '${env.PASSWORD?:123456}'
```

4. 忽略表达式计算



如下属性配置，因为 test 节点存在属性 `_ignoreEl` 为 true，则 test 节点下的属性或者属性的属性的值不在进行表达式计算。
```yaml
test:
	a: '${b > 0 ? true: false}'
  _ignoreEl: true 
```
上面的方案是对某个一个节点进行表达式计算忽略，如何只对单一属性值就行表达式忽略呢？我们可以通过转义符实现。如下：
```yaml
test:
	a: '\\${b > 0 ? true: false}'

```


5. 运行时表达式



上面的写法是在项目编译期间计算表达式的值，如果您需要在应用运行时取运行时的环境变量的话，如下：
```yaml
password: '${{env.PASSWORD?:123456}}'
```
表达式更多语法规则请看：[Jexl](https://github.com/TomFrost/jexl#jexl-)。
## 在 `@Value` 中使用


使用 `@Value` 装饰器可以把属性值注入到某一个类对象中。`@Value` 支持一个 EL 表达式参数，`@Value` 就是通过该 EL 表达式参数去引用并且计算属性的值。因为默认就是 EL 表达式，所以不需要使用 `${}` 和 `${{}}` 包裹 EL 表达式。


```typescript
import { Component, Value } from '@malagu/core';

@Component()
export class A {
    @Value('foo') // 支持 EL 表达式语法，如 @Value('obj.xxx')、@Value('arr[1]') 等等
    protected foo: string;
}
```


## 在 `ConfigUtil` 中使用


与 `@Value` 装饰器类似，不需要使用 `${}` 和 `${{}}` 包裹 EL 表达式。在 `ConfigProvider` 中使用 EL 表达式与 `ConfigUtil` 是一样的，因为`ConfigUtil` 底层是基于 `ConfigProvider` 封装实现。


```typescript
export function Logo(props: NavItemProps) {
    const { label, icon, ...rest } = ConfigUtil.get('malagu.shell.logo');
    props = { ...rest, ...props };
    return (<NavItem size="medium" gap="xsmall" label={label} icon={<Icon icon={icon}/>} hoverIndicator={false} activatable={false} {...props}/>);
}
```


## EL 表达式上下文


在 EL 表达式中之所以可以使用组件属性，是因为默认 EL 表达式上下文已经添加了组件属性。框架提供了相关扩展点，我们可以扩展默认的 EL 表达式上下文。只需要实现 `ContextInitializer` 接口，并以 `ContextInitializer` 为 ID 注入到 IoC 容器即可。通过 `ContextInitializer` 接口扩展的上下文是运行时上下文，在编译期间无法取到。


```typescript
@Component(ContextInitializer)
export class CoreContextInitializer implements ContextInitializer {

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider<any>;

    initialize(ctx: ExpressionContext): void {
        ctx.env = { ...process.env, _ignoreEl: true };
        const jexlEngine = this.jexlEngineProvider.provide();
        jexlEngine.addTransform('replace',
                (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
        jexlEngine.addTransform('regexp',  (pattern: string, flags?: string) => new RegExp(pattern, flags));
    }

    priority = 500;

}
```
其中，在示例代码中，我们可以看到，不仅仅扩展了表达式上下文，还为 EL 表达式引擎扩展了转换函数 `replace` 和 `regexp` 。
```yaml
name: ${malagu['fc-adapter'].function.name|replace('-', '_')}
origin: ${{'cellbang\.com$'|regexp}}
```


## 默认提供 EL 表达式上下文


- 应用配置属性，使用范围：编译时和运行时。例如 `${mode}` `${malagu.server.port}`  `${stage}` 
- `env` 环境变量，使用范围：编译时和运行时。例如 `${env.PASSWORD}`  `${{env.PASSWORD}}` 
- `pkg` 应用程序包信息，使用范围：编译时。例如 `${pkg.name}` 程序包名称 `${pkg.version}` 程序包版本
- `cliContext` 命令行上下文信息，使用范围：编译时。例如 `${cliContext.dev}`  是否是本地运行环境



## 默认提供 EL 表达式转换函数


- `replace` 字符串全局替换函数，使用范围：编译时和运行时。例如 `${'aabb'|replace('a', 'b')}` 
- `regexp` 字符串转正则表达式函数，**如果该正则表达式需要运行时使用，务必使用 `${{}}`** ，使用范围：编译时和运行时。例如 `${{'cellbang\.com$'|regexp}}` 
