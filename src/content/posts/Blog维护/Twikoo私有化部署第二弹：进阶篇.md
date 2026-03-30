---
title: 'Twikoo私有化部署第二弹：进阶篇'
published: 2022-10-07
description: ''
image: 'https://cdn.tokiame.cn/2022-10-04-12-52-36.png'
tags:
  - 'Hexo'
  - '博客'
category: 'Hexo'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
上一篇已经介绍过，我的Twikoo评论系统已经采用了私有化部署方式。但是存在一个问题，如果日后博客的访问量上升，评论内容增多，每次加载评论都需要从源站请求资源，会造成源站压力增大的问题，容易出现单点故障。

So，CDN派上用场了。

# 操作步骤
## CDN
1. 打开腾讯云CDN控制台，添加域名，加速域名为后续要使用的域名，加速类型为CDN网页小文件，开启IPv6访问（可选），源站类型为自有源、回源协议为http，源站地址为Twikoo后端所在的服务器地址（即服务器的域名。需要在DNS控制台添加一条A记录，指向服务器IP地址），端口为Twikoo后端服务使用的端口（默认是8080，可自行修改）：
![2022-10-07-11-29-46](https://cdn.tokiame.cn/2022-10-07-11-29-46.png)
2. 检查无误后点击确认添加，然后提交配置（推荐配置保持默认即可，后续有需要再慢慢细调）：
![2022-10-07-11-30-22](https://cdn.tokiame.cn/2022-10-07-11-30-22.png)
3. 最后一步是配置CNAME，点击一键配置，确定。
![2022-10-07-11-31-06](https://cdn.tokiame.cn/2022-10-07-11-31-06.png)
![2022-10-07-11-31-38](https://cdn.tokiame.cn/2022-10-07-11-31-38.png)
点击验证CNAME状态，显示已生效后，点击完成即可。
![2022-10-07-11-33-29](https://cdn.tokiame.cn/2022-10-07-11-33-29.png)

## 博客
修改``_config.butterfly.yml``中的相关配置项即可：
```yaml
twikoo:
  envId: http://加速域名/
  region: #留空
  visitor: false
  option: #留空
```
修改完成后重新构建、推送。

# Debug
## 出现的问题
后续使用中发现，评论区几乎不能正常使用，无法登录后台，无法发表评论。
so，来看看是啥问题。

F12打开浏览器控制台，点击网络，刷新博客页面，观察右侧标红的内容，点开他。
![2022-10-07-10-55-56](https://cdn.tokiame.cn/2022-10-07-10-55-56.jpg)

博客使用的是https，但是Twikoo后端使用的是http。
恍然大悟，原来是跨域问题。

## 解决方法
在CDN控制台，点击你的Twikoo加速域名→HTTPS配置。配置好SSL证书，将HTTP2.0配置的开关打开，再打开强制跳转（可选）：
![2022-10-07-12-21-03](https://cdn.tokiame.cn/2022-10-07-12-21-03.png)
修改``_config.butterfly.yml``中的相关配置项，把http改为https：
```yaml
twikoo:
  envId: https://加速域名/
  region: #留空
  visitor: false
  option: #留空
```
修改完成后重新构建，稍等片刻等CDN生效后再推送，大功告成！
![2022-10-07-22-41-54](https://cdn.tokiame.cn/2022-10-07-22-41-54.png)