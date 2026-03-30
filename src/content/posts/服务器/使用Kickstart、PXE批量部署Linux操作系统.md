---
title: '使用Kickstart+PXE批量部署Linux操作系统.md'
published: 2020-07-06
description: ''
image: 'https://cdn.tokiame.cn/2020-07-06-17-32-37.png'
tags:
  - 'Linux'
  - 'CentOS'
  - '运维'
  - '服务器'
  - '懒人'
category: '瞎折腾'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
相信大家都知道该怎么去安装Linux操作系统了，无非是通过U盘、光驱来安装，家里有矿的伙计已经开始用服务器BMC的远程控制台来安装操作系统了。但是！如果在一个生产环境里面，有成百上千台服务器正等着你去部署操作系统，如果仍然采用以上的方法来部署操作系统，大量重复、繁琐且毫无技术可言的操作将会使你身心疲惫，甚至逐步起了杀心（别问我怎么知道的）。

都0202年了，你们还会用传统方法给生产环境来部署操作系统吗？

# 关于无人值守安装
## 简介
>无人值守安装(Unattended Setup)是指软件安装时无需任何用户干预，直接按默认或通过应答文件设置安装，这对于无特殊需求的用户或企业大批量部署安装操作系统及软件时非常方便。
——引自[百度百科](https://baike.baidu.com/item/%E6%97%A0%E4%BA%BA%E5%80%BC%E5%AE%88%E5%AE%89%E8%A3%85/4253153?fr=aladdin)。

以前用过Ghost版系统的童鞋应该会知道，在安装Windows时，几乎不需要我们去设置安装系统的各种参数，这其实也算是无人值守安装的一种了。而本文给大家介绍的无人值守安装，是针对一个拥有成百上千台服务器的生产环境而言的，具体介绍请继续往下看。

## 所需技术
**1. PXE**
PXE不是一种安装方式，而是一种引导的方式。计算机可以通过PXE，从网络进行操作系统引导。PXE需要配合TFTP和DHCP使用。

**2. DHCP**
DHCP相信大家都不陌生，它的作用是为网络上的每台主机动态分配可用的IP地址。在一个局域网内，两台计算机要实现文件传输，IP地址是必不可少的。这也就不难理解，为何在PXE安装中需要用到DHCP服务了。

**3. TFTP**
同样是文件传输协议，和FTP不一样的是，TFTP免去了用户认证等功能，基于UDP进行文件传输，且不支持交互。在PXE安装时，会自动加载PXE ROM中的TFTP客户端，从远程服务器获取所需的驱动和引导文件。

# 开始部署
**实验环境：**
1. 两台主机，一台作为Server，安装CentOS7；另一台作为Client，不安装操作系统；
2. CentOS 7安装镜像；
3. 确保两台主机在同一网段，且**必须保证该网段内没有其他DHCP服务器的干扰**！

## 安装配置DHCP服务
安装DHCP服务：`yum install dhcp -y`
编辑DHCP配置文件：
```bash
vim /etc/dhcp/dhcpd.conf
```
```bash
allow booting;  /*允许引导*/
allow bootp;    /*允许BOOTP协议，使局域网内没有操作系统的主机也能获取IP地址*/
ddns-update-style interim;
ignore client-updates;
subnet 192.168.100.0 netmask 255.255.255.0 {    /*声明一个子网网段*/
        option subnet-mask      255.255.255.0;  /*子网掩码*/
        range dynamic-bootp 192.168.100.101 192.168.100.200;    /*IP地址分配范围*/
        default-lease-time      21600;      /*默认地址租期*/
        max-lease-time          43200;      /*最大地址租期*/
        next-server             192.168.100.100;    /*指定一台PXE引导服务器*/
        filename                "pxelinux.0";   /*加载引导驱动文件pxelinux.0*/
}
```
PS：如果需要跨多个子网分配IP地址，则还需要为网卡添加相应的子网IP，否则DHCP服务器将无法启动！

## 安装FTP服务
文章将使用HTTP作为Linux操作系统的安装源。安装Apache：`yum install vsftpd -y`

挂载CentOS7安装镜像到`/var/ftp/CentOS_7.2.1511`目录下:
```bash
mkdir -p /var/ftp/CentOS_7.2.1511
mount /dev/sr0 /var/ftp/CentOS_7.2.1511
```
启动FTP服务,并设置为开机自启：`systemctl enable --now vsftpd`
## 安装配置TFTP服务
安装DHCP服务：`yum install tftp-server xinetd -y`
编辑TFTP配置文件：
```bash
vim /etc/xinetd.d/tftp
```
```bash
service tftp
{
        socket_type             = dgram
        protocol                = udp
        wait                    = yes
        user                    = root
        server                  = /usr/sbin/in.tftpd
        server_args             = -s /var/lib/tftpboot
        disable                 = no    /*默认为yes，此处改为no*/
        per_source              = 11
        cps                     = 100 2
        flags                   = IPv4
}
```
## 准备好引导所需文件
### SYSLinux
SYSLinux是一个用于提供引导加载的服务程序，此处我们只需用到它里面的引导文件。安装SYSLinux软件包：
```bash
yum install syslinux -y
```

将一些必备的引导文件复制到`/var/lib/tftpboot/`目录下：
```bash
cp /var/ftp/CentOS_7.2.1511/syslinux/pxelinux.0 /var/lib/tftpboot/
cp /var/ftp/CentOS_7.2.1511/images/pxeboot/{vmlinuz,initrd.img} /var/lib/tftpboot/
cp /var/ftp/CentOS_7.2.1511/isolinux/{vesamenu.c32,boot.msg} /var/lib/tftpboot/
```

### Kickstart自动应答文件
自动应答文件可以在PXE安装操作系统时，帮助我们自动设置系统安装参数（包括网络配置、磁盘、密码等），减少人机交互。在Linux完成安装后，会在home目录下自动生成一个应答文件anaconda-ks.cfg，我们现在可以将这个应答文件利用起来。将anaconda-ks.cfg复制到`/var/ftp/Kickstart/`目录下，并重命名为CentOS.cfg：
```bash
mkdir -p /var/ftp/kickstart
cp ~/anaconda-ks.cfg /var/ftp/Kickstart/CentOS.cfg
chmod +r /var/ftp/Kickstart/CentOS.cfg  /*赋予执行权限*/
```
按需修改应答文件：
```bash
vim /var/ftp/Kickstart/CentOS.cfg
```
```bash
......
url --url=ftp://192.168.100.100/CentOS_7.2.1511    /*默认为CDROM，此处改为FTP安装源路径*/
```
{% note info %}
**提示！**
如果有图形界面，还可以安装system-config-kickstart，来进一步定制Kickstart！
{% endnote %}
### 引导菜单文件
在tftpboot下新建一个目录pxelinux.cfg（是目录不是文件！）
```bash
mkdir -p /var/lib/tftpboot/pxelinux.cfg
```

将启动菜单配置文件复制到pxelinux.cfg目录下，并重命名为default：
```bash
cp /var/ftp/CentOS_7.2.1511/isolinux/isolinux.cfg /var/lib/tftpboot/pxelinux.cfg/default
```

修改启动菜单，将linux作为默认引导项，系统安装形式改为http协议：
```bash
vim /var/lib/tftpboot/pxelinux.cfg/default
```
```bash
default linux    /*默认为vesamenu.c32，此处改为linux*/
......
label linux
  menu label ^Install CentOS 7
  kernel vmlinuz
  append initrd=initrd.img inst.stage2=ftp://192.168.100.100/CentOS_7.2.1511/ ks=ftp://192.168.100.100/Kickstart/CentOS.cfg
  /*默认安装源为本地光盘路径。本文安装源使用的是ftp，此处改为安装源的URL*/
......
```
## 最后阶段
启动所有服务：
```bash
systemctl enable --now dhcpd xinetd vsftpd
```
配置防火墙，放行TFTP、FTP所需端口：
```bash
firewall-cmd --permanent --add-port=69/udp
firewall-cmd --permanent --add-service=ftp
firewall-cmd --reload
```
设置SELinux为宽松模式：
```bash
setenforce 0
sed -i 's/enforcing/permissive/g' /etc/selinux/config
```

# 客户机测试
打开虚拟机电源。由于未安装操作系统，虚拟机将会自动从网络进行引导：
![2020-07-06-15-47-57](https://cdn.tokiame.cn/2020-07-06-15-47-57.png)

![2020-07-06-15-48-38](https://cdn.tokiame.cn/2020-07-06-15-48-38.png)

当出现下图所示界面以后，说明无人值守安装的基本配置已经成功，此时像往常一样进行系统安装操作即可：
![2020-07-06-16-03-02](https://cdn.tokiame.cn/2020-07-06-16-03-02.png)

# 总结
本文实现的无人值守安装只能算是半自动化部署方式，因为在安装过程中，还需要对安装的主机进行一些参数设置。在实际生产环境下，还需要根据服务器的硬件配置（例如磁盘容量等），来定制应答文件。总之，通过Kickstart+PXE批量部署操作系统，不仅能够将运维人员从重复性的工作中解放出来，还能极大地提升系统安装效率。