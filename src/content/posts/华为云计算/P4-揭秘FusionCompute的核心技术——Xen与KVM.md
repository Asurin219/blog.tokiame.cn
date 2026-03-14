---
title: 'P4-揭秘FusionCompute的核心技术——Xen与KVM'
published: 2020-08-12
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2020-08-03-21-32-07.png'
tags:
  - '云计算'
category: '华为云计算'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
Xen和KVM都是开源的虚拟化软件，同时它们也是FusionCompute所采用的底层架构。为了方便我们后续对FusionCompute的学习，有必要对Xen和KVM进行初步理解。

# Xen vs KVM
## Xen
Xen的虚拟化架构如下：
![2020-08-12-15-51-55](https://buff.tokiame.cn/hexo-images/2020-08-12-15-51-55.png)
在Xen架构中，有两类虚拟机：Domain 0和Domain U。
**Domain 0：**属于控制域，是一台启动优先级最高、处于特权级别的虚拟机，用于对Domain U进行管理。全虚拟化场景下，Xen负责DomainU的CPU虚拟化和内存虚拟化，而Domain 0的后端驱动会主动捕获Domain U的I/O操作，通过硬件驱动去实现I/O虚拟化。而在半虚拟化场景下，Domain U的前端驱动可以主动将I/O请求发送给Domain 0的后端驱动，Domain 0通过硬件驱动直接访问硬件资源，实现I/O虚拟化。可以这么说，Domain 0全权负责Domian U的I/O虚拟化。
**Domain U：**普通的用户虚拟机

## KVM
KVM，全称Kernel-based Virtual Machine，意为“基于内核的虚拟机”。KVM的虚拟化架构如下：
![2020-08-12-16-24-43](https://buff.tokiame.cn/hexo-images/2020-08-12-16-24-43.png)
如今，QEMU-KVM一般都会统称为KVM，因为作者已经把QEMU集成到KVM模块中了。其中，QEMU是一个开源的纯虚拟化软件，运行在用户态，主要负责I/O虚拟化。而KVM是一个内核驱动模块，运行在内核态，负责虚拟机的CPU虚拟化和内存虚拟化。

# KVM体系架构
下图是一个基本的KVM体系架构：
![2020-08-12-16-53-27](https://buff.tokiame.cn/hexo-images/2020-08-12-16-53-27.png)
其中，Libvirt是一个开源的API库，支持C、Python、Go、Java等编程语言。另外，它几乎支持所有主流的虚拟化环境，如VMware ESXi、KVM、Hyper-v、Xen等，在云计算解决方案中使用最为广泛。在KVM中，上层的管理工具都会通过Libvirt，对KVM虚拟化环境进行统一调度、分配。运行时，Libvirt作为一个守护进程驻留在系统后台。

## KVM的IO操作流程
### 全虚拟化（默认）
![2020-08-12-18-02-15](https://buff.tokiame.cn/hexo-images/2020-08-12-18-02-15.png)
* 1-2：KVM主动捕获GuestOS的IO请求；
* 3：KVM模块将GuestOS的IO请求发送到IO共享页，并通知QEMU到IO共享页读取；
* 4：QEMU收到通知，并从IO共享页读取GuestOS的IO请求；
* 5-6：QEMU通过设备驱动，将IO请求交由硬件进行模拟执行；
* 7：执行完毕后，QEMU将IO执行结果返回到到IO共享页，并通知KVM模块到IO共享页进行读取；
* 8：KVM模块收到通知，并从IO共享页读取GuestOS的IO操作结果；
* 9-10：KVM模块将IO操作结果返回给GuestOS。

**缺点：采用同步机制，GuestOS需要主动等待KVM模块将IO共享页中的IO操作结果返回以后，才能继续发送下一条IO操作（即阻塞），性能差。**

### 半虚拟化（使用virtio驱动）
![2020-08-12-18-02-32](https://buff.tokiame.cn/hexo-images/2020-08-12-18-02-32.png)
**特点：前端驱动部署在GuestOS上，后端驱动部署在QEMU上。**
* 1-2：GuestOS主动将IO请求通过virtio前端驱动发送到virtio-ring（virtio的IO共享环），并通知QEMU到virtio-ring进行捕获；
* 3：QEMU收到通知，并通过virtio后端驱动从virtio-ring读取GuestOS的IO请求；
* 4-5：QEMU通过设备驱动，将IO请求交由硬件进行模拟执行；
* 6：执行完毕后，QEMU将IO执行结果返回到virtio-ring，并通知KVM模块到virtio-ring进行读取；
* 7：KVM模块收到通知，并从virtio-ring读取GuestOS的IO操作结果；
* 8：KVM模块将IO操作结果返回给GuestOS。

**特点：采用异步机制，GuestOS将IO请求批量发送到virtio-ring而无需等待，供QEMU的virtio后端驱动批量读取执行，而GuestOS无需等待执行可以批量从virtio-ring中读取IO操作结果（非阻塞），大幅提升了性能。**