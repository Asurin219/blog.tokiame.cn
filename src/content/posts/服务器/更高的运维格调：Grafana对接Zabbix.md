---
title: '更高的运维格调：Grafana对接Zabbix'
published: 2020-06-06
description: ''
image: 'https://cdn.tokiame.cn/2020-07-06-11-40-35.png'
tags:
  - 'Linux'
  - 'CentOS'
  - '运维'
  - '服务器'
  - '监控'
  - '高逼格'
category: '搬砖随记'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
## Grafana——开源、高逼格可视化监控平台！
搞过运维的应该都听说过Grafana吧！以下这张图就是Grafana的：
![2020-06-06-11-49-01](https://cdn.tokiame.cn/2020-06-06-11-49-01.png)

## 再来看看Zabbix
有人可能问了，Zabbix不是有自带图表吗，为啥还需要Grafana？其实怎么说呢，Zabbix还是偏后端的监控系统，主要面向运维人员。而且，Zabbix图表类型不够丰富，对于一般人来说不太友好。So，我们可以将Grafana与Zabbix对接，作为Zabbix的Dashboard（仪表板），接收来自Zabbix的数据，并通过各种形式的图表展示出来。

废话不多说，开始我的表演。
# 进入正题
## Grafana安装部署
{% note info %}
**注意：**
1. 本文使用的Linux发行版是CentOS 8.1.1911;
2. 本文使用的Zabbix版本为5.0.1;
3. 本文使用的Grafana版本为7.0.3;
{% endnote %}
首先，通过dnf安装Grafana：
```
dnf install https://dl.grafana.com/oss/release/grafana-7.0.3-1.x86_64.rpm -y
```

启动Grafana，并设置为开机自启：
```
systemctl enable --now grafana-server
```

打开浏览器，通过`http://<Host IP>:3000`访问Grafana。Grafana的默认用户名和密码都是admin。初次登录的话，需要修改默认的管理员密码：
![2020-06-06-12-27-06](https://cdn.tokiame.cn/2020-06-06-12-27-06.png)

![2020-06-06-12-28-29](https://cdn.tokiame.cn/2020-06-06-12-28-29.png)

![2020-06-06-12-28-51](https://cdn.tokiame.cn/2020-06-06-12-28-51.png)

## 开始对接Zabbix
Grafana的插件种类比较丰富，通过Grafana-CLI就能安装各种类型的插件，安装过程比较简单。下面来安装Zabbix插件：
```
grafana-cli plugins install alexanderzobnin-zabbix-app 
```
使用`systemctl restart grafana-server`重新启动Grafana服务。登录Grafana，点击右侧栏设置图标→插件，启用Zabbix插件：
![2020-06-07-10-43-26](https://cdn.tokiame.cn/2020-06-07-10-43-26.png)
![2020-06-07-10-44-11](https://cdn.tokiame.cn/2020-06-07-10-44-11.png)

回到首页，添加数据源：
![2020-06-06-15-06-09](https://cdn.tokiame.cn/2020-06-06-15-06-09.png)

选择刚刚安装的Zabbix插件，进行配置：
![2020-06-06-15-06-53](https://cdn.tokiame.cn/2020-06-06-15-06-53.png)

配置数据源名称、Zabbix的API URL、Zabbix用户名和密码，随后点击Save&Test保存配置并进行对接测试：
![2020-06-06-15-18-23](https://cdn.tokiame.cn/2020-06-06-15-18-23.png)

对接成功：
![2020-06-06-15-30-35](https://cdn.tokiame.cn/2020-06-06-15-30-35.png)

{% note danger %}
**踩坑：**
如果Zabbix的版本是5.x以前的，则API URL应该写成这种形式：
```
http://<Zabbix IP>/zabbix/api_jsonrpc.php
```
{% endnote %}

{% note warning %}
**注意：**
如果你的Zabbix采用Nginx作为Server，则API URL内的地址需与Nginx配置文件中的server_name一致，否则会造成对接失败：
![2020-06-06-15-29-12](https://cdn.tokiame.cn/2020-06-06-15-29-12.png)
{% endnote %}

## 创建仪表板并使用Zabbix数据源
回到Grafana首页，创建一个仪表板：
![2020-06-06-15-40-43](https://cdn.tokiame.cn/2020-06-06-15-40-43.png)

为仪表板添加一个面板：
![2020-06-06-15-41-46](https://cdn.tokiame.cn/2020-06-06-15-41-46.png)

设置图表的各项参数，比如数据源、图表类型、图表数据等，设置比较简单且多样化，根据自己需要进行设置就好了：
（我的Zabbix已经事先添加了监控主机，所以这里可以直接获取到数据）
![2020-06-06-15-45-40](https://cdn.tokiame.cn/2020-06-06-15-45-40.png)

点击Apply应用设置，就能看到新建的面板了。点击仪表板右上角的保存图标，保存仪表板：
![2020-06-06-15-55-15](https://cdn.tokiame.cn/2020-06-06-15-55-15.png)

# 后记
## 总结
利用Grafana，可以做出各种漂亮的面板、图表，方便我们对数据的解读（最重要的还是逼格高啊/滑稽）。Grafana的可玩性还是比较高的，还有更多的功能需要我们自己去探索。
## 参考文章：
1. 利用Grafana为Zabbix做Dashboard：https://www.jianshu.com/p/44498cc11a95
2. 提升运维格调？Grafana整合Zabbix：https://mp.weixin.qq.com/s/6GGxZ1vKw9nLiSdWYqtjug