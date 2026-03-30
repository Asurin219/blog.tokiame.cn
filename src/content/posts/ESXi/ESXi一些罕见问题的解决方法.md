---
title: 'ESXi6.7一些罕见问题的解决方法'
published: 2020-04-28
description: ''
image: 'https://cdn.tokiame.cn/2020-04-29-23-59-15.png'
tags:
  - '服务器'
  - 'vSphere'
  - '故障'
  - '运维'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 起因
一大早睡得正香，突然被一通电话叫醒了（内心~~万马奔腾~~一万个不情愿）。“...昨晚停了一次电，服务器全都连不上了，网络有问题，过来帮忙看一下”。点开微信群一看，瞬间不淡定了：“工程师反映，系统远程不了了，网站也打不开”，“停电了，昨晚半夜供电局高压跳闸，我们的电池没能坚持下去”。这不意味着整个机房瞬间失去电力供应了？！

我连滚带爬坐到了电脑椅上，打开电脑，还能连接到机房VPN，说明出口网络还是通的。几经排查，原来是因为刀片服务器的交换机忘记保存配置，断电重启后部分配置失效了（一记耳光）。
# 第一个问题：VCSA无法访问

## 异常表现
排查过程中发现，VCSA访问不了了，提示**503 Service Unavailable(Failed to connect to endpoint...）**。

## 解决方法

第一反应告诉我，可能是VCSA的核心服务没能启动。按照网上大神的说法，需要SSH登录到VCSA，用命令行来启动核心服务。但是问题来了，这VCSA默认没打开SSH服务啊，还能怎么搞？
其实VCSA还有个设备管理功能（用于进行VCSA底层组件管理），可以通过浏览器访问`https://<VCSA IP>:5480：`进入：
![2020-04-29-23-20-11](https://cdn.tokiame.cn/2020-04-29-23-20-11.png)

![2020-04-29-23-23-46](https://cdn.tokiame.cn/2020-04-29-23-23-46.png)

果不其然，VCSA的好几个核心服务都没有启动。按照下图说明来启动相关服务，然后看看VCSA是不是能访问了？：
![2020-04-29-23-30-14](https://cdn.tokiame.cn/2020-04-29-23-30-14.png)

![2020-04-29-23-32-31](https://cdn.tokiame.cn/2020-04-29-23-32-31.png)

# 第二个问题：无法操作虚拟机
## 异常表现

一切尽在不言中：
![2020-04-29-23-35-50](https://cdn.tokiame.cn/2020-04-29-23-35-50.png)

还有无脑弹出的消息：
![2020-04-29-23-37-05](https://cdn.tokiame.cn/2020-04-29-23-37-05.png)

## 解决方法
同第一个问题一样，也是因VCSA服务异常造成的。把相关服务启动或者重新启动一遍就可以了。

# 总结
通常遇到以上问题时，重点关注这个几个服务的状态，如果处于异常或停止状态，只需把对应服务启动或重启就OK了：
* VMware vService Manager
* VMware vSphere Update Manager
* VMware PSC Health
* VMware vSphere Client
* VMware vSphere Web Client
* VMware vCenter Server
* VMware vCenter-Services

数据无价，双手合十，祈祷永不宕机，永不断电。