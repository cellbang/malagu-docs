---
title: 无头浏览器应用（Puppeteer）
order: 7
toc: menu
---

# 无头浏览器应用（Puppeteer）

Malagu 框架对 Serverless 场景常用的云服务接口做了一层抽象，比如对象存储服务，在 Malagu 框架的 `@malagu/cloud` 组件中抽象了一个云厂商无关的接口： `ObjectStorageService` 。我们在真实应用中操作对象存储服务使用框架提供的接口即可，不需要关心接口不同云厂商的实现细节。虽然不用云厂商对象存储服务的 Open API 大同小异，但是如果我们需要用到了某个云厂商对象存储服务特定的接口，其他的云厂商是没有的，这时，我们可以使用 `ObjectStorageService` 接口的 `getRawCloudService` 方法，获得原生的云服务接口。


在使用 Malagu 实现无头浏览器应用的时候，发现 Puppeteer 的二进制文件过大，超过了 50 MB。很多 Serverless 平台限制在 50 MB 以内，就是某些平台支持超过 50 MB 以上的代码包，也不推荐将二进制打包到代码包中，如果这样，每次部署的时候将会很长。推荐使用**对象存储服务** + **FaaS 服务**来实现。将二进制文件上传到对象存储，函数实例启动的时候，通过内网从对象存储中下载二进制文件到 `/tmp` 目录。由于内网下载速度很快，大约 1 秒左右可以下载好。

不同云厂商对应的对象存储组件不一样，腾讯云对象存储 COS：@malagu/cos；阿里云对象存储 OSS：@malagu/oss；亚马逊云对象存储 S3：@malagu/s3。不同云厂商依赖的对象存储组件不一样，但是相关的配置和接口是一样的，框架会屏蔽不同云厂商之间的差异。


Malagu 框架提供了一个组件 `@malagu/puppeteer` 组件，帮助我们快速开发无头浏览器应用。其中最关键的是注入并使用以下服务接口：
```typescript
@Controller()
export class PuppeteerController {

    @Autowired(BrowserProvider)
    protected readonly browserProvider: BrowserProvider;
}

`@malagu/puppeteer` 主要的作用是集成了 puppeteer-core  这个库，BrowserProvider 接口提供给开发者使用。Browser 的安装是通过 BrowserInstaller 接口实现，默认实现机制提供了两种策略，一是通过对象存储下载 headless 二进制；二是直接使用本地已经存在的 headless；不同的策略是通过配置参数控制。开发者也可以完全覆盖默认安装这个行为。

```
相关配置：


```yaml
targets:
  - backend
malagu:
  cloud:
    region: cn-hangzhou                             # 指定存放 headless 相关二进制的 oss 的地域，建议与应用部署的地域一致，一致可以省略配置
    credentials:                                    # 如果函数配置了角色权限，且拥有访问以下 bucket 的读权限，就不需要配置 AK 信息了
      accessKeyId: xxxxxxxxxxxxxxxxxxxxxxxx         # 指定能够访问存放 headless 相关二进制 accessKeyId，至少具有读该 Object 的权限
      accessKeySecret: xxxxxxxxxxxxxxxxxxxxxx
  puppeteer:
    bucket: headless-lib                            # 指定存放 headless 相关二进制的 oss 的 Bucket 名称 headless-lib
    object: headless-lib.tar.gz                     # 指定存放 headless 相关二进制的 oss 的 objeck 名称，默认 headless-lib.tar.gz
```

上述直接出了部分配置属性，比如我们如果使用腾讯云函数部署，腾讯云函数的运行时默认内置了 headless，这种情况下，我们可能不需要通过对象存储下载，此时我们无需配置上面与对象存储相关的配置。我们可以通过 `launchOptions` 属性配置告诉框架如何找到 headless 启动文件位置，以及其他相关的启动参数。[更多 `launchOptions` 配置项](https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=v13.5.1&show=api-puppeteerlaunchoptions)。

```yaml
targets:
  - backend
malagu:
  puppeteer:
    launchOptions:
      headless: true
      executablePath: ${malagu.puppeteer.setupPath}/headless-chromium  # 指定 Headless 的执行路径
```

## 快速开始


