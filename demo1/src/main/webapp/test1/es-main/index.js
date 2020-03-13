import "css!static/test.scss";//不是以“.”开头的路径相对于baseUrl
import "css!static/test.less";
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



function add(x, y) {
	return x + y;
}

const numbers = [4, 38];
console.log("x+y=", add(...numbers)) // 42

let obj1 = {
	a: 1,
	b: 2,
	c: {
		nickName: 'd'
	}
};
let obj2 = { ...obj1
};
obj2.c.nickName = 'd-edited';
console.log(obj1); // {a: 1, b: 2, c: {nickName: 'd-edited'}}
console.log(obj2); // {a: 1, b: 2, c: {nickName: 'd-edited'}}


//测试async
const fetchData = (data) => new Promise((resolve) => setTimeout(resolve, 1000, data + 1))

const fetchValue = async function() {
	var value1 = await fetchData(1);
	var value2 = await fetchData(value1);
	var value3 = await fetchData(value2);
	console.log(value3)
};

fetchValue();

console.log("test yield...")
//测试yield
function* fn() {
	var a = yield 'hello';
	yield;
	console.log(a);
}
var iter = fn();
var res = iter.next();
console.log(res.value); //hello
iter.next(2);
iter.next(); //2
