---
title: '利用闲置台式机搭建FusionCompute实验环境'
published: 2020-05-11
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2020-05-10-20-15-49.png'
tags:
  - '虚拟化'
  - '服务器'
  - '云计算'
  - '华为'
category: '瞎折腾'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
{% note info %}
**提示**
本文适合有一定云计算、虚拟化、华为HCIP-CloudComputing基础知识的人群食用。
{% endnote %}

FusionCompute是华为基于Linux+KVM研发的一个虚拟化套件，用于实现硬件资源的虚拟化，以及对虚拟化资源进行集中调度和管控，是华为FusionSphere解决方案的重要组成部分之一。为了学习这方面的内容，搭建一个简单可用的FusionSphere实验环境是非常有必要的（为什么我强调可用呢，继续往下看）。

华为已经在去年公布了最新版FusionCompute实验环境的搭建方案，大体思路是：在Ubuntu上部署KVM作为Hypervisor，然后在KVM上搭建FusionCompute。本人有幸在专业实训周对这个方案进行了验证，（当时是在VMware Workstation上安装Ubuntu，在Ubuntu里面安装KVM跑FusionCompute，层层嵌套，电脑配置就4核8G = =），让我彻底明白了原来没有服务器也能学云计算，妈妈再也不用担心我找不到服务器！

# 准备工作
{% note warning %}
**提示**
FusionCompute从6.X版本开始，底层架构已经更改为Linux+KVM，不再是Citrix Xen。
{% endnote %}

{% note danger %}
**巨坑** 
经本人多次试验，FusionCompute 6.X可以直接安装在VMware Workstation、Oracle VirtualBox、VMware ESXi等虚拟化软件（平台）上，但是后期没法正常使用（比如：VRM虚拟化部署失败、找不到计算资源等），搭了半天等于白干= =
{% endnote %}
## 硬件准备
用Ubuntu嵌套部署FusionCompute显然是可行的。然而，鉴于其配置过程太过繁琐等原因（本人懒癌晚期/手动滑稽），将FusionCompute部署在物理机上是再简单不过的事情了。以下是本人的实验环境：
* **硬件配置：**

设备|处理器|内存|磁盘|网络
-|-|-|-|-
台式机|AMD-FX8300|杂牌DDR3 1600，8GB+4GB+4GB|杂牌120GB固态，希捷1TB机械盘|1GE网口
笔记本|Intel i5-8250u|渣士顿DDR4 2400，8GB×2|渣士顿120GB固态，西数500GB机械盘+日立500GB机械盘组RAID 0|1GE网口