Malagu 框架提供了命令行模板，我们可以通过 `malagu init` 命令快速创建一个无头浏览器应用项目。选择如下模板：
```bash
➜  test malagu init

                   ___
 /'\_/`\          /\_ \
/\      \     __  \//\ \      __       __   __  __
\ \ \__\ \  /'__`\  \ \ \   /'__`\   /'_ `\/\ \/\ \
 \ \ \_/\ \/\ \L\.\_ \_\ \_/\ \L\.\_/\ \L\ \ \ \_\ \
  \ \_\\ \_\ \__/.\_\/\____\ \__/.\_\ \____ \ \____/
   \/_/ \/_/\/__/\/_/\/____/\/__/\/_/\/___L\ \/___/
                                       /\____/
                   @malagu/cli@2.30.0  \_/__/

╭──────────────────────────────────────────────────╮
│      Serverless First Development Framework      │
╰──────────────────────────────────────────────────╯

? Select a template to init
  vue-app Official
  database-app Official
  accounts Official
  schedule Official
  admin-app Official
  microservice Official
  standalone-app Official
  file-service Official
❯ puppeteer Official
  mycli Official
  backend-app Official
  sample-app Official
(Move up and down to reveal more choices)
```
## 示例代码


[在线打开示例代码](https://cloud.cellbang.com/?share=014271bb-fc29-4437-8337-7d2017b1fa33#/templates/puppeteer)

## 裁剪过的二进制文件


[headless-lib.tar.gz](https://www.yuque.com/attachments/yuque/0/2020/gz/365432/1608116939508-211b2cce-0952-4ba3-a4c3-c75165fda713.gz?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2020%2Fgz%2F365432%2F1608116939508-211b2cce-0952-4ba3-a4c3-c75165fda713.gz%22%2C%22name%22%3A%22headless-lib.tar.gz%22%2C%22size%22%3A58333343%2C%22type%22%3A%22application%2Fx-gzip%22%2C%22ext%22%3A%22gz%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221608116836751-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22fxuSN%22%2C%22card%22%3A%22file%22%7D)  不支持 video 播放
[headless-lib.tar.gz](https://www.yuque.com/attachments/yuque/0/2020/gz/365432/1609220903169-5af8ae27-75d8-4dfd-a1c0-a4cd71a477d3.gz?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2020%2Fgz%2F365432%2F1609220903169-5af8ae27-75d8-4dfd-a1c0-a4cd71a477d3.gz%22%2C%22name%22%3A%22headless-lib.tar.gz%22%2C%22size%22%3A54182128%2C%22type%22%3A%22application%2Fx-gzip%22%2C%22ext%22%3A%22gz%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221609220858739-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22KiMWX%22%2C%22card%22%3A%22file%22%7D)  支持 video 播放
​

## 支持 Video 播放的构建脚本
```bash
# build headless chrome on sbox
# https://github.com/adieuadieu/serverless-chrome/blob/master/chrome/README.md

# sudo su

apt-get install flex bison libcogl-pango-dev gperf

cd ~
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo "export PATH=$PATH:$HOME/depot_tools" >> ~/.bash_profile
source ~/.bash_profile

mkdir Chromium
cd Chromium
fetch --no-history chromium
cd src

# use /tmp instead of /dev/shm
# https://groups.google.com/a/chromium.org/forum/#!msg/headless-dev/qqbZVZ2IwEw/CPInd55OBgAJ
sed -i -e "s/use_dev_shm = true;/use_dev_shm = false;/g" base/files/file_util_posix.cc

mkdir -p out/Headless
echo 'import("//build/args/headless.gn")' > out/Headless/args.gn
echo 'is_debug = false' >> out/Headless/args.gn
echo 'symbol_level = 0' >> out/Headless/args.gn
echo 'is_component_build = false' >> out/Headless/args.gn
echo 'remove_webcore_debug_symbols = true' >> out/Headless/args.gn
echo 'enable_nacl = false' >> out/Headless/args.gn
# 以下两个配置开启对 Video 播放
# echo 'proprietary_codecs = true' >> out/Headless/args.gn
# echo 'ffmpeg_branding = "Chrome"' >> out/Headless/args.gn
gn gen out/Headless
ninja -C out/Headless headless_shell

cd out/Headless
strip headless_shell
mkdir /home/fc
tar -zcvf /home/fc/headless_shell.tar.gz headless_shell
```
