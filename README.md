## 一、项目介绍
让java web项目支持JavaScript ES6+、*.scss、*.less、*.vue、*.jsx。
## 二、版本
当前最新版本为  [**1.1.31**](https://mvnrepository.com/artifact/com.xishankeji/xsloader4j-core)

![Version](https://img.shields.io/badge/Version-1.1.31-brightgreen.svg)
![JDK 1.8](https://img.shields.io/badge/JDK-1.8-green.svg)

[Github](https://github.com/gzxishan/xsloader4j)

[码云](https://gitee.com/xishankeji/xsloader4j)

## 三、运行环境
- JDK 8
- servlet3
- Windows,Linux,Mac
- maven3

#### 已测试通过
- Jdk8
- Windows10
- CentOS 7.4，7.5

## 四、安装
- spring boot嵌入式版（内嵌tomcat等容器，通过main函数启动）
```xml
<dependency>
    <groupId>com.xishankeji</groupId>
    <artifactId>xsloader4j-spring-boot-embed-starter</artifactId>
    <version>1.1.31</version>
</dependency>
```
- 普通servlet版（项目以war包形式运行在tomcat、jetty等容器下）
```xml
<dependency>
    <groupId>com.xishankeji</groupId>
    <artifactId>xsloader4j-core</artifactId>
    <version>1.1.31</version>
</dependency>
```
## 五、配置

### 1、启动配置
在资源目录（如src/main/resources）下新建xsloader4j.properties：
- xsloader.js加载器访问路径为：/contextPath/xsloader.js

```properties
xsloader.es6.polyfill=true
xsloader.es6.debug=true
xsloader.sourcemap=true
xsloader.es6.dealt.ignores=
xsloader.es6.dealt.static=
xsloader.es6.extensions=
xsloader.es6.v8flags=
xsloader.conf.properties.staticUrlPrefix=https://xxxxx.cn/xxx
xsloader.conf.properties.prop1=xxx
xsloader.htmv.enable=false
xsloader.htmv.paths[0]=* to /WEB-INF/htmv/default.html
xsloader.htmv.paths[1]=/mobile/ to /WEB-INF/htmv/mobile.html
```
- xsloader.es6.polyfill：是否使用polyfill，为true时、会自动加载polyfill（7.8.3），默认为true。
- xsloader.es6.debug：是否为debug模式，当为true时，文件修改后会重新进行转换。
- xsloader.sourcemap：是否转换source map。
- xsloader.es6.dealt.ignores：忽略转换的目录，用逗号分隔，如“/static/lib1,/static/lib2”。
- xsloader.es6.dealt.static：静态资源在资源目录下的路径（应该在spring boot嵌入式版本中使用），如“/static”。
- xsloader.es6.extensions：脚本后缀，可以省略里面指定的后缀名（但路径中必须含有/分隔符），默认为".js,.vue,.jsx"，且取值只能是[.js,.jsx,.vue,.js+]中的值
- xsloader.es6.v8flags：v8引擎flags
- xsloader.conf.properties.xxx：参数可直接在xsloader配置文件里使用`#{propName}`进行引用。
- xsloader.htmv.enable：是否启用htmv，默认为false
- xsloader.htmv.paths：配置默认的html模板（可选）
### 2、xsloader配置
在资源目录（如src/main/resources）下新建xsloader-conf.js,参考内容如下：
- 该配置文件的访问路径为：/contextPath/xsloader.conf
- 注意此配置文件为JS版的json对象，支持JS脚本。
- 关于此文件配置的更详细说明见：[xsloader模块加载器配置](https://github.com/gzxishan/xsloader/wiki/7.xsloader配置服务)
- 通过`#{propName}`引用配置参数，contextPath默认为当前servlet的context path参数。
- 此配置文件缓存时间为30秒，通过urlArgs可以控制其他资源的版本，从而有效避免缓存问题。

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
        if(xsloader.startsWith(path,"/test1/")){
            return "test1";
        }else if(xsloader.startsWith(path,"/test2-no-vue/")){
            return "test2-no-vue";
        }else{
            return "test1";
        }
	},
	"loader":{
		"test1":{
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
		"test2-no-vue":{
            "baseUrl":"${contextPath}/",
            "modulePrefix":"$[libReplace]",
             "urlArgs":{
                "*[${contextPath}/":"v=20200130-02",
                "*[libxs/":"v=20200129-3",
                "*[lib/":"v=190109-26",
                "*[libui/":"v=190109-26"
            },
            "paths":{

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
## 六、使用
- xsloader脚本引入：
```html
<script src="../xsloader.js" data-conf2="./xsloader.conf" async="async" type="text/javascript" charset="utf-8"></script>
```
- 配置文件引入：直接在xsloader.js的script标签上，设置属性data-conf2
```
data-conf2="./xsloader.conf"
```
- 详细例子可以参考demo1项目

- 执行jetty:run或tomcat7:run的maven插件，可运行demo。访问地址：[http://localhost:8070/](http://localhost:8070/)

- test1目录结构：
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
    <script src="../xsloader.js" data-conf2="./xsloader.conf" async="async" type="text/javascript"
            charset="utf-8"></script>
</head>

<body>
<div id="vue-app">

</div>
<script id="app-template" type="text/x-template">
    <div style="text-align:center;">
        <comp1/>
        <comp2/>
        <jsx :x="getVnode" id="123" :name="'name'" @click="onClickVnodex" class="test-class"/>
    </div>
</script>
</body>

</html>
```

### comp1.vue
```vue
<template>
    <div>
        <h1 :class="{...classNames}">{{info}}</h1>
        <p>$thiz.getUrl():<span style="color:gray;">{{$thiz.getUrl()}}</span></p>
        <p>$thiz.getUrl("../index.js"):<span style="color:gray;">{{$thiz.getUrl("../index.js")}}</span></p>
    </div>
</template>

<script>
    export default{
        data(){
            return {
                   info:"HelloWorld",
                   classNames:{
                        teatA:true,
                        testB:true,
                   }
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
import "css!static/test.scss";//不是以“.”开头的路径相对于baseUrl
import Vue from "vue";
import comp1 from "./vue/comp1.vue";//需要加入文件后缀，当前目录需要用"./"、否则是相对于baseUrl

console.log(thiz.getUrl());//http://localhost:8070/test1/es-main/index.js?v=20200130-02
console.log(thiz.getUrl("./lib/other.js"));//http://localhost:8070/test1/es-main/lib/other.js?v=20200130-02

new Vue({
    el:"#vue-app",
    template:"#app-template",
    methods:{
        getVnode(){
            return (<p on={{click:this.onClickp}}>
                来自函数
            </p>);
        },
        onClickVnodex($event){
            alert("onClickVnodex:"+$event);
        },
        onClickp($event){
            alert("onClickp:"+$event);
        }
    },
    components:{
        comp1,
        comp2:()=>import("./jsx/comp2.jsx")//支持异步加载
    }
});
```

## 七、其他说明

### 1、打包说明
- 打包成指定系统的war包后会增加20Mb左右，例如打包到linux系统下运行，可在`pom.xml`的plugins里排除windows与mac的j2v8依赖包：
```xml

<build>
    <plugins>
        <plugin>
            <artifactId>maven-war-plugin</artifactId>
            <version>3.2.2</version>
            <configuration>
                <packagingExcludes>
                    <!--排除j2v8 windows与mac下的依赖包，默认打包后在linux下运行、减小压缩包-->
                    WEB-INF/lib/j2v8_win**.jar,WEB-INF/lib/j2v8_macosx**.jar,
                </packagingExcludes>
            </configuration>
        </plugin>
    </plugins>
</build>

```
- 若在mac下运行，需要自行加入依赖：
```xml
 <dependency>
    <groupId>com.eclipsesource.j2v8</groupId>
    <artifactId>j2v8_macosx_x86_64</artifactId>
    <version>4.6.0</version>
</dependency>
```

### 2、引入其他库
- 引入的第三方库需要遵循AMD规范
- 一般打包的三方umd模块可以正常工作，可以参考项目`demo1`
- `注意`:import其他组件或模块，不能省略后缀名，如"./app.vue","./router.js"

### 3、代码转换说明

#### 1）*.js
- 语法支持到es2017
- 支持jsx语法
- 内置`<jsx>`组件（需要全局配置vue模块），通过x属性（返回jsx对象的函数或jsx对象）可以直接显示编译后的jsx对象
```
<div>
    <jsx :x="xxx" />
</div>
```
- 自动判断js文件语法，当具有以下语句之一时，则会进行转换：
```javascript
let ...
import ...
export ...
const ...
```
- thiz变量指向当前模块，更多请见[xsloader的this](https://github.com/gzxishan/xsloader/wiki/2.define,require,invoker%E7%AD%89#5this%E4%B8%8E_invoker_)
- 当有vue组件、jsx语法或htmv时，需要在配置文件的loader里设置vue2依赖：
```json
{
  "paths":{
       "vue":"你的vue2的路径/vue.min.js"
  },
  "deps":{
      "*":"vue"//当有vue组件、jsx语法或htmv时，一定要先加载vue模块
  }
}
```
#### 2）*.vue
```html
<template>

</template>
<script>

</script>

<style lang="scss" scoped="true">

</style>
```
- \<script\>支持的js语法同*.js
- 支持jsx语法
- 某些IDE暂不支持jsx语法，可以用如下方式勉强避免错乱：（编译前，java后台会把Vue文件里的\`\jsx与\jsx\`删除）
```
return (`\jsx
    <div>HelloJSX</div>
\jsx`)
```
- 在Vue实例上添加$thiz属性（同*.js里的thiz变量），表示当前vue所在的模块对象。
- 在Vue实例上添加`$keepVueStyle`属性，默认为false，表示销毁时、对应的style也会被销毁。
- 在Vue实例上添加`$destroyVueStyle()`函数，用于销毁style；当使用Vue的`<transition>`过渡动画时，可设置其包裹的组件的`$keepVueStyle=true`，在动画结束后手动调用此函数销毁style。
- \<style\>：lang属性支持default（即css）、scss(推荐，也是默认值)、less；可包含多个style标签；scoped:true(scoped),false
```
1、注意这里scoped为true时，只是在根元素上添加一个随机的class。
2、<style>标签支持多个
```
- 当有vue组件、jsx语法或htmv时，需要在配置文件的loader里设置vue2依赖：
```json
{
  "paths":{
       "vue":"你的vue2的路径/vue.min.js"
  },
  "deps":{
      "*":"vue"//当有vue组件、jsx语法或htmv时，一定要先加载vue模块
  }
}
```

#### 3）*.htmv
- 该文件实际是一个vue格式的文件，更多说明见*.vue
```html
<!--settings:
{
    title:"文档标题"
}
-->
<template>

</template>
<script>

</script>

<style lang="scss" scoped="true">

</style>
```
- 通过settings注释里的json格式对文档进行设置：
1. title：设置文档标题
- 通过浏览器可以直接访问htmv文件（java端会自动转换），参考demo1的test1/index.htmv。
- 当有vue组件、jsx语法或htmv时，需要在配置文件的loader里设置vue2依赖：
```json
{
  "paths":{
       "vue":"你的vue2的路径/vue.min.js"
  },
  "deps":{
      "*":"vue"//当有vue组件、jsx语法或htmv时，一定要先加载vue模块
  }
}
```
- 通过设置`xsloader.htmv.enable=true`来启用htmv

#### 4）*.scss
支持scss语法

#### 5）*.less
支持less语法

#### 6）*.jsx
- 效果与*.js文件效果是一样的
- 当有vue组件、jsx语法或htmv时，需要在配置文件的loader里设置vue2依赖：
```json
{
  "paths":{
       "vue":"你的vue2的路径/vue.min.js"
  },
  "deps":{
      "*":"vue"//当有vue组件、jsx语法或htmv时，一定要先加载vue模块
  }
}
```
- 属性、class、事件等设置见Vue的$createElement
```
<img attrs={{src:""}} class="test" style="" />

详细属性:
{
  //class:接受一个字符串、对象或字符串和对象组成的数组
  'class': {
    foo: true,
    bar: false
  },
  //style:接受一个字符串、对象，或对象组成的数组
  style: {
    color: 'red',
    fontSize: '14px'
  },
  //普通的HTML特性
  attrs: {
    id: 'foo'
  },
  //组件prop
  props: {
    myProp: 'bar'
  },
  //DOM属性
  domProps: {
    innerHTML: 'baz'
  },
  // 事件监听器在`on`属性内，
  // 但不再支持如`v-on:keyup.enter`这样的修饰器。
  // 需要在处理函数中手动检查keyCode。
  on: {
    click: this.clickHandler
  },
  // 仅用于组件，用于监听原生事件，而不是组件内部使用
  // `vm.$emit` 触发的事件。
  nativeOn: {
    click: this.nativeClickHandler
  },
  // 自定义指令。注意，你无法对 `binding` 中的 `oldValue`
  // 赋值，因为 Vue 已经自动为你进行了同步。
  directives: [
    {
      name: 'my-directive',
      value: '2',
      expression: '1 + 1',
      arg: 'foo',
      modifiers: {
        bar: true
      }
    }
  ],
  //作用域插槽的格式为
  //{ name: props => VNode | Array<VNode> }
  scopedSlots: {
    default: props => createElement('span', props.text)
  },
  //如果组件是其它组件的子组件，需为插槽指定名称
  slot: 'name-of-slot',
  // 其它特殊顶层属性
  key: 'myKey',
  ref: 'myRef',
  //如果在渲染函数中给多个元素都应用了相同的 ref 名，
  //那么`$refs.myRef` 会变成一个数组。
  refInFor: true
}
```

#### 6）sourcemap源码
转换的源码可在浏览器控制台Sources标签下，对应页面的`/$$xs-sources$$/`路径下找到，支持脚本断点调试。

### 4、polyfill
您可能需要使用polyfill来更好的使用es6+代码，如Map、array.includes、string.startsWith、async/await等
- 默认xsloader.es6.polyfill为true，会自动加载polyfill。
- 在本项目polyfill/目录下下载了些版本的js文件
- 可以去https://babeljs.io/docs/en/babel-polyfill/下载
```bash
cnpm install --save @babel/polyfill
在node_modules/下对应目录下去复制polyfill.js文件
```

### 5、xsloader.js说明
该插件是基于AMD协议开发的模块加载器（借鉴了requirejs，但从1.2.x开始进行了重构），支持异步模块加载、插件开发、更灵活的依赖配置、脚本版本配置等。

内置插件包括：css、image、json、text、request等。

#### 使用情况
- xsloader.js：已完全在公司线上产品中使用
- xsloader4j：已覆盖公司80%以上的项目

[xsloader-wiki](https://github.com/gzxishan/xsloader/wiki)

## 八、发布记录
### 【进行中】
1. xsloader.js的模块对象增加appendArgs(url,forArgsUrl)；
2. vue模板实例添加$thiz变量，表示当前vue模块；
3. 支持*.htmv，用于直接显示vue模板；
4. 修复xsloader.js的xsloader4j-server-bridge依赖vue（但vue还暂未加载），提前注册<jsx>组件导致缺少vue报错的bug；

### v1.1.31 2020/5/7
1. 完善vue模板的编译；

### v1.1.29 2020/5/2
1. 修复loading的bug；

### v1.1.27 2020/4/29
1. 完善demo1，加入vant、mand-mobile测试例子（也支持ant-design-vue）；
2. 默认支持自动后缀：`*.vue`,`*.jsx`,`*.js`；
3. 加入ScriptEnv；
4. 修复一些bug；

### v1.1.19 2020/4/10
1. 内置`<jsx>`组件，方便显示jsx；

###  v1.1.16 2020/3/31
1. 修复vue模板中无法使用annonymous变量的问题；
2. 修复后台转换时console.assert判断错误问题；
3. 修改缓存文件保存目录；
4. 完善异常处理；
5. 修复某些js文件在静态导入其他子文件的情况下，导致缓存失效的问题；