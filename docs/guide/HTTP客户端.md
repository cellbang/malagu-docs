---
title: HTTP 客户端
order: 4.45
toc: menu
---

# HTTP 客户端

我们提供了一个 HTTP 客户端 `RestOperations`，该实现是前后端通用的， `RestOperations` 接口本质是继承了 [axios](https://github.com/axios/axios) ，接口方法签名是一样的。
​

## 使用方式


使用 `@Autowired(RestOperations)` 注入 HTTP 客户端服务对象到你的业务对象中。示例代码如下：
```typescript
import { JWKS } from 'jose';
import { JwkSetManager } from './jwk-protocol';
import { Component, Autowired } from '@celljs/core';
import { RestOperations } from '@celljs/web/lib/common/client/client-protocol';

@Component(JwkSetManager)
export class DefaultJwkSetManager implements JwkSetManager<JWKS.KeyStore> {

    protected readonly cacheMap = new Map<string, JWKS.KeyStore>();

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    async get(jwksUri: string): Promise<JWKS.KeyStore> {
        let keyStore = this.cacheMap.get(jwksUri);
        if (!keyStore) {
            const { data } = await this.restOperations.get(jwksUri);
            keyStore = JWKS.asKeyStore(data);
            this.cacheMap.set(jwksUri, keyStore);
        }
        return keyStore;
    }
}
```
## 属性配置


我们可以通过 `cell.client.config` 配置 HTTP 客户端服务对象，配置对象接口定义如下：
​

```typescript
export interface AxiosRequestConfig {
  url?: string;
  method?: Method;
  baseURL?: string;
  transformRequest?: AxiosTransformer | AxiosTransformer[];
  transformResponse?: AxiosTransformer | AxiosTransformer[];
  headers?: any;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: any;
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  adapter?: AxiosAdapter;
  auth?: AxiosBasicCredentials;
  responseType?: ResponseType;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  validateStatus?: ((status: number) => boolean) | null;
  maxBodyLength?: number;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: AxiosProxyConfig | false;
  cancelToken?: CancelToken;
  decompress?: boolean;
}
```
配置示例如下：
```yaml
  cell:
    client:
      config:
        withCredentials: true
        headers:
          X-Requested-With: XMLHttpRequest
```
