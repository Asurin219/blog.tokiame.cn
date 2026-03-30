---
title: '使用CentOS 8 Cockpit+KVM搭建FusionCompute实验环境'
published: 2020-05-13
description: ''
image: 'https://cdn.tokiame.cn/2020-05-13-14-40-35.jpg'
tags:
  - '虚拟化'
  - '云计算'
  - '华为'
  - 'CentOS'
category: '瞎折腾'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
前面已经介绍过如何用闲置台式机来部署FusionCompute了。但是讲真，哪有那么多空闲的机子做这种实验呢？而且我相信大多数人都不会愿意，为了做个实验，把自己的电脑硬掰成一台服务器来用（除了笔者这位傻蛋）。
So！笔者以华为官方发布的FusionCompute实验环境搭建方案为参考，在其基础上进行了一些改进，现在决定把这个方案分享给大家。

# 前期准备
本文标题或许可以改成《没钱没服务器也能玩转FusionCompute系列》，但是FusionCompute毕竟还是你的大爷，电脑配置不好点的话还是搞不动滴！

## 硬件准备
{% note warning %}
**注意**
FusionCompute要求CPU核心数量（或线程数量）至少要2个以上，内存容量至少8G，磁盘空间至少80GB，这些都是硬性要求。加上本机操作系统和虚拟机的性能损耗，想要把FusionCompute玩起来的话，机子配置至少也得有4核以上的CPU+16G内存，磁盘可用空间大于120GB！
{% endnote %}

设备|处理器|内存|磁盘|网络
-|-|-|-|-
台式机|AMD-FX8300|杂牌DDR3 1600，8GB+4GB+4GB|杂牌120GB固态，希捷1TB机械盘|1GE网口
笔记本|Intel i5-8250u|渣士顿DDR4 2400，8GB×2|渣士顿120GB固态，西数500GB机械盘+日立500GB机械盘组RAID 0|1GE网口

## 软件准备
* **必备:**
1. VMware Workstation 15.5
2. CentOS 8.1.1911系统镜像
3. XShell 6（虚拟终端软件，用来SSH远程虚拟机）

* **华为FusionCompute软件包:**

文件名称|说明
-|-
FusionCompute_Installer-6.5.1.zip|FusionCompute安装程序（用于远程部署）
FusionCompute_6.5.1_CNA.iso|CNA节点安装镜像
FusionCompute_6.5.1_VRM.iso|VRM节点安装镜像

