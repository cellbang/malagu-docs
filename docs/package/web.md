---
title: '@malagu/web'
description: '@malagu/web 参考'
type: package
lang: zh-CN
---

# @malagu/web

### 配置参考

1.`malagu.session`会话配置，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| autoCommit   | true             |                            |
| maxAge       | 86400000         |                            |
| sessionIdKey | malagu:sessionId |                            |
| sessionKey   | malagu:session   |                            |

2.`malagu.server`服务配置，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| path         | /                    |                            |
| port         | 3000                 |                            |
| endpoint     | http://localhost:${malagu.server.port} |                            |

3.`malagu.trace`追踪id，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| requestField  | X-Malagu-Trace-ID |                            |
| responseField | X-Malagu-Trace-ID |                            |

4.`malagu.web`配置路由验证等，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| route.cacheSize          | 500   |                            |
| validationPipeOptions    | false |                            |
| - detailedOutputDisabled | false |                            |
| - transformEnabled       | true  |                            |

5.`malagu.client.config`结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| withCredentials    | true           |                            |
| headers            | true           |                            |
| - X-Requested-With | XMLHttpRequest |                            |

6.`malagu.cookies`结构如下：
| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| keys         | - abcdef             |                            |

7.`malagu.backend`

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| devEntry     | lib/node/application/dev-application-entry |                            |