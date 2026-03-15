---
title: '在ArchLinux中安装和使用PostgreSQL 17'
published: 2025-10-16
description: ''
image: 'https://buff.tokiame.cn/hexo-images/2026-03-16-01-11-09.png'
tags:
  - 'Linux'
  - 'ArchLinux'
  - '运维'
  - '服务器'
category: '随手记'
draft: false
pinned: false
lang: ''
author: ''
---

1. 输入以下命令查看软件源中是否包含postgresql：
```bash
pacman -Si postgresql
```
![2026-03-16-01-17-58](https://buff.tokiame.cn/hexo-images/2026-03-16-01-17-58.png)

2. 有！那就使用命令安装：
```bash
pacman -S postgresql
```
（习惯性-Syu）
![2026-03-16-01-18-28](https://buff.tokiame.cn/hexo-images/2026-03-16-01-18-28.png)

3. 设置postgresql服务开机自启：
```bash
systemctl enable postgresql
```
![2026-03-16-01-31-33](https://buff.tokiame.cn/hexo-images/2026-03-16-01-31-33.png)

4. 初次启动postgresql服务需要先进行初始化。使用以下命令:
```bash
su - postgres -c "initdb --locale en_US.UTF-8 -E UTF8 -D '/opt/database'"
```

- 命令分解说明:
> **su - postgres：** 切换到 `postgres` 系统用户（- 表示使用登录shell环境）
> 
> **-c "initdb ..."：** 以 `postgres` 用户身份执行引号内的命令。其中initdb为数据库的初始化命令，其参数含义如下：
> 
>> **--locale en_US.UTF-8：** 设置数据库的本地化规则为美式英语，使用 `UTF-8` 编码
>> 
>> **-E UTF8：** 设置数据库的默认编码为 `UTF-8`
>> 
>> **-D '/opt/database'：** 指定数据库集群的存储目录为 `/opt/database`

当看到以下输出时，说明初始化已经完成了：

![2026-03-16-01-20-27](https://buff.tokiame.cn/hexo-images/2026-03-16-01-20-27.png)

5. 现在可以使用以下命令管理PostgreSQL服务了：
```bash
systemctl start postgresql
systemctl status postgresql
```

![2026-03-16-01-31-47](https://buff.tokiame.cn/hexo-images/2026-03-16-01-31-47.png)