---
title: 'Twikoo私有化部署第一弹：基础篇'
published: 2022-10-04
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2022-10-04-12-52-36.png'
tags:
  - 'Hexo'
  - '博客'
category: 'Hexo'
draft: false
pinned: false
lang: ''
author: ''
---

# Twikoo不是支持云开发吗
我肯定知道啊。
再看看云开发目前的收费方式：
![2022-10-04-12-49-37](https://buff.tokiame.cn/hexo-images/2022-10-04-12-49-37.png)

发生了什么事情呢？看这位博主就知道了（我不想说话）：[https://blog.zhheo.com/p/99d020fe.html](https://blog.zhheo.com/p/99d020fe.html)

前段时间我忙不过来，然后腾讯直接把我的环境给干掉了。。
![2022-10-04-20-06-37](https://buff.tokiame.cn/hexo-images/2022-10-04-20-06-37.png)

虽说能恢复数据，但我觉得一个小小的评论区，评论条目也不多，还得花10几块钱月费才能继续恢复，真的没有必要了。

腾讯云，我劝你善良。

# 另起炉灶
上有政策，下有对策。
Twikoo是支持多种方式部署的，刚好我有一台闲置的云主机，直接部署在上面就得了。

## 环境介绍
- 操作系统：Windows Server 2012 R2
- 软件：Node.js 16.17.1

## 后端部署
1. 首先，从[官网](https://nodejs.org/en/)下载好Node.js，安装（步骤过于简单，所以不写了）：
![2022-10-04-12-49-10](https://buff.tokiame.cn/hexo-images/2022-10-04-12-49-10.png)

2. 打开cmd，输入``npm i -g tkserver``，安装Twikoo后端服务：
![2022-10-04-12-49-03](https://buff.tokiame.cn/hexo-images/2022-10-04-12-49-03.png)

3. 输入``tkserver``，启动Twikoo后端服务。浏览器输入``http://服务器IP地址:8080``，如果出现这个提示，说明Twikoo已经正常运行：
![2022-10-04-12-48-45](https://buff.tokiame.cn/hexo-images/2022-10-04-12-48-45.png)
![2022-10-04-12-48-54](https://buff.tokiame.cn/hexo-images/2022-10-04-12-48-54.png)

## 前端配置
我的博客是基于Hexo+Butterfly主题构建的。对于Butterfly主题，只需要修改``_config.butterfly.yml``中的相关配置项即可：

```yaml
comments:
  use:
    - Twikoo
```

```yaml
twikoo:
  envId: http://你的服务器地址:8080/
  region: #留空
  visitor: false
  option: #留空
```
修改完成后重新构建，推送到COS即可。
对于其他主题，[Twikoo官方文档](https://twikoo.js.org/quick-start.html#%E5%9C%A8-hexo-%E4%B8%AD%E4%BD%BF%E7%94%A8)也给出了相应的配置方法，自行了解即可。

# 初始化设置
没啥好讲的其实。
在你的博客目录下打开命令行，输入``hexo server``启动本地服务，浏览器访问``localhost:4000``，不出意外的话评论区已经可以使用了，只需做一些初始配置即可。
![2022-10-04-12-47-56](https://buff.tokiame.cn/hexo-images/2022-10-04-12-47-56.png)