## 项目介绍
让java web项目支持JavaScript ES6+、*.scss、*.less、*.vue、*.jsx。
## 版本
当前最新版本为  [**1.1.0**](https://mvnrepository.com/artifact/com.xishankeji/xsloader4j-core)

![Version](https://img.shields.io/badge/Version-1.1.0-brightgreen.svg)
![JDK 1.8](https://img.shields.io/badge/JDK-1.8-green.svg)

[Github](https://github.com/gzxishan/xsloader4j)

[码云](https://gitee.com/xishankeji/xsloader4j)

## 运行环境
- JDK 8
- servlet3
- Windows,Linux,Mac
- maven3

## 安装
- spring boot嵌入式版（内嵌tomcat等容器，通过main函数启动）
```xml
<dependency>
    <groupId>com.xishankeji</groupId>
    <artifactId>xsloader4j-spring-boot-starter</artifactId>
    <version>1.1.0</version>
</dependency>
```
- 普通servlet版（项目以war包形式运行在tomcat、jetty等容器下）
```xml
<dependency>
    <groupId>com.xishankeji</groupId>
    <artifactId>xsloader4j-core</artifactId>
    <version>1.1.0</version>
</dependency>
```
## 配置

### 1、启动配置
在资源目录（如src/main/resources）下新建xsloader4j.properties：
- xsloader.js加载器访问路径为：/contextPath/xsloader.js

```properties
xsloader.min=true
xsloader.es6.debug=true
xsloader.sourcemap=true
xsloader.es6.dealt.ignores=
xsloader.es6.dealt.static=

xsloader.conf.properties.staticUrlPrefix=https://xxxxx.cn/xxx
xsloader.conf.properties.prop1=xxx

```
- xsloader.es6.debug：是否为debug模式，当为true时，文件修改后会重新进行转换。
- xsloader.sourcemap：是否转换source map。
- xsloader.es6.dealt.ignores：忽略转换的目录，用逗号分隔，如“/static/lib1,/static/lib2”。
- xsloader.es6.dealt.static：静态资源在资源目录下的路径（应该在spring boot嵌入式版本中使用），如“/static”。
- xsloader.conf.properties.xxx参数可直接在xsloader配置文件里使用`#{propName}`进行引用。

### 2、xsloader配置
在资源目录（如src/main/resources）下新建xsloader-conf.js,参考内容如下：
- 该配置文件的访问路径为：/contextPath/xsloader.conf
- 注意此配置文件为JS版的json对象，支持JS脚本。
- 关于此文件配置的更详细说明见：[xsloader模块加载器配置](https://github.com/gzxishan/xsloader/wiki/7.xsloader配置服务)
- 通过`#{propName}`引用配置参数，contextPath默认为当前servlet的context path参数。

```JavaScript
{
	"properties":{
		"contextPath":"#{contextPath}",
		"staticUrlPrefix":"#{staticUrlPrefix}",
		"libReplace":{
               "libxs/":{
                    "replace":"${staticUrlPrefix}/libxs/"
               },
               "lib/":{
                       "replace":"${staticUrlPrefix}/lib/"
              },
               "libui/":{
                     "replace":"${staticUrlPrefix}/libui/"
             }
         }
	},
	"main":{
		getPath:function(dataMain){
    		return dataMain||"./es-main/{name}.js";
    	},
		"before":function(){
			console.log("before:" + name);
		},
		"after":function(){
			console.log("after:" + name);
		}
	},
	"chooseLoader":function(localConfig){
		var path=this.getPagePath();
        if(startsWith(path,"/mobile/")){
            return "framework7";
        }
        return "test";
	},
	"loader":{
		"test":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02",
                "*[libxs/":"v=20200129-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{
                    "vue":"static/vue/vue.min.js"
            },
            "deps":{
				"*":"vue"//当有vue组件或jsx语法时，一定要先加载vue模块
            }
        },
		"framework7":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
            "urlArgs":{
                "*[${contextPath}/":"v=190107-3",
                "*[libxs/":"v=190107-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{
                   "vue":"static/vue/vue.min.js"
            },
            "depsPaths":{

            },
            "deps":{

            }
        }
	},
	"getPagePath":function(){
		var path=location.pathname.substring(this.properties.contextPath.length);
		return path;
	},
	"sporter":"${contextPath}/",
	"fromPath":function(path){
		return location.protocol+"//"+location.host+this.sporter+path;
	},
     "beforeDealProperties":function(){

     }
}
```
## 使用
- xsloader脚本引入：
```html
<script src="../xsloader.js" data-conf2="./xsloader.conf" async="async" type="text/javascript" charset="utf-8"></script>
```
- 配置文件引入：直接在xsloader.js的script标签上，设置属性data-conf2
```
data-conf2="./xsloader.conf"
```
- 详细例子可以参考demo1项目

目录结构：
```
/test1/
/test1/index.html
/test1/es-main/index.js
/test1/es-main/vue/comp1.vue
/test1/es-main/jsx/comp2.jsx
```

### index.html
```html
<!DOCTYPE html>
<html>

<head>
    <title>测试1</title>
    <meta charset="UTF-8">
    <!--引入xsloader脚本-->
    <script src="../xsloader.js" data-conf2="./xsloader.conf" async="async" type="text/javascript" charset="utf-8"></script>
</head>

<body>
<div id="vue-app">

</div>
<script id="app-template" type="text/x-template">
    <div style="text-align:center;">
        <comp1/>
        <comp2/>
    </div>
</script>
</body>

</html>
```

### comp1.vue
```vue
<template>
    <h1>{{info}}</h1>
</template>

<script>
    export default{
        data(){
            return {
                   info:"HelloWorld"
            }
        }
    }
</script>

<style lang="scss" scoped="true">
    &{
        margin:2em;
    }
</style>
```

### comp2.jsx
```jsx

export default {
	render(){
		return (
               <div
               style={{
                   margin:"2em auto"
               }}>
                   <p>这是一个jsx语法的组件</p>
               </div>)
	}
}

```

### index.js
```JavaScript
import Vue from "vue";
import comp1 from "./vue/comp1.vue";//需要加入文件后缀，当前目录需要用"./"、否则是相对于baseUrl

new Vue({
    el:"#vue-app",
    template:"#app-template",
    components:{
        comp1,
        comp2:()=>import("./jsx/comp2.jsx")//支持异步加载
    }
});
```

## 其他说明

### 1、打包说明
- 安装包会增加30Mb左右。
- 默认打包会将windows与linux环境下的v8引擎依赖打包进去（j2v8_win32_x86_64，j2v8_linux_x86_64）。
- 若在mac下运行，需要自行加入依赖：
```xml
 <dependency>
    <groupId>com.eclipsesource.j2v8</groupId>
    <artifactId>j2v8_macosx_x86_64</artifactId>
    <version>4.6.0</version>
</dependency>
```
### 2、代码转换说明

#### 1）*.js
- 语法支持到es2017
- 支持jsx语法（需要全局配置vue模块）
- 自动判断js文件语法，当具有一下语句之一时，则会进行转换：
```
let ...
import ...
export ...
const ...
```

#### 2）*.vue
- 支持的js语法同js
- 支持jsx语法
- 需要全局配置vue模块
- style标签支持多个，默认语言为scss

#### 3）*.scss
支持scss语法

#### 4）*.less
支持less语法

#### 5）*.jsx
- 效果与*.js文件效果是一样的