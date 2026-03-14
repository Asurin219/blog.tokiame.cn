---
title: '使用Diskpart优雅地管理你的磁盘分区'
published: 2021-05-28
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2021-05-27-17-43-41.png'
tags:
  - '服务器'
  - 'Windows'
  - '运维'
category: '瞎折腾'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
~~强迫症（OCD）属于焦虑障碍的一种类型，是一组以强迫思维和强迫行为为主要临床表现的神经精神疾病，其特点为有意识的强迫和反强迫并存，一些毫无意义、甚至违背自己意愿的想法或冲动反反复复侵入患者的日常生活。患者虽体验到这些想法或冲动是来源于自身，极力抵抗，但始终无法控制，二者强烈的冲突使其感到巨大的焦虑和痛苦，影响学习工作、人际交往甚至生活起居。~~
我们每次在虚拟机上安装Windows，设置Windows安装位置的时候，都会提示“Windows可能要为系统文件创建额外的分区”。这样安装的话会默认创建EFI（存放EFI引导文件）、MSR（保留分区）和主分区，强迫症表示非常不爽。撇开强迫症不说，如果需要扩展磁盘空间，有个MSR分区卡在中间的话，根本没法进行在线扩容，需要进入Windows PE利用分区软件来进行扩容，带来极大的不便。我们可以利用Windows安装镜像自带的Diskpart工具，亲手进行磁盘分区。

# 操作过程
## 环境介绍
* 系统镜像文件：Windows Server 2019镜像文件
* 虚拟化平台：VMware vSphere 7.0u2
* 一台能上网的破笔记本
* 一位懂电脑并且会用vSphere的靓仔or靓女/滑稽

## 安装伊始
照常创建虚拟机，挂载Windows安装镜像，一路来到Windows安装界面：
![2021-05-27-18-16-22](https://buff.tokiame.cn/hexo-images/2021-05-27-18-16-22.png)

点击下一步→修复计算机：
![2021-05-27-19-00-45](https://buff.tokiame.cn/hexo-images/2021-05-27-19-00-45.png)

依次点击疑难解答→命令提示符，进入命令行界面。没错，就是喜闻乐见的cmd：
![2021-05-27-19-01-49](https://buff.tokiame.cn/hexo-images/2021-05-27-19-01-49.png)
![2021-05-27-19-01-59](https://buff.tokiame.cn/hexo-images/2021-05-27-19-01-59.png)

输入diskpart运行磁盘管理工具。
![2021-05-27-19-04-10](https://buff.tokiame.cn/hexo-images/2021-05-27-19-04-10.png)

diskpart提供了比较丰富的磁盘管理功能，可以实现磁盘的初始化、分区新建、格式化、删除等功能。如果不熟悉diskpart，可以输入``help``显示帮助信息。

如图，使用``list disk``列出所有磁盘，然后根据返回的信息，输入``select disk 0``选中需要操作的磁盘:
![2021-05-27-19-08-31](https://buff.tokiame.cn/hexo-images/2021-05-27-19-08-31.png)

由于采用UEFI引导方式，故需要将磁盘初始化为GPT格式
```
DISKPART>convert gpt
DiskPart 已将所选磁盘成功地转换为 GPT 格式。
```

创建一个大小为512MB的EFI分区：
```
DISKPART>create partition efi size=512
DiskPart 成功地创建了指定分区。
```

再创建一个主分区，用于安装操作系统（如果不指定分区大小，将会使用所有剩余空间来创建分区）：
```
DISKPART>create partition primary
DiskPart 成功地创建了指定分区。
```

输入``list partition``，列出所有分区，确保无误：
![2021-05-27-19-18-41](https://buff.tokiame.cn/hexo-images/2021-05-27-19-18-41.png)

输入``exit``退出Diskpart，然后输入``setup.exe``，重新进入安装程序。

## 后续步骤
像往常一样正常安装Windows即可。
![2021-05-27-19-22-18](https://buff.tokiame.cn/hexo-images/2021-05-27-19-22-18.png)

# 参考文章
https://baike.baidu.com/item/diskpart/2340530?fr=aladdin#6
https://www.jianshu.com/p/8d63abf6a2b1
