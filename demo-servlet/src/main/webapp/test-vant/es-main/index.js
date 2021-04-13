//例子代码来源于：https://github.com/youzan/vant-demo/tree/master/vant/base

import Vue from "vue";
import Vant from "vant";
import App from "./App";
import { router } from './router';

Vue.use(Vant);

let x=1;
let _mod;

function _mod2(){
	let _mod3;
}

new Vue({
  router,
  el: '#app',
  render: h => h(App)
});