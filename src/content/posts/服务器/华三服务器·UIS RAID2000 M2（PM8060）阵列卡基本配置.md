---
title: '华三服务器·UIS RAID2000 M2（PM8060）阵列卡基本配置'
published: 2020-07-02
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2020-07-04-15-13-44.jpg'
tags:
  - 'RAID'
  - '磁盘'
  - 'BIOS'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
>**磁盘阵列**（Redundant Arrays of Independent Disks，RAID）是如今大多数服务器的一个基本组成部分，它是由多块独立磁盘组合而成的磁盘组，用于提升整个磁盘系统效能，以及数据的安全性。

目前实现阵列有两种形式，分为软阵列和硬阵列。软阵列需要通过软件来实现阵列功能，如Windows的RAID5卷、Linux的mdadm工具等。而硬阵列则需要通过硬件来实现，如阵列卡。本文以华三服务器为例的UIS RAID2000 M2（PM8060）阵列卡为例，介绍如何配置一个简单的磁盘阵列。

# 操作过程
## 实验环境
1. 服务器：H3C R4900 G2
2. 服务器包含一块UIS RAID2000 M2（PM8060）阵列卡，和3个600GB的SAS磁盘
3. 服务器已启用HDM（华三服务器的BMC）
4. 一台电脑，用于远程操作
## 正文
使用电脑登录到服务器的BMC，点击远程控制台，下载控制台程序并运行（需要安装JRE）：
![2020-07-01-18-10-03](https://buff.tokiame.cn/hexo-images/2020-07-01-18-10-03.png)
点击控制台左上角的电源，点击开机。如果服务器处于开机状态，则点击重启。等待系统自检通过后（大概需要一分钟），按屏幕提示，按下Esc键或Del键进入BIOS。如下图操作：


![2020-07-01-18-33-03](https://buff.tokiame.cn/hexo-images/2020-07-01-18-33-03.png)

选中高级→PMC maxView Storage Manager，一路回车，进入RAID配置界面：
![2020-07-01-18-13-10](https://buff.tokiame.cn/hexo-images/2020-07-01-18-13-10.png)

![2020-07-01-18-16-04](https://buff.tokiame.cn/hexo-images/2020-07-01-18-16-04.png)

选中Logical Device Configuration→Create Array，创建一个新的逻辑磁盘组。这里以创建一个RAID1阵列为例：
![2020-07-01-18-19-18](https://buff.tokiame.cn/hexo-images/2020-07-01-18-19-18.png)

![2020-07-01-18-19-43](https://buff.tokiame.cn/hexo-images/2020-07-01-18-19-43.png)

![2020-07-01-18-21-13](https://buff.tokiame.cn/hexo-images/2020-07-01-18-21-13.png)
ps：由于是实验，这里使用Quick Init（快速部署）即可。

查看配置结果：
![2020-07-01-18-46-38](https://buff.tokiame.cn/hexo-images/2020-07-01-18-46-38.png)