---
title: '@celljs/web'
description: '@celljs/web 参考'
type: package
lang: zh-CN
---

# @celljs/web

### 配置参考

1.`cell.session`会话配置，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| autoCommit   | true             |                            |
| maxAge       | 86400000         |                            |
| sessionIdKey | cell:sessionId |                            |
| sessionKey   | cell:session   |                            |

2.`cell.server`服务配置，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| path         | /                    |                            |
| port         | 3000                 |                            |
| endpoint     | http://localhost:${cell.server.port} |                            |

3.`cell.trace`追踪id，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| requestField  | X-Cell-Trace-ID |                            |
| responseField | X-Cell-Trace-ID |                            |

4.`cell.web`配置路由验证等，结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| route.cacheSize          | 500   |                            |
| validationPipeOptions    | false |                            |
| - detailedOutputDisabled | false |                            |
| - transformEnabled       | true  |                            |

5.`cell.client.config`结构如下：

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| withCredentials    | true           |                            |
| headers            | true           |                            |
| - X-Requested-With | XMLHttpRequest |                            |

6.`cell.cookies`结构如下：
| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| keys         | - abcdef             |                            |

7.`cell.backend`

| Key          | Value            | Description                |
| ----         | ----             | ----                       |
| devEntry     | lib/node/application/dev-application-entry |                            |