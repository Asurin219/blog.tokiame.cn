---
title: '在AlmaLinux中安装和使用Docker'
published: 2024-08-11
description: ''
tags:
  - 'docker'
  - 'Linux'
category: 'Linux'
draft: false
pinned: false
lang: ''
author: ''
---

# 前言
一直以来CentOS被认为是一个稳定安全并且可靠的发行版本，它的源代码来自RHEL的复刻。2021年被RedHat收购后，CentOS成为了介于Fedora和RedHat之间的一个中游发行版，也就是CentOS Stream。此举令众多用户认为CentOS已不再适用于生产环境，转向了其他的RHEL发行版，如AlmaLinux和Rocky Linux。

以此为契机，本文来介绍一下Docker在AlmaLinux下的安装过程。

# 安装过程
1. 添加docker-ce源：

   ```plain
   dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
   ```

   修改repo中的URL，指向阿里云镜像站：

   ```plain
   sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
   ```

2. 使用命令`dnf clean all && dnf makecache`重新生成缓存
3. 安装docker相关组件：

   ```plain
   dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
   ```

4. 使用`systemctl enable docker --now`启动docker服务，并设置为自启动
5. 使用`docker version`查看docker版本： 
   ```plain
   Client: Docker Engine - Community
    Version:           24.0.7
    API version:       1.43
    Go version:        go1.20.10
    Git commit:        afdd53b
    Built:             Thu Oct 26 09:09:13 2023
    OS/Arch:           linux/amd64
    Context:           default
   
   Server: Docker Engine - Community
    Engine:
     Version:          24.0.7
     API version:      1.43 (minimum version 1.12)
     Go version:       go1.20.10
     Git commit:       311b9ff
     Built:            Thu Oct 26 09:07:45 2023
     OS/Arch:          linux/amd64
     Experimental:     false
    containerd:
     Version:          1.6.24
     GitCommit:        61f9fd88f79f081d64d6fa3bb1a0dc71ec870523
    runc:
     Version:          1.1.9
     GitCommit:        v1.1.9-0-gccaecfc
    docker-init:
     Version:          0.19.0
     GitCommit:        de40ad0
   [root@docker-host yum.repos.d]#
   [root@docker-host yum.repos.d]# docker version
   Client: Docker Engine - Community
    Version:           24.0.7
    API version:       1.43
    Go version:        go1.20.10
    Git commit:        afdd53b
    Built:             Thu Oct 26 09:09:13 2023
    OS/Arch:           linux/amd64
    Context:           default
   
   Server: Docker Engine - Community
    Engine:
     Version:          24.0.7
     API version:      1.43 (minimum version 1.12)
     Go version:       go1.20.10
     Git commit:       311b9ff
     Built:            Thu Oct 26 09:07:45 2023
     OS/Arch:          linux/amd64
     Experimental:     false
    containerd:
     Version:          1.6.24
     GitCommit:        61f9fd88f79f081d64d6fa3bb1a0dc71ec870523
    runc:
     Version:          1.1.9
     GitCommit:        v1.1.9-0-gccaecfc
    docker-init:
     Version:          0.19.0
     GitCommit:        de40ad0
   ```
   
1. 修改docker镜像源，使其指向国内镜像站：

   ```plain
   echo -e '{
       "registry-mirrors": ["https://docker.mirrors.sjtug.sjtu.edu.cn"]
   }' >> /etc/docker/daemon.json
   ```

7. 重新加载系统服务配置文件，然后重启docker服务:

   ```plain
   systemctl daemon-reload
   systemctl restart docker
   ```

8. 运行一个示例容器：

   ```plain
   docker run hello-world
   ```
   得到以下输出，说明docker已经正常运行：

   ```plain
   
   Hello from Docker!
   This message shows that your installation appears to be working correctly.
   
   To generate this message, Docker took the following steps:
    1. The Docker client contacted the Docker daemon.
    2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
       (amd64)
    3. The Docker daemon created a new container from that image which runs the
       executable that produces the output you are currently reading.
    4. The Docker daemon streamed that output to the Docker client, which sent it
       to your terminal.
   
   To try something more ambitious, you can run an Ubuntu container with:
    $ docker run -it ubuntu bash
   
   Share images, automate workflows, and more with a free Docker ID:
    https://hub.docker.com/
   
   For more examples and ideas, visit:
    https://docs.docker.com/get-started/
    
   ```
# 可选：使用Portainer管理Docker容器
1. （可选）使用docker运行Portainer（docker管理工具）：

   ```plain
   docker run --name portainer -d --network host --restart always -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer-ce
   ```

2. 访问`docker主机IP:9000`进行初始化配置即可。

   ![2026-04-01-15-28-14](https://cdn.tokiame.cn//2026-04-01-15-28-14.png) 

   ![2026-04-01-15-28-25](https://cdn.tokiame.cn//2026-04-01-15-28-25.png)

