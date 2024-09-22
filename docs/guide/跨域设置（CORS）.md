---
title: 跨域设置（CORS）
order: 19
toc: menu
---

# 跨域设置（CORS）

CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。CORS 需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。


整个 CORS 通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS 通信与同源的 AJAX 通信没有差别，代码完全一样。浏览器一旦发现 AJAX 请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。


因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。


## 实现与使用


Cell 框架提供的跨域设置能力是通过集成开源库 [cors](https://www.npmjs.com/package/cors) 实现的。将开源库 cors 的配置能力通过 Cell 组件属性暴露出来，我们只需要使用组件属性配置跨域访问规则即可。框架默认运行所有源站跨域访问，**在正式环境务必设置跨域规则，避免出现安全问题。**
**
```yaml
cell:
  web:
    cors:
      origin: https://www.cellbang.com  # 允许 https://www.cellbang.com 跨域访问
```


```yaml
cell:
  web:
    cors:
      origin: ${{'cellbang\.com$'|regexp}} # 允许以 cellbang.com 为后缀的源站跨域访问
```


```yaml
cell:
  web:
    cors:
      origin: 
        - https://www.abc.com
        - ${{'cellbang\.com$'|regexp}}
```


## 配置参数


- `origin`：配置**Access-Control-Allow-Origin**CORS标头。可能的值：
   - `Boolean`-设置`origin`为`true`反映[请求的来源](http://tools.ietf.org/html/draft-abarth-origin-09)（由定义）`req.header('Origin')`，或设置`false`为禁用CORS。
   - `String`-设置`origin`为特定来源。例如，如果将其设置为`"http://example.com"`仅允许来自“ [http://example.com](http://example.com)”的请求。
   - `RegExp`-设置`origin`为正则表达式模式，该模式将用于测试请求的来源。如果匹配，则将反映请求的来源。例如，该模式`/example\.com$/`将反映来自以“ example.com”结尾的来源的任何请求。
   - `Array`-设置`origin`为有效原点的数组。每个原点可以是`String`或`RegExp`。例如，`["http://example1.com", /\.example2\.com$/]`将接受来自“ [http://example1.com](http://example1.com)”或来自“ example2.com”子域的任何请求。
   - `Function`-设置`origin`为实现某些自定义逻辑的函数。该函数将请求源作为第一个参数，并将回调（需要签名`err [object], allow [bool]`）作为第二个参数。
- `methods`：配置**Access-Control-Allow-Methods** CORS标头。需要以逗号分隔的字符串（例如：“ GET，PUT，POST”）或数组（例如：）`['GET', 'PUT', 'POST']`。
- `allowedHeaders`：配置**Access-Control-Allow-Headers** CORS标头。需要以逗号分隔的字符串（例如：“ Content-Type，Authorization”）或数组（例如：）`['Content-Type', 'Authorization']`。如果未指定，则默认为反映请求的**Access-Control-Request-Headers**标头中指定的标头。
- `exposedHeaders`：配置**Access-Control-Expose-Headers** CORS标头。需要以逗号分隔的字符串（例如：“ Content-Range，X-Content-Range”）或数组（例如：）`['Content-Range', 'X-Content-Range']`。如果未指定，则不会公开任何自定义标头。
- `credentials`：配置**Access-Control-Allow-Credentials** CORS标头。设置为`true`传递标题，否则将省略。
- `maxAge`：配置**Access-Control-Max-Age** CORS标头。设置为整数以传递标头，否则将省略。
- `preflightContinue`：将CORS飞行前响应传递给下一个处理程序。
- `optionsSuccessStatus`：提供状态代码以用于成功`OPTIONS`请求，因为某些旧版浏览器（IE11，各种SmartTV）会阻塞`204`。
