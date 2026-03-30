---
title: 'FusionAccess系列（一）：最小化部署FusionAccess实验环境'
published: 2020-05-18
description: ''
image: 'https://cdn.tokiame.cn/2020-05-18-16-54-15.jpg'
tags:
  - '虚拟化'
  - '桌面云'
  - '服务器'
  - '华为'
category: '瞎折腾'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
最近在备考云ip的内容，恰好需要部署一套环境来满足学习需要。下面将介绍FusionAccess桌面云实验环境的搭建过程。
在开始之前，先简单介绍下华为的FusionAccess（卖了个广告）。“华为云™FusionAccess桌面云解决方案是基于华为FusionSphere的一种虚拟桌面应用，通过在云平台上部署软、硬件，使终端用户通过瘦客户端或者其他任何与网络相连的设备来访问跨平台的应用程序，以及整个客户桌面。”
# 准备工作
{% note warning %}
**注意**：
本文的实验是基于上一篇文章中的FusionCompute基础环境[[传送门]](https://www.unlinus.cn/2020/05/13/%E4%BD%BF%E7%94%A8CentOS%208%20Cockpit+KVM%E6%90%AD%E5%BB%BAFusionCompute%E5%AE%9E%E9%AA%8C%E7%8E%AF%E5%A2%83/)来进行的。由于篇幅有限，故不再过多介绍FusionCompute的搭建步骤。
{% endnote %}

## 软件准备
文件名称|说明
-|-
FusionAccess_Manager_Installer_6.5.0.iso|FusionAccess基础架构节点安装镜像
FusionAccess_WindowsDesktop_Installer_6.5.0.iso|Windows配套软件包镜像

## 节点、网络规划
所有节点均部署在同一个局域网内（局域网内必须关闭DHCP！）。硬件设备和上一期文章一样，都是一台破笔记本+老台式机。考虑到FusionAccess疯狂吃内存的特（兽）性（行），特地给台式机加多了一条4G内存（内存还是从我姐电脑上抠下来的= =）。

节点名称|节点类型|IP地址|默认网关|
-|-|-|-|
CNA|计算节点代理|10.6.0.50/24|10.6.0.254
VRM|虚拟化资源管理|10.6.0.60/24|10.6.0.254
ITA-HDC-WI|桌面云基础架构节点|10.6.0.70/24|10.6.0.254
AD&DNS&DHCP|AD&DNS&DHCP|10.6.0.80/24|10.6.0.254

# 部署AD、DNS、DHCP服务器：
使用VMware Workstation创建一台虚拟机，并安装好**Windows Server 2012 R2 DataCenter**操作系统。配置好网络、主机名，然后将系统重启：
![2020-05-18-18-52-26](https://cdn.tokiame.cn/2020-05-18-18-52-26.png)
![2020-05-18-18-48-55](https://cdn.tokiame.cn/2020-05-18-18-48-55.png)

打开服务器管理器，添加角色和服务，选择Active Directory域服务、DNS服务器、DHCP服务器这三个角色：
![2020-05-18-19-22-15](https://cdn.tokiame.cn/2020-05-18-19-22-15.png)

一直点击下一步，直至开始安装（勾选自动重新启动目标服务器）：
![2020-05-18-19-23-54](https://cdn.tokiame.cn/2020-05-18-19-23-54.png)

## 配置域服务、域用户等信息
### 域控制器安装
安装完成后，开始配置域。点击“将此服务器提升为域控制器”：
![2020-05-18-19-41-47](https://cdn.tokiame.cn/2020-05-18-19-41-47.png)

添加新林，域名称自定义（需符合域名格式）。分别配置DSRM密码、NetBIOS域名、文件保存位置等参数（基本上保持默认、点击下一步即可）
![2020-05-18-19-43-13](https://cdn.tokiame.cn/2020-05-18-19-43-13.png)
![2020-05-18-19-44-39](https://cdn.tokiame.cn/2020-05-18-19-44-39.png)
![2020-05-18-19-46-59](https://cdn.tokiame.cn/2020-05-18-19-46-59.png)
![2020-05-18-19-47-27](https://cdn.tokiame.cn/2020-05-18-19-47-27.png)
![2020-05-18-19-48-40](https://cdn.tokiame.cn/2020-05-18-19-48-40.png)

检查配置是否正确，确认无误后开始安装域控制器。安装完成后会自动重启：
![2020-05-18-19-50-18](https://cdn.tokiame.cn/2020-05-18-19-50-18.png)
![2020-05-18-19-50-42](https://cdn.tokiame.cn/2020-05-18-19-50-42.png)

### 域管理员账户配置
打开Active Directory用户和计算机，新建组织单位（OU）：
![2020-05-18-20-15-35](https://cdn.tokiame.cn/2020-05-18-20-15-35.png)
![2020-05-18-20-16-09](https://cdn.tokiame.cn/2020-05-18-20-16-09.png)

右键单击该OU，新建用户vdsadmin，用于后期与FusionAccess进行对接：
![2020-05-18-20-18-10](https://cdn.tokiame.cn/2020-05-18-20-18-10.png)
![2020-05-18-20-19-01](https://cdn.tokiame.cn/2020-05-18-20-19-01.png)

将vdsadmin用户设为委派控制用户，如下图操作：
![2020-05-18-20-25-42](https://cdn.tokiame.cn/2020-05-18-20-25-42.png)
![2020-05-18-20-26-58](https://cdn.tokiame.cn/2020-05-18-20-26-58.png)
![2020-05-18-20-27-51](https://cdn.tokiame.cn/2020-05-18-20-27-51.png)

设置该委派控制用户的任务，选中“创建自定义任务去委派”，单击“下一步”：
![2020-05-18-20-29-13](https://cdn.tokiame.cn/2020-05-18-20-29-13.png)

选中“这个文件夹，这个文件夹中的对象，以及创建在这个文件夹中的新对象”，单击“下一步”：
![2020-05-18-20-29-43](https://cdn.tokiame.cn/2020-05-18-20-29-43.png)

选中“特定子对象的创建/删除”，在“权限”区域，选择“创建 计算机 对象”和“删除 计算机 对象”，单击“下一步”：
![2020-05-18-20-33-03](https://cdn.tokiame.cn/2020-05-18-20-33-03.png)

### 配置备份路径和远程协助：
将Windows配套软件包镜像`FusionAccess_WindowsDesktop_Installer_6.5.0.iso`挂载给该虚拟机。虚拟机内打开光驱，运行run.bat，点击扩展部署，安装Windwos备份工具：
![2020-05-18-20-43-56](https://cdn.tokiame.cn/2020-05-18-20-43-56.png)
![2020-05-18-20-44-49](https://cdn.tokiame.cn/2020-05-18-20-44-49.png)

配置备份文件路径（不能设置在系统盘所在目录），保存并退出即可：
![2020-05-18-21-02-24](https://cdn.tokiame.cn/2020-05-18-21-02-24.png)

## 配置DNS服务
### 配置反向解析
打开DNS管理器，右键单击反向查找区域，新建一个反向查找区域：
![2020-05-18-22-25-18](https://cdn.tokiame.cn/2020-05-18-22-25-18.png)

保持默认配置，一直点击下一步到此处，配置网络ID（网络地址）：
![2020-05-18-22-27-11](https://cdn.tokiame.cn/2020-05-18-22-27-11.png)

### 配置正向解析
展开正向查找区域，右键单击域名，添加一个主机记录（用于解析HDC）：
![2020-05-18-22-31-31](https://cdn.tokiame.cn/2020-05-18-22-31-31.png)

配置二级域名及其对应的IP地址（FusionAccess节点IP），**并创建相关的指针记录**：
![2020-05-18-22-33-53](https://cdn.tokiame.cn/2020-05-18-22-33-53.png)

查看添加的记录：
![2020-05-18-22-41-51](https://cdn.tokiame.cn/2020-05-18-22-41-51.png)

### 配置DNS服务器属性
仅侦听本机IP地址：
![2020-05-18-22-47-45](https://cdn.tokiame.cn/2020-05-18-22-47-45.png)

配置转发器（用于迭代查询，云主机需要访问外网时必须设置）
![2020-05-18-23-29-51](https://cdn.tokiame.cn/2020-05-18-23-29-51.png)

配置服务器选项（选配，如果云主机无需访问外网，需要禁用递归）
![2020-05-18-23-02-29](https://cdn.tokiame.cn/2020-05-18-23-02-29.png)

删除所有根域：
![2020-05-18-23-03-33](https://cdn.tokiame.cn/2020-05-18-23-03-33.png)

右键单击主机名，配置DNS老化和清理功能：
![2020-05-18-23-05-25](https://cdn.tokiame.cn/2020-05-18-23-05-25.png)
![2020-05-18-23-05-57](https://cdn.tokiame.cn/2020-05-18-23-05-57.png)
![2020-05-18-23-06-20](https://cdn.tokiame.cn/2020-05-18-23-06-20.png)

关闭IPv6协议：
![2020-05-18-23-10-49](https://cdn.tokiame.cn/2020-05-18-23-10-49.png)

在CMD输入以下命令，关闭隧道适配器：
```
netsh interface teredo set state disabled
netsh interface 6to4 set state disabled
netsh interface isatap set state disabled
```

## 配置DHCP服务
打开DHCP服务管理器，右键单击主机名，添加授权：
![2020-05-18-23-20-48](https://cdn.tokiame.cn/2020-05-18-23-20-48.png)

新建一个作用域，输入作用域名称、起始和结束IP地址、
![2020-05-18-23-19-37](https://cdn.tokiame.cn/2020-05-18-23-19-37.png)
![2020-05-18-23-22-10](https://cdn.tokiame.cn/2020-05-18-23-22-10.png)
![2020-05-18-23-22-33](https://cdn.tokiame.cn/2020-05-18-23-22-33.png)
（DHCP排除、租期等选项可以不用设置）

配置路由、DNS等选项（其余配置保持默认即可），激活作用域：
![2020-05-18-23-24-05](https://cdn.tokiame.cn/2020-05-18-23-24-05.png)
![2020-05-18-23-24-40](https://cdn.tokiame.cn/2020-05-18-23-24-40.png)
![2020-05-18-23-26-14](https://cdn.tokiame.cn/2020-05-18-23-26-14.png)
（注：首选分配的DNS必须是域服务器的IP地址！）

# 部署FusionAccess基础架构节点：
{% note warning %}
**注意**:
FusionAccess基础架构虚拟机，要求vCPU至少4个，内存至少12GB，磁盘至少40GB！
{% endnote %}

使用VMware Workstation创建一台虚拟机，并挂载基础架构服务器安装镜像，作为FusionAccess基础架构服务器。打开虚拟机电源进行安装：
![2020-05-18-17-51-10](https://cdn.tokiame.cn/2020-05-18-17-51-10.png)

配置节点网络、主机名、root密码等参数（和VRM的安装部署步骤基本一致），开始安装：
![2020-05-18-17-54-27](https://cdn.tokiame.cn/2020-05-18-17-54-27.png)
![2020-05-18-17-56-00](https://cdn.tokiame.cn/2020-05-18-17-56-00.png)
![2020-05-18-17-55-47](https://cdn.tokiame.cn/2020-05-18-17-55-47.png)
安装完成后将自动重启。

## 初始化ITA、GaussDB、HDC、WI、License等基础组件
{% note info %}
**提示：**
本教程中，FusionAccess的基础组件如ITA、WI、HDC、GaussDB等，均部署在该节点内（All in one）.
{% endnote %}
在命令行界面，使用root账号密码登录到ITA，开始部署FusionAccess基础组件（如果未出现FusionAccess界面，输入startTools运行即可）：
![2020-05-18-20-57-44](https://cdn.tokiame.cn/2020-05-18-20-57-44.png)

按照下图依次选择（图示为All in one安装步骤）：
![2020-05-18-21-05-32](https://cdn.tokiame.cn/2020-05-18-21-05-32.png)
![2020-05-18-21-09-06](https://cdn.tokiame.cn/2020-05-18-21-09-06.png)

输入本节点的IP地址，确认无误后回车，开始初始化组件：
![2020-05-18-21-09-29](https://cdn.tokiame.cn/2020-05-18-21-09-29.png)
![2020-05-18-21-10-29](https://cdn.tokiame.cn/2020-05-18-21-10-29.png)


## 初步配置ITA
初始化完成后，使用浏览器访问`https://<ITA节点IP>:8448`登录FusionAccess管理后台:（默认用户名为*admin*，密码为*Cloud2#$*）：
![2020-05-18-21-22-19](https://cdn.tokiame.cn/2020-05-18-21-22-19.png)

初次登录需要修改默认密码：
![2020-05-18-21-23-53](https://cdn.tokiame.cn/2020-05-18-21-23-53.png)

对接FusionCompute平台，输入VRM节点的IP地址，以及用于对接FusionAccess的用户名和密码，点击下一步（默认用户为*vdisysman*，密码为*VdiEnginE@234*）：

![2020-05-18-21-31-40](https://cdn.tokiame.cn/2020-05-18-21-31-40.png)

对接域服务器，输入域名称、域管理员账号、域服务器IP等信息，点击下一步：
![2020-05-18-21-37-37](https://cdn.tokiame.cn/2020-05-18-21-37-37.png)

{% note danger %}
**小坑：**
一定要保证所有节点之间的时间同步（或时间跳变不超过3min）！否则会影响服务运行，如图：
![2020-05-18-21-55-40](https://cdn.tokiame.cn/2020-05-18-21-55-40.png)

使用命令修改系统日期，并将日期写入BIOS(注意格式)：
```
date -s "2020-05-18 22:05:00"
hwclock -w
```
{% endnote %}

其余配置保持默认即可，一直点击下一步：
![2020-05-18-22-10-22](https://cdn.tokiame.cn/2020-05-18-22-10-22.png)
![2020-05-18-22-10-39](https://cdn.tokiame.cn/2020-05-18-22-10-39.png)

检查配置无误后，点击提交：
![2020-05-18-22-12-01](https://cdn.tokiame.cn/2020-05-18-22-12-01.png)

配置完成：
![2020-05-18-22-39-12](https://cdn.tokiame.cn/2020-05-18-22-39-12.png)

# 未完待续...
以上内容只介绍了一个最基本、最小化的FusionAccess环境搭建过程。后续我会继续补充桌面云管理平台的使用教程。