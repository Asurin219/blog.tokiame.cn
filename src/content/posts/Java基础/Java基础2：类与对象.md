---
title: 'Java基础2：类与对象'
published: 2022-10-18
description: ''
image: ''
tags:
  - 'Java'
  - '开发基础'
category: 'Java基础'
draft: false
pinned: false
lang: ''
author: ''
---

# 内容回顾
上一篇已经介绍过Java的基础语法和一些概念：
1. **对象**：对象是类的一个实例，有状态和行为（例如：职工是一个对象，他有工号、岗位、姓名、性别等状态，有工作、吃饭、睡觉等行为）。
2. **类**：类是一个模板，它描述一类对象的行为和状态。

# 类
我们来举个例子。有一位职工，它具有工号，岗位，姓名，年龄的属性（状态），以及工作、吃饭、睡觉等行为。这段描述，我们可以用代码表示为：
```java
/**
* 职工类
*/
public class Employee {
    int jobNo;      //工号
    String job;     //岗位
    String name;    //姓名
    int age;        //年龄

    /**
    * 工作行为
    */
    void work() {
    }
 
    /**
    * 吃行为
    */
    void eat() {
    }
 
    /**
    * 睡觉行为
    */
    void sleep(){
    }
}
```
# 构造方法
每个类都有构造方法。如果没有显式地为类定义构造方法，Java 编译器将会为该类提供一个默认构造方法。在创建一个对象的时候，至少要调用一个构造方法。构造方法的名称必须与类同名，一个类可以有多个构造方法。

下面是一个构造方法示例：
```java
public class Employee{
    public Employee(){
    }
 
    public Employee(String name){
        // 这个构造器仅有一个参数：name
    }
}
```


# 对象
对象是根据类来创建的。可以理解成，类是创建对象所需的模板。
在Java中，使用关键字 ``new`` 来创建一个新的对象。创建对象需要以下三步：

1. **声明**：声明一个对象，包括对象名称和对象类型。
2. **实例化**：使用关键字 new 来创建一个对象。
3. **初始化**：使用 new 创建对象时，会调用构造方法初始化对象。

我们使用一段代码来举例：
```java
public class Employee{
   public Employee(String name){
      //这个构造器仅有一个参数：name
      System.out.println("* 职工姓名 : " + name + "。" ); 
   }
   public static void main(String[] args){
      // 创建一个Employee对象
      // 类名 对象名 = new 对象();
      Employee newEmployee = new Employee( "Asurin" );
   }
}
```
编译运行将会得到以下结果：
``* 职工姓名：Asurin。``

# 访问实例中的变量和方法
我们可以通过已创建的对象，来访问成员变量和成员方法。
```java
public class Employee {
    int jobNo;      //工号
    String job;     //岗位
    int age;        //年龄

    /**
     * Employee类的构造方法
     * @param name 姓名
     */
    public Employee(String name) {
        System.out.println("* 职工姓名为：" + name);
    }

    /**
     * 方法：设置工号，以下同理
     * @param jobNo 工号
     */
    public void setJobNo(int jobNo) {
        this.jobNo = jobNo;
    }

    public void setJob(String job) {
        this.job = job;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void getInfo() {
        System.out.println("* 工号：" + jobNo + "，岗位：" + job + "，年龄：" + age + "岁。");
    }

    public static void main(String[] args) {
        Employee newEmployee = new Employee("Asurin"); //使用Employee类实例化一个对象newEmployee
        newEmployee.setJobNo(20200411); //调用成员方法setJobNo，设置工号，以下同理
        newEmployee.setAge(24);
        newEmployee.setJob("运维工程师");

        newEmployee.getInfo(); //调用成员方法getInfo，输出员工信息
    }
}
```
编译运行后将会得到以下结果：
```
* 职工姓名为：Asurin
* 工号：20200411，岗位：运维工程师，年龄：24岁。
```

# Java包与import
开发 Java 程序时，可能需要大量的类，为了解决这个问题，Java 引入了包（package）机制，提供了类的多层命名空间，用于解决类的命名冲突、类文件管理等问题。
而为了让 Java 编译器能够使用某一个包内的成员，我们需要在 Java 程序中明确导入该包。使用 ``import`` 语句可完成此功能。

使用包和import时需要注意：
1. 如果一个类定义在某个包中，那么 package 语句应该在源文件的最开头；
2. 如果源文件包含 import 语句，那么应该放在 package 语句和类定义之间。如果没有 package 语句，那么 import 语句应该在源文件的最开头。
3. import 语句和 package 语句对源文件中定义的所有类都有效。在同一源文件中，不能给不同的类不同的包声明。

<br>

同样地，我们使用上面的代码来进行举例。
1. 在项目``src``目录下中新建一个包，命名为``test``；
2. 在项目``src``目录下中新建一个类，命名为``run``，并在文件开头指定要导入的类；
3. 将Employee类中的``main``方法移入``run``类中；
4. 将修改后的``Employee``类移入test包内，并在文件开头声明所属的包名。

修改后的目录结构如下：
![2022-10-19-14-34-17](https://buff.tokiame.cn/hexo-images/2022-10-19-14-34-17.png)

* Employee类：
    ```java
    //声明所属包名
    package test;

    public class Employee {
        int jobNo;      //工号
        String job;     //岗位
        int age;        //年龄

        /**
        * Employee类的构造方法
        * @param name 姓名
        */
        public Employee(String name) {
            System.out.println("* 职工姓名为：" + name);
        }

        /**
        * 设置工号
        * @param jobNo 工号
        */
        public void setJobNo(int jobNo) {
            this.jobNo = jobNo;
        }

        public void setJob(String job) {
            this.job = job;
        }

        public void setAge(int age) {
            this.age = age;
        }

        public void getInfo() {
            System.out.println("* 工号：" + jobNo + "，岗位：" + job + "，年龄：" + age + "岁。");
        }
    }
    ```

* run类：
    ```java
    //导入test包中的Employee类
    import test.Employee;

    public class run {
        public static void main(String[] args) {
            Employee newEmployee = new Employee("Asurin"); //实例化一个对象newEmployee
            newEmployee.setJobNo(20200411); //调用成员方法setJobNo，设置工号，以下同理
            newEmployee.setAge(24);
            newEmployee.setJob("运维工程师");

            newEmployee.getInfo(); //调用成员方法getInfo，输出员工信息
        }
    }
    ```
修改后的``main``方法位于``run``类中，所以``run``类自然成了主类，程序必须从``run``类开始执行。编译运行后将会得到以下结果：
```
* 职工姓名为：Asurin
* 工号：20200411，岗位：运维工程师，年龄：24岁。
```
可见，运行结果是一样的。