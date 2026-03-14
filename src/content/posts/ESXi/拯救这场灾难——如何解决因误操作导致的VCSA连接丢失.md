---
title: '拯救这场灾难——如何解决因误操作导致的VCSA连接丢失'
published: 2020-05-30
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2020-05-30-17-42-47.png'
tags:
  - '服务器'
  - 'vSphere'
  - '故障'
  - '踩坑'
  - '运维'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 开始唠嗑...
## 因强迫症埋下祸根...
昨天给部门的vSphere集群配置了分布式交换机（Distribute Switch），把所有虚拟机迁移到分布式端口组上了。好不容易把所有ESXi标准交换机（以下称vswitch0）的端口组删干净了，猛然发现：咋还有残留的端口组捏？！
![2020-05-30-17-43-51](https://buff.tokiame.cn/hexo-images/2020-05-30-17-43-51.png)
明明没有关联虚拟机，删又删不掉，看着又碍眼，干脆另起一个数据数据中心和群集，然后把所有ESXi节点重新转移过去！

然而事实证明这个决定是错误的。当我想把其中一个ESXi节点迁移到新的数据中心和集群时，频繁出现“不支持此操作”“端口20正在使用中”之类的提示。这时才想起，ESXi节点上都运行着Distribute Switch，而且虚拟机都占用着Distribute Switch上的分布式端口组：
![2020-05-30-17-44-59](https://buff.tokiame.cn/hexo-images/2020-05-30-17-44-59.png)
重新在vswitch0上创建标准端口组，然后把虚拟机迁移到vswitch0标准端口组，一场灾难从此拉开序幕...

## 灾难伊始
一番操作以后，发现VCSA跟所有ESXi节点失去连接了。突然才想起，vswitch0的上行链路不是分配给Distribute Switch了吗？也就是说，此时新建的标准端口组根本就没有上行链路，而VCSA虚拟机恰好在这个ESXi节点上运行......
![2020-05-30-16-05-11](https://buff.tokiame.cn/hexo-images/2020-05-30-16-05-11.png)

# 拯救任务开始
## A计划：急速还原
我还是太年轻了。
兴冲冲地登录了ESXi节点，找到VCSA虚拟机，然后编辑设置，把网络调回Distribute Switch的对应端口组，然后发现事情并不简单：
![2020-05-30-16-11-05](https://buff.tokiame.cn/hexo-images/2020-05-30-16-11-05.png)
好吧，A计划宣告失败。
{% note danger %}
**Tips：**
分布式交换机及其下属端口组只能由VCSA、vCenter进行配置！
{% endnote %}

## B计划：将计就计
如果两台虚拟机处于同一个端口组、同一个网段，这两台虚拟机不久可以互访了吗？
So，我把ESXi上的一台空闲虚拟机网络适配器分配到和VCSA相同的标准端口组，配好IP，在虚拟机里面打开浏览器，输入VCSA的IP地址：
![2020-05-30-16-18-39](https://buff.tokiame.cn/hexo-images/2020-05-30-16-18-39.png)

emm...再访问底层管理页面（https://<VCSA的IP地址>:5480）看看：
![2020-05-30-17-42-34](https://buff.tokiame.cn/hexo-images/2020-05-30-17-42-34.png)

我很好，只是有点小自闭而已~
![2020-05-30-16-21-06](https://buff.tokiame.cn/hexo-images/2020-05-30-16-21-06.png)

## C计划：重启大法
软的不行，就来硬的！
![2020-05-30-16-26-28](https://buff.tokiame.cn/hexo-images/2020-05-30-16-26-28.png)
经过漫长的等待（大约过了三四分钟的亚子= =），终于重启完了。考虑到VCSA刚启动不久，可能有一些服务有警告或者根本没启动（汲取上一次事件的经验：戳这儿），于是我先登录到底层管理页面（https://<VCSA的IP地址>:5480）查看VCSA各方面的状态。无奈，还是老样子，登不进去...

So，C计划宣布破产。
![2020-05-30-16-34-21](https://buff.tokiame.cn/hexo-images/2020-05-30-16-34-21.png)

## D计划：另辟蹊径
我认为VCSA还是得设法连接到外网。
突然想起服务器有4个网口，2个被Distribute Switch占用了，剩下两个网口分别连接到两台IPSAN存储，并且有各自的虚拟交换机（vswitch1和vswitch2），其中第4个网口目前没在使用。那我把网口对端的交换机端口调到外网，在vswitch2上新建一个端口组分配给VCSA虚拟机网络适配器，不就可以实现外网访问了吗？
* 配置对应的交换机端口为Trunk模式
```
[*CX110-Slot-2X]interface GE 3/1/2
[*CX110-Slot-2X-GE3/1/2]port link-type trunk
[*CX110-Slot-2X-GE3/1/2]port trunk allow-pass vlan all    /*临时配置，日常使用不建议允许所有VLAN通过*/
[*CX110-Slot-2X-GE3/1/2]quit
[*CX110-Slot-2X]commit
[~CX110-Slot-2X]
```

* 在vswitch2上新建一个端口组:
![2020-05-30-16-57-02](https://buff.tokiame.cn/hexo-images/2020-05-30-16-57-02.png)

* 将VCSA的网络划分到该端口组：
![2020-05-30-16-58-03](https://buff.tokiame.cn/hexo-images/2020-05-30-16-58-03.png)

经过以上的轮番骚操作以后，我终于可以放弃跑路的念头了：
![2020-05-30-17-01-47](https://buff.tokiame.cn/hexo-images/2020-05-30-17-01-47.png)

将VCSA虚拟机的网络适配器分配到分布式端口组：
![2020-05-30-17-32-08](https://buff.tokiame.cn/hexo-images/2020-05-30-17-32-08.png)

# 后记
## 教训
这其实算得上是一次失败的网络割接了。割接前一定要做好万全的准备，包括各种任务计划、风险评估、应急预案等等，而不是说要等到割接过程中出现问题了，才去现场发挥，手忙脚乱，不知所措。

## 科普
vSphere标准交换机和分布式交换机的区别：
* 标准交换机：
![2020-05-30-17-36-14](https://buff.tokiame.cn/hexo-images/2020-05-30-17-36-14.png)

* 分布式交换机：
![2020-05-30-17-36-30](https://buff.tokiame.cn/hexo-images/2020-05-30-17-36-30.png)

参考链接：https://blog.51cto.com/13556019/2062018