## 网络规划
* 如图（虚拟化层层嵌套，问你怕未！）
![2020-05-13-17-14-53](https://cdn.tokiame.cn/2020-05-13-17-14-53.png)

* 简化以后其实拓扑就长这样而已：
![2020-05-13-17-28-26](https://cdn.tokiame.cn/2020-05-13-17-28-26.png)

**思路:** 笔记本用VMware Workstation开一台CentOS 8虚拟机，然后在CentOS 8内安装KVM，在KVM上部署CNA节点。然后，台式机用VMware Workstation开一台虚拟机，专门部署VRM节点。为了保证同网段互通，虚拟机全部采用**桥接模式**。

# 安装&配置底层操作系统（CentOS 8.1）
{% note warning %}
**注意！**
物理机必须在BIOS内打开处理器虚拟化功能！如果不知道如何操作，请自行百度！
{% endnote %}

使用VMware Workstation新建一台虚拟机，配置如下：
![2020-05-14-03-11-04](https://cdn.tokiame.cn/2020-05-14-03-11-04.png)

打开虚拟机电源，安装好CentOS 8.1，这个大家应该都会的，不用多说吧！
{% note warning %}
**注意！**
为了减少不必要的性能损耗，不需要装GUI！不需要装GUI！不需要装GUI！
{% endnote %}
![2020-05-13-17-35-38](https://cdn.tokiame.cn/2020-05-13-17-35-38.jpg)
安装完成后，使用XShell登录到CentOS 8.1，就可以开始进入以下步骤了。

## 配置虚拟化环境
{% note warning %}
**注意！**
一定要把VMware Workstation虚拟机的嵌套虚拟化功能打开！如下图：
![2020-05-13-17-58-44](https://cdn.tokiame.cn/2020-05-13-17-58-44.png)
虚拟机开机后，输入以下命令，根据输出的数值检查系统是否支持虚拟化：
```
egrep -c '(vmx|svm)' /proc/cpuinfo
8
```
如果返回数值＞0（返回数值=VMware Workstation为虚拟机分配的vCPU数量），说明系统已经支持虚拟化。
{% endnote %}

安装虚拟化环境组（里面包含了libvirt、QEMU-KVM等虚拟化必备组件）：
```
dnf groupinstall "Virtualization Host"
```

启动libvirt服务(亲测无需enable，安装完成后已经自动设置为开机启动了)
```
systemctl start libvirtd
```

输入以下命令，根据输出的数值判断嵌套虚拟化是否已激活：
```
cat /sys/module/kvm_intel/parameters/nested
0
```
可见输出结果为0，因为嵌套虚拟化默认情况下是不开启的。我们在`/etc/modprobe.d/`下新增一个配置文件`kvm_intel.conf`，加入以下内容，保存并退出：
```
options kvm-intel nested=1
options kvm-intel enable_shadow_vmcs=1
options kvm-intel enable_apicv=1
options kvm-intel ept=1
```
卸载、重新激活kvm_intel模块：
```
modprobe -r kvm_intel
modprobe -a kvm_intel
```
再次检查嵌套虚拟化是否已激活：
![2020-05-13-18-17-00](https://cdn.tokiame.cn/2020-05-13-18-17-00.png)

## 配置网络
{% note warning %}
**注意！**
Linux网卡名称不是所有人都一样的，别一股脑儿复制粘贴！
{% endnote %}
为了保证虚拟机能够正常与外部通信，这里需要配置一个网桥并桥接到外网网卡。网桥可以看成是一台二层交换机，绑定了一个或多个物理网卡（或虚拟网卡），和二层交换机一样具有MAC地址学习、报文转发的功能。网桥配置完成后，主机及连接到该网桥的虚拟机需要与外网通信时，首先会经过该网桥，这就相当于多台电脑连接到一台交换机，通过交换机连接外网进行通信。（如果你熟悉VMware Workstation的桥接网卡，应该也就不难理解了）

首先将原网卡配置文件复制一份并重命名为br0，作为桥接网卡配置文件，然后进行修改：
```
cd /etc/sysconfig/network-scripts
cp ifcfg-ens32 ifcfg-br0
vim ifcfg-br0
```
```
TYPE=Bridge         #将类型Ethernet修改为Bridge，即桥模式
BOOTPROTO=static
DEVICE=br0          #将设备名更改为br0
ONBOOT=yes
IPADDR=10.6.0.46
NETMASK=255.255.255.0
GATEWAY=10.6.0.254
DNS1=223.5.5.5  
DNS2=119.29.29.29
```

修改Linux网卡配置文件：
```
vim /etc/sysconfig/network-scripts/ifcfg-ens32
```
```
TYPE=Ethernet
BOOTPROTO=none
DEVICE=ens32
ONBOOT=yes
BRIDGE=br0           #指定网桥，连接到本网卡
```

修改完成后，保存并退出，然后重新启动网卡：
```
nmcli c reload ens32
```

使用`ip ad`查看网络配置信息：
![2020-05-13-19-52-22](https://cdn.tokiame.cn/2020-05-13-19-52-22.png)

## 初次使用Cockpit
{% note info %}
**Tips：**
从CentOS 8开始，系统已经默认内置了Cockpit。Cockpit是一个Web控制台，为用户提供了图形化管理界面，可以实现系统资源监控、添加或删除帐户、电源管理等功能。
{% endnote %}
Cockpit默认是处于关闭状态的，我们现在启用Cockpit，并设置为开机自启：
```
systemctl enable --now cockpit.socket
```

关闭防火墙和SELinux（生产环境下不建议这么做）：
```
systemctl disable --now firewalld
sed -i "s/enforcing/disabled/g" /etc/selinux/config
setenforce 0
```

打开浏览器，输入`https://<Linux IP地址>:9090`访问Cockpit，使用系统root账号密码进行登录：
![2020-05-13-18-39-44](https://cdn.tokiame.cn/2020-05-13-18-39-44.png)
![2020-05-13-18-40-42](https://cdn.tokiame.cn/2020-05-13-18-40-42.png)

# 通过Linux Cockpit部署虚拟机
## 安装虚拟机组件cockpit-machines
接下来会使用Cockpit来管理KVM虚拟机。安装Cockpit虚拟机组件：
```
dnf install cockpit-machines -y
```

重启libvirtd服务：
```
systemctl restart libvirtd
```

## 创建虚拟机
登录Cockpit，点击左侧栏“虚拟机”，右侧窗口点击“创建虚拟机”：
![2020-05-13-20-36-08](https://cdn.tokiame.cn/2020-05-13-20-36-08.png)

设置虚拟机参数（我已经事先把CNA的安装镜像上传到/opt目录下了）：
![2020-05-13-22-12-52](https://cdn.tokiame.cn/2020-05-13-22-12-52.png)

可以看到虚拟机已经成功创建。

## 配置虚拟机CPU、内存、网络、磁盘等参数
接下来设置虚拟机CPU参数：
{% note warning %}
**提示：**
vCPU数量不要超过6个！FusionCompute基础版免费授权的CPU数量为6个，超过这个限度就等着过期吧！
{% endnote %}
![2020-05-13-20-42-51](https://cdn.tokiame.cn/2020-05-13-20-42-51.png)
![2020-05-14-13-21-35](https://cdn.tokiame.cn/2020-05-14-13-21-35.png)

接下来，将VMware Workstation分配给CentOS的256G的虚拟磁盘直通给CNA使用。为什么要用到磁盘直通呢？我们可以看到，部署CNA这台KVM虚拟机经过了2层虚拟化（第一层是VMware Workstation，第二层是QEMU-KVM）。下图表示的是在CentOS内将这块256G磁盘进行格式化，然后在该磁盘上创建一块QCOW2虚拟磁盘供KVM虚拟机使用：
![2020-05-13-21-42-28](https://cdn.tokiame.cn/2020-05-13-21-42-28.png)

这样会带来什么问题呢？虽然KVM虚拟机能够正常使用，但是虚拟磁盘经过多层嵌套后，磁盘性能会大打折扣。解决办法就是让KVM虚拟机不经过CentOS的文件系统，直接对这块256GB的磁盘进行读写，也就是磁盘直通，如图：
![2020-05-13-21-55-02](https://cdn.tokiame.cn/2020-05-13-21-55-02.png)

配置方法也比较简单，只需要在该虚拟机的配置文件进行修改即可。默认情况下，KVM虚拟机的配置文件保存在`/etc/libvirt/qemu/`目录下，文件后缀名为.xml。编辑虚拟机配置文件：
```
vim /etc/libvirt/qemu/CNA.xml
```
{% note warning %}
**注意！**
根据虚拟机的实际情况进行配置。另外，编辑配置文件的时候一定要注意代码缩进。
{% endnote %}
```
<disk type='block' device='disk'>     <!--磁盘类型为块，设备为磁盘-->
    <driver name='qemu' type='raw'/>  <!--驱动器名为qemu，驱动器类型为raw-->
    <source dev='/dev/sdb'/>          <!--源设备，即需要直通的磁盘设备路径-->
    <target dev='sdb' bus='scsi'/>
    <!--目标设备，即需要直通的磁盘设备，总线类型根据VMware Workstation创建的磁盘总线类型设置，我的是scsi-->
</disk>
```
编辑完成后保存并退出，然后使用`systemctl restart libvirtd`重新启动libvirt服务。回到Cockpit的虚拟机管理界面，我们会发现多了一块磁盘，也就是上述配置的直通磁盘：
![2020-05-13-22-29-14](https://cdn.tokiame.cn/2020-05-13-22-29-14.png)

## 启动虚拟机
在虚拟机页面处，点击Install开始部署虚拟机，稍等片刻后部署完成，虚拟机会自动打开电源：
![2020-05-13-22-51-20](https://cdn.tokiame.cn/2020-05-13-22-51-20.png)
看到这个界面，是不是觉得似曾相识？接下来就按照平常安装CNA节点的步骤进行操作就OK了！

# 开始部署FusionCompute
## 安装CNA节点
设置CNA的网络、主机名、root密码等参数：
![2020-05-13-22-56-37](https://cdn.tokiame.cn/2020-05-13-22-56-37.png)
![2020-05-13-22-57-00](https://cdn.tokiame.cn/2020-05-13-22-57-00.png)
![2020-05-13-22-57-37](https://cdn.tokiame.cn/2020-05-13-22-57-37.png)
![2020-05-13-22-58-10](https://cdn.tokiame.cn/2020-05-13-22-58-10.png)
![2020-05-13-22-58-48](https://cdn.tokiame.cn/2020-05-13-22-58-48.png)

## VRM节点配置（踩坑）
回顾：[利用闲置台式机搭建FusionCompute实验环境](https://www.unlinus.cn/2020/05/10/%E5%88%A9%E7%94%A8%E9%97%B2%E7%BD%AE%E4%B8%BB%E6%9C%BA%E6%90%AD%E5%BB%BAFusionCompute%E5%AE%9E%E9%AA%8C%E7%8E%AF%E5%A2%83/)

### 无法添加主机
在VRM部署完成以后，创建了集群，但是无法添加主机，出现以下报错：
![2020-05-13-23-43-30](https://cdn.tokiame.cn/2020-05-13-23-43-30.png)

解决方法是将CNA节点关机，将虚拟网卡型号改为e1000后重启CNA节点，问题解决！
![2020-05-13-23-57-02](https://cdn.tokiame.cn/2020-05-13-23-57-02.png)
**PS：千万千万不要手贱去改网卡型号！**

### 虚拟机打开电源失败
当主机添加完成后，成功创建一台虚拟机，但虚拟机打开电源失败，日志出现以下报错：
![2020-05-14-02-57-07](https://cdn.tokiame.cn/2020-05-14-02-57-07.png)

多次修改vCPU核心数、线程数、重新安装CNA，仍然无效。最终解决办法是：关闭CNA节点，修改虚拟机的xml配置文件，修改CPU工作模式，将`<cpu mode='host-model' check='partical'>`修改为`<cpu mode='host-passthrough' check='none'>`，保存退出，重新启动CNA节点后，问题解决：
![2020-05-14-03-33-24](https://cdn.tokiame.cn/2020-05-14-03-33-24.png)

后期经过查阅资料得知，**使用host-model模式，Libvirt会根据物理CPU的型号，从规定的CPU中选择一种最接近的CPU型号，而使用host-passthrough模式直接看到的就是物理CPU的型号**。 参考自[梦轻尘的博客](https://www.cnblogs.com/uglyliu/p/6066569.html)。

## 最终效果
费尽周折，最后总算把实验环境搭起来了。
![2020-05-14-03-41-15](https://cdn.tokiame.cn/2020-05-14-03-41-15.png)
![2020-05-14-03-40-47](https://cdn.tokiame.cn/2020-05-14-03-40-47.png)

# 总结
云计算是离不开Linux的。学习云计算，拥有良好的Linux基础十分重要。