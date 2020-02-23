import "css!static/test.scss";//不是以“.”开头的路径相对于baseUrl
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
