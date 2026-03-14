---
title: 'ESXi升级方法 - 从5.5到6.0'
published: 2020-04-27
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2020-04-26-20-17-56.png'
tags:
  - '虚拟化'
  - '服务器'
  - 'vSphere'
  - '升级'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
上个月给数据中心的vSphere平台做了一次升级，期间遇到各种各样的坑，还好后期都完美解决了，不然真得跑路了（都是自找的= =）。现在我来把当时的整个操作流程整理一下。

# 思考
先简单介绍一下这套vSphere平台的配置。平台共包含10个计算节点，均已组成集群并配置了HA，集群使用IPSAN共享存储，每个计算节点正在运行的ESXi版本是5.1。现在的任务是将每个节点的ESXi版本都升级到5.5。

那么问题来了，怎样才能保证ESXi能够平滑升级的同时，又不影响到平台上的虚拟机呢？这时，我们可以利用集群的特性，将需要升级的节点上的虚拟机热迁移到其他节点（热迁移需要配置vMotion），然后将这个节点切换到维护模式，再进行升级。这样既能完成升级，又能保证业务不中断，岂不美哉！

# 操作过程
## 准备
前面balabala了一堆废话，是时候开始实操了！我们先准备好一些东西：
1. 超级终端软件（如PuTTY、SecureCRT、XShell、MobaXTerm等，Win10 CMD自带的SSH功能也是可以的）；
2. ESXi 5.5升级包（可从VMware官网或其他途径获取）
3. VMware vSphere Client（vSphere客户端）

## 通过vSphere Client进行操作

使用vSphere Client登录到ESXi节点，将节点切换到维护模式：
![2020-04-26-18-00-29](https://buff.tokiame.cn/hexo-images/2020-04-26-18-00-29.png)

![2020-04-26-18-04-01](https://buff.tokiame.cn/hexo-images/2020-04-26-18-04-01.png)

将ESXi升级包上传到数据存储，并记下数据存储路径，后续升级操作要用到。例如我这里将升级包上传到了本地存储，那么我现在得记下本地存储的路径：
![2020-04-26-18-20-10](https://buff.tokiame.cn/hexo-images/2020-04-26-18-20-10.png)

## 通过SSH登录到ESXi节点
打开该节点的配置→安全配置文件，启动SSH服务：
![2020-04-26-18-05-41](https://buff.tokiame.cn/hexo-images/2020-04-26-18-05-41.png)

![2020-04-26-18-06-45](https://buff.tokiame.cn/hexo-images/2020-04-26-18-06-45.png)

打开超级终端软件（笔者用的是XShell），使用ESXi的账号密码，用SSH登录到ESXi节点：
![2020-04-26-18-09-19](https://buff.tokiame.cn/hexo-images/2020-04-26-18-09-19.png)

## 使用命令对ESXi进行平滑升级
使用这条命令列出ESXi升级包的版本：
```bash
esxcli software sources profile list -d <ESXi升级包所在的数据存储的路径>
```
![2020-04-26-18-15-43](https://buff.tokiame.cn/hexo-images/2020-04-26-18-15-43.png)
（注：数据存储路径见本文3.2）

然后使用这条命令，通过升级包进行升级
```bash
esxcli software profile update -d <ESXi升级包所在的数据存储的路径> -p <ESXi升级包版本>
```
![2020-04-26-19-32-24](https://buff.tokiame.cn/hexo-images/2020-04-26-19-32-24.png)
稍等片刻会出现升级结果。升级成功后，要求重新启动，这时输入reboot命令，将该节点重启即可。

## 后续操作
重启完成后，再次用vSphere Client登录到ESXi，看看ESXi的版本是不是升级到5.5了？
![2020-04-26-19-40-10](https://buff.tokiame.cn/hexo-images/2020-04-26-19-40-10.png)

确认升级成功后，将ESXi节点退出维护模式：
![2020-04-26-19-44-17](https://buff.tokiame.cn/hexo-images/2020-04-26-19-44-17.png)

# 后记
以上就是ESXi的平滑升级流程。当然，在生产环境下，系统升级前必须拟定相应的方案（例如升级流程、应急预案等），并对原系统进行测试、数据备份，升级过程中必须严格遵循操作规程，升级后还需要保留一定时长的观察期，当这一系列流程都顺利完成后，才能正式交付使用。