* **新冠时期的实验环境，唉~太难了**
![2020-05-12-14-05-54](https://buff.tokiame.cn/hexo-images/2020-05-12-14-05-54.jpg)

## 软件准备
{% note info %}
**提示**
本文采用的FusionCompute版本为8.0，最新版。
{% endnote %}
* **看表，别看我：**

文件名称|说明
-|-
FusionCompute_Installer-8.0.0.zip|FusionCompute安装程序（用于远程部署）
FusionCompute_CNA-8.0.0-X86_64.iso|CNA节点安装镜像
FusionCompute_VRM-8.0.0-X86_64.iso|VRM节点安装镜像

## 网络规划
这里我将台式机作为CNA节点，部署FusionCompute(裸机安装)，笔记本利用VMware Workstation创建虚拟机，用来部署VRM节点、IPSAN（因为台式机的机械盘资料太多了不敢乱动...所以这里加一台IPSAN为FFusionCompute提供存储）。因为手头没有光驱，而且这FusionCompute不能用U盘安装，所以CNA节点我会采用PXE部署（把路由器的DHCP服务临时关一下吧，一定要保证本地局域网内没有其他DHCP服务的干扰！）。网络规划如下：

* **拓扑图**

![2020-05-10-22-40-36](https://buff.tokiame.cn/hexo-images/2020-05-10-22-40-36.png)

* **节点网络配置**

节点名称|说明|节点类型|IP地址|默认网关|
-|-|-|-|-|
CNA|计算节点代理|物理机，即台式机|10.6.0.10/24|10.6.0.254
VRM|虚拟化资源管理|虚拟机，部署在笔记本上|10.6.0.60/24|10.6.0.254
IPSAN|iSCSI服务器|虚拟机，部署在笔记本上|10.6.0.100/24|10.6.0.254

# 开始部署FusionCompute
## 准备FusionCompute Installer
将FusionCompute Installer解压到文件夹后运行exe安装程序：
{% note info %}
**纠正**
计划有变，VRM节点部署在了笔记本的虚拟机上，只勾主机就OK了，VRM不用勾选。
{% endnote %}
![2020-05-10-23-05-27](https://buff.tokiame.cn/hexo-images/2020-05-10-23-05-27.png)

实验环境，典型安装即可：
![2020-05-10-23-06-13](https://buff.tokiame.cn/hexo-images/2020-05-10-23-06-13.png)

设置软件包路径，点击浏览，定位到CNA节点安装镜像所在的文件夹，点击开始检测，检查完毕后点击下一步→下一步：
![2020-05-10-23-09-57](https://buff.tokiame.cn/hexo-images/2020-05-10-23-09-57.png)

## 通过PXE部署CNA节点
配置DHCP服务等信息，检查无误后点击配置服务（一定要保证本地局域网内没有其他DHCP服务的干扰！一定要保证本地局域网内没有其他DHCP服务的干扰！一定要保证本地局域网内没有其他DHCP服务的干扰！）配置成功后点下一步：
![2020-05-10-23-11-04](https://buff.tokiame.cn/hexo-images/2020-05-10-23-11-04.png)

前片已经配好DHCP服务了，接下来把台式机的电源打开，第一引导设置为PXE（引导模式必须是Legacy！如果不知道怎么设置引导，请自行百度各厂商主板BIOS的设置教程）
![2020-05-12-14-06-21](https://buff.tokiame.cn/hexo-images/2020-05-12-14-06-21.jpg)

电脑正从PXE开始引导：
![2020-05-12-14-06-34](https://buff.tokiame.cn/hexo-images/2020-05-12-14-06-34.jpg)

稍等片刻后，FusionCompute Installer会发现PXE引导的主机，此时点击开始安装，正式开始部署CNA节点的操作系统。CNA的部署要花几分钟甚至更长时间（得看机子体质如何），请耐心等待：
![2020-05-10-23-20-30](https://buff.tokiame.cn/hexo-images/2020-05-10-23-20-30.png)

当FusionCompute Installer显示的主机安装状态为安装完成时，点击下一步。因为这里实验环境只部署一台CNA，所以这里点确定，进入VRM的安装过程：
![2020-05-10-23-24-31](https://buff.tokiame.cn/hexo-images/2020-05-10-23-24-31.png)

## 在VMware Workstation上部署VRM节点
{% note info %}
**提示**
原计划是将VRM部署在CNA上的，但由于中途出现了一些意外，所以这里直接将VRM安装在笔记本的虚拟机上了。
{% endnote %}
使用VMware Workstation创建一台虚拟机并挂载VRM安装镜像，作为VRM节点（性能配置至少4核5GB，硬盘120GB以上）：
![2020-05-10-23-30-12](https://buff.tokiame.cn/hexo-images/2020-05-10-23-30-12.png)

启动虚拟机，引导完成后开始进行各方面配置（使用↑、↓、←、→、Tab、Enter进行选择）：
1.配置网络
![2020-05-10-23-35-46](https://buff.tokiame.cn/hexo-images/2020-05-10-23-35-46.png)

![2020-05-10-23-35-37](https://buff.tokiame.cn/hexo-images/2020-05-10-23-35-37.png)

这里的Default Gateway一定要配！否则跨网段的话无法访问VRM：
![2020-05-10-23-36-04](https://buff.tokiame.cn/hexo-images/2020-05-10-23-36-04.png)

2.root密码配置
![2020-05-10-23-36-45](https://buff.tokiame.cn/hexo-images/2020-05-10-23-36-45.png)

检查配置，确认无误后点OK，OK，OK...开始安装VRM：
![2020-05-10-23-36-30](https://buff.tokiame.cn/hexo-images/2020-05-10-23-36-30.png)

![2020-05-10-23-41-50](https://buff.tokiame.cn/hexo-images/2020-05-10-23-41-50.png)

#配置FusionCompute
## 配置VRM
### 初次登录
安装完成后会自动重启。重启完成后稍等片刻，打开浏览器，通过VRM的IP地址访问VRM。初次登录的用户名为admin，密码为IaaS@PORTAL-CLOUD8!（这密码又长又臭= =），且初次登录会要求修改密码（这安全设定可以的，就是有点废手= =）。

{% note primary %}
**奇淫技巧**
浏览器按F12，审查密码输入框元素，将onpaste="return false;"改为onpaste="return true;"就可以随意粘贴密码了。引自[弹霄博科](https://www.txisfine.cn/archives/a66280b7.html)提供的解决方法。
{% endnote %}

![2020-05-10-23-48-39](https://buff.tokiame.cn/hexo-images/2020-05-10-23-48-39.png)

![2020-05-10-23-48-47](https://buff.tokiame.cn/hexo-images/2020-05-10-23-48-47.png)

成功登录到VRM：
![2020-05-10-23-48-55](https://buff.tokiame.cn/hexo-images/2020-05-10-23-48-55.png)

### 创建FusionCompute集群
展开左侧栏图标，找到资源池，右键单击，创建集群：
![2020-05-10-23-50-24](https://buff.tokiame.cn/hexo-images/2020-05-10-23-50-24.png)

为集群进行一些基础配置：
![2020-05-10-23-52-41](https://buff.tokiame.cn/hexo-images/2020-05-10-23-52-41.png)

![2020-05-10-23-52-51](https://buff.tokiame.cn/hexo-images/2020-05-10-23-52-51.png)

![2020-05-10-23-53-27](https://buff.tokiame.cn/hexo-images/2020-05-10-23-53-27.png)

![2020-05-10-23-53-36](https://buff.tokiame.cn/hexo-images/2020-05-10-23-53-36.png)

### 为集群添加CNA节点
右键单击集群，添加主机，输入CNA节点的网络信息：
![2020-05-10-23-54-26](https://buff.tokiame.cn/hexo-images/2020-05-10-23-54-26.png)

### 为集群添加IPSAN存储
{% note warning %}
**提示**
本文IPSAN节点是在CentOS 7下基于软件实现的，由于内容超出本文范围，IPSAN的安装配置过程这里不一一叙述。
{% endnote %}
为集群添加IPSAN存储，首先要添加存储资源。输入IPSAN服务器的IP地址（管理IP和存储IP一致即可），勾选关联主机：
![2020-05-11-00-00-42](https://buff.tokiame.cn/hexo-images/2020-05-11-00-00-42.png)

![2020-05-11-00-01-06](https://buff.tokiame.cn/hexo-images/2020-05-11-00-01-06.png)

在集群内扫描所有存储设备：
![2020-05-11-00-01-40](https://buff.tokiame.cn/hexo-images/2020-05-11-00-01-40.png)

将IPSAN作为数据存储进行添加：
![2020-05-11-00-01-56](https://buff.tokiame.cn/hexo-images/2020-05-11-00-01-56.png)

![2020-05-11-00-02-08](https://buff.tokiame.cn/hexo-images/2020-05-11-00-02-08.png)

# 后记
## 大学时期的实训环境
怀念那段天天撸服务器撸到爽的日子...
![2020-05-12-14-06-57](https://buff.tokiame.cn/hexo-images/2020-05-12-14-06-57.jpg)
![2020-05-12-14-07-03](https://buff.tokiame.cn/hexo-images/2020-05-12-14-07-03.jpg)

## 总结
FusionCompute的部署的方式有好几种，本文介绍的只是万不得已的情况下采用的部署方法，整个部署过程还是比较简单的，当然这个简单是要建立在一定的理论基础和动手实践能力之上的。

只要思想不滑坡，办法总比困难多，HCIE身上纹，掌声送给社会人（假装我有HCIE/狗头保命）。