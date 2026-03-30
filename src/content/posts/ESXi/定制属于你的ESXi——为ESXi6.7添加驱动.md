---
title: '定制属于你的ESXi——为ESXi6.7添加驱动'
published: 2020-07-04
description: ''
image: 'https://cdn.tokiame.cn/2020-07-04-15-13-44.jpg'
tags:
  - '服务器'
  - 'vSphere'
  - '驱动'
  - '运维'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
ESXi是目前企业采用的主流虚拟化方案之一，同时也深受广大极客和发烧友的钟爱。ESXi能够兼容大部分的服务器设备，无需额外安装驱动即可安装运行。但是，某些厂商设备采用了第三方或者自有的配件，而原生ESXi往往没有这些配件的驱动程序，这就会导致ESXi无法识别硬件、安装失败。

早期版本的ESXi（6.5以及更早版本）是可以通过ESXi Customizer来添加第三方驱动程序的，而ESXi6.7已经不再支持用旧版的ESXi Customizer来添加驱动了。So，笔者参照了一下这位大神[Vedio Talk](https://www.vediotalk.com/archives/2356)的做法，给大家介绍如何为6.7和更高版本的ESXi添加第三方驱动程序。

# 进入主题
## 准备工作
**本文使用到的软件如下：**
1. ESXi 6.7 u3b离线安装包
2. ESXi Customizer PS→[点击此处下载](http://vibsdepot.v-front.de/tools/ESXi-Customizer-PS-v2.6.0.ps1)
3. PowerShell（Windows 10自带的命令行环境）
4. 硬件的ESXi驱动（本文以H3C服务器的阵列卡驱动为例）

## 步骤
### 安装Vmware PowerCLI模块
打开Windows PowerShell，输入`Install-Module -Name VMware.PowerCLI`,在线安装VMware命令行模块（由于是从国外代码库进行下载，此处请自备一杯酸酸乳，不然半年都下不完...）：
![2020-07-04-13-25-37](https://cdn.tokiame.cn/2020-07-04-13-25-37.png)
ps：输入A全部选是

输入`set-ExecutionPolicy Bypass`，调整PowerShell执行策略，允许运行脚本：
![2020-07-04-13-26-02](https://cdn.tokiame.cn/2020-07-04-13-26-02.png)

### 为ESXi添加驱动
[下载ESXi Customizer PS](http://vibsdepot.v-front.de/tools/)。将ESXi离线包、驱动程序、ESXi Customizer放到同一个目录，方便操作：
![2020-07-04-14-37-10](https://cdn.tokiame.cn/2020-07-04-14-37-10.png)

在该目录下，按住Shift键+鼠标右键，在该目录下打开PowerShell：
![2020-07-04-14-38-31](https://cdn.tokiame.cn/2020-07-04-14-38-31.png)

使用命令，为ESXi包添加驱动。命令格式如下：
```
.\ESXi-Customizer-PS-v2.6.0.ps1 -izip <ESXi离线包路径> -pkgDir <驱动文件路径>
```
![2020-07-04-13-30-33](https://cdn.tokiame.cn/2020-07-04-13-30-33.png)

命令执行完成以后，会在相同目录下生成一个包含驱动的ISO镜像文件。这时我们就可以用这个ISO镜像来安装ESXi了：
![2020-07-04-16-00-08](https://cdn.tokiame.cn/2020-07-04-16-00-08.png)

## 另请参阅...
* ESXi驱动包下载：https://vibsdepot.v-front.de/wiki/index.php/List_of_currently_available_ESXi_packages
* VMware官方网站：https://www.vmware.com/