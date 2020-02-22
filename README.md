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
- xsloader.js加载器访问路径为：/xsloader.js

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
- 该配置文件的访问路径为：/xsloader.conf
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
		getPath:function(dataMain){//获取主模块的路径，默认为"./main/当前网页名.js"
    		return dataMain||"./es-main/{name}.js+";
    	},
		"before":function(){
			console.log("before:" + name);
		},
		"after":function(){
			console.log("after:" + name);
		}
	},
	"chooseLoader":function(localConfig){//返回一个configName；当此函数为service全局配置的函数时，localConfig为应用的配置对象;本地配置调用时，localConfig为null。
		var path=this.getPagePath();
        if(startsWith(path,"/mobile/")){
            return "framework7";
        }
        return "antd-vue-back";
	},
	"loader":{
		"antd-vue-back":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02",
                "*[libxs/":"v=20200129-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{
                    "all":"aspect/all.js",
                    "echarts":"lib/echarts/4.2.1-rc.1/echarts.min.js",
                    "ReconnectingWebSocket":"lib/io/reconnecting-websocket.js",
                    "overpage":"aspect/overpage.js",
                    "xsdk":"libxs/ui/ant-design-vue/1.3.x/sdk#{js-debug}.js",
                    "xstree":"libxs/ui/layui2/xstree.js",
                    "qrcode":"lib/jquery/jquery.qrcode.min.js",
                    "clipboard":"lib/clipboard.js/clipboard.min.js",
                    "service-image":"libxs/service-ui/example/image.js",
                    "service-provider":"libxs/service-ui/service-provider.js",
                    "service-invoker":"libxs/service-ui/service-invoker.js",
                    "article-show":"libxs/service-ui/example/article-show.js",
                    "article-editor":"libxs/service-ui/example/article-editor.js",
                    "ptp-common-lib":  "${contextPath}/#{oftenContext}/G2Sdk/**=appid=${baseAppid}/common-lib/widgets-pc.js"
            },
            "deps":{
                "all":["xsdk","ptp-common-lib","aspect/vue-utils.js","css!aspect/all-pc.scss"],
                "ptp-common-lib":"xsdk",
                "*":["all"]
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
                    "all":"aspect/all.js",
                    "echarts":"lib/echarts/4.2.1-rc.1/echarts.min.js",
                    "ReconnectingWebSocket":"lib/io/reconnecting-websocket.js",
                    "xsdk":"libxs/ui/noui/sdk-zepto.js",
                    "selectpage":"libui/selectpage/2.18/selectpage.js",
                    "datepicker":"libui/m/datepicker/datePicker.js",
                    "iscroll5":"lib/iscroll/5.2.0/iscroll-probe.js",
                    "service-provider":"libxs/service-ui/service-provider.js",
                    "service-invoker":"libxs/service-ui/service-invoker.js",
                    "article-show":"libxs/service-ui/example/article-show.js",
                    "framework7":"libui/framework7/v3.6.7/js/framework7.min.js",
                    "myapp":"aspect/my-app.js"
            },
            "depsPaths":{

            },
            "deps":{
                "all":["xsdk",["framework7","css!libui/framework7/v3.6.7/css/framework7.min.css",
                        "css!libui/framework7/icons-2.3.0/css/framework7-icons.css"]],
                "selectpage":"css!libui/selectpage/2.18/selectpage.css",
                "*":["all"]
            }
        }
	},
	"getPagePath":function(){
		var path=location.pathname.substring(this.properties.contextPath.length);
		return path;
	},
	"porter":"${contextPath}/#{oftenContext}/",
	"sporter":"${contextPath}/",
	"sdkPorter":"${contextPath}/#{oftenContext}/G2Sdk/",
	"fromPath":function(path){
		//return this.sporter+path;
		return location.protocol+"//"+location.host+this.sporter+path;
	},
     "beforeDealProperties":function(){
        
     }
}
```
## 使用
目录结构：
```
网站根目录 /
          /es-main/index.js
          /index.html
```

### index.html
```html
<!DOCTYPE html>
<html>

	<head>
	    <!--引入xsloader脚本-->
		<script src="./xsloader.js" data-conf2="./xsloader.conf" async="async" type="text/javascript" charset="utf-8"></script>
	</head>

	<body>
		
	</body>

</html>
```

### index.js
```JavaScript
import Vue from "vue";
import sdk from "xsdk";
import A from "./a.js";

```
