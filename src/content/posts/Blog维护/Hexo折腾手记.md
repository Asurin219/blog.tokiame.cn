---
title: 'Hexo折腾手记'
published: 2020-04-25
description: ''
image: 'https://cdn.tokiame.cn/2020-04-26-21-29-21.png'
tags:
  - 'Hexo'
  - '博客'
category: 'Hexo'
draft: false
pinned: false
lang: ''
author: ''
---

# 写在最前面...
Hexo是基于node.js构建的一套静态博客平台，安装部署过程都比较简单，稍微懂一点点html和Markdown语法就能搞定（这也是笔者由WP转向Hexo的一个初衷...）
话不多说，立马开搞！

## 步骤记录（笔者用的是Windows）
## 开始之前...
万事开头难（特别是对于我这种对编程一窍不通的菜鸡儿= =）。要让Hexo跑起来，首先要满足一些条件：
1. 一台Windows或Linux主机；
2. 主机内部署好node.js环境；
3. 安装好Git（用于将hexo项目pull到本地，玩码云或者Gayhub的同志必备）；
4. 最基本的！必须懂得npm的简单使用！必须得会一点Markdown语法（除非你拿这玩意当记事本来写）；
5. 准备好编辑器（sublime，atom，vscode，typora等等）。
## 安装git
下载地址：[http://npm.taobao.org/mirrors/git-for-windows/](http://npm.taobao.org/mirrors/git-for-windows/ "http://npm.taobao.org/mirrors/git-for-windows/")。我下的是最新版：
![20200425192102](https://cdn.tokiame.cn/npm.png)

下载完成后，运行安装（保持默认配置,一直Next即可）。

## 安装node.js
上[node.js官网](https://nodejs.org/en/)下载适合自己系统版本的node.js运行环境安装包（建议用IDM、迅雷之类的工具来下载，这样比较快）。下载完成后，运行安装即可（没什么需要的话，保留默认配置安装就可以了）：
![2020-04-26-20-34-19](https://cdn.tokiame.cn/2020-04-26-20-34-19.png)

安装完成后,执行以下命令：
```shell
node -v      /*查看当前安装的node.js版本*/
v12.16.1
npm -v      /*查看当前安装的node.js软件包管理器版本*/
v6.13.4
npm config set registry http://registry.npm.taobao.org/   /*更换npm安装源为国内源（这里用淘宝的）*/
npm update      /*刷新npm源*/
```
## 开始部署Hexo
```shell
npm install hexo-cli -g      /*使用npm安装Hexo*/
cd /d D:\Project\hexo        /*进入你要部署Hexo的目标文件夹*/
hexo init      /*部署Hexo*/
```
Tips：Hexo init时，需要将github上的Hexo项目pull下来，速度会比较慢，除非你有喝酸酸乳（/手动滑稽）。初次部署完成后，执行以下命令进行初始化：
```shell
hexo clean     /*清除缓存*/
hexo g         /*生成静态页面*/
hexo s         /*开始跑Hexo*/
```

打开浏览器，输入`IP地址:4000`(本地的话是 `localhost:4000` 或 `127.0.0.1:4000`),就可以看到效果了，是不是很简单！
![20200425192452](https://cdn.tokiame.cn/example.png)

# 后记

如果你没有公网服务器和域名，也可以将你的Hexo丢到Gayhub、码云或者coding之类的代码托管平台上，直接用你的gayhub域名就能访问了！具体步骤可以参考以下链接的内容：
1. [初次运行Git前的配置](https://git-scm.com/book/zh/v2/起步-初次运行-Git-前的配置 "https://git-scm.com/book/zh/v2/起步-初次运行-Git-前的配置")
2. [hexo博客部署到github](https://www.jianshu.com/p/e70b4ca63115 "https://www.jianshu.com/p/e70b4ca63115")