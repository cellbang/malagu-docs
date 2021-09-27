---
title: 方法拦截（AOP）
order: 28
toc: menu
---

# 方法拦截（AOP）

面向切面编程（AOP）是一种横向扩展的方式。Malagu 框架支持 AOP，提供了一系列的扩展接口来定义自己的切面。通过 AOP 我们可以实现全局日志拦截、全局权限拦截等等功能，同时，也能不污染业务代码。目前，Malagu 框架支持了方法类型的拦截点，未来可能会有更多类型的拦截点，用户也可以实现自己需要的拦截点类型。


## Advice


AOP 最基础的一个接口，AOP 拦截点会通知 Advice 接口的实现。根据拦截点的类型和时机不同，会有不同的子接口。


```typescript
export interface Advice { }
```




## BeforeAdvice


AOP 拦截点之前会通知 BeforeAdvice 接口的实现。


```typescript
export interface BeforeAdvice extends Advice { }
```




## AfterAdvice


AOP 拦截点之后会通知 AfterAdvice 接口的实现。


```typescript
export interface AfterAdvice extends Advice { }
```




## MethodBeforeAdvice


AOP 方法拦截点（调用）之前会通知 MethodBeforeAdvice 接口的实现。


```typescript
export interface MethodBeforeAdvice extends BeforeAdvice { }
```


## AfterReturningAdvice


AOP 方法拦截点（调用）之后会通知 AfterReturningAdvice 接口的实现。


```typescript
export interface AfterReturningAdvice extends AfterAdvice { }
```




## AfterThrowsAdvice


AOP 方法拦截点（抛异常）之后会通知 AfterThrowsAdvice 接口的实现。


```typescript
export interface AfterThrowsAdvice extends AfterAdvice { }
```


