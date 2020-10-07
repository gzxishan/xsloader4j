import "css!static/test.scss"; //不是以“.”开头的路径相对于baseUrl
import "css!static/test.less";
import Vue from "vue";
import Box from "./box.vue";

new Vue({
	el: "#vue-app",
	template: "#app-template",
	data() {
		return {
			
		}
	},
	methods: {

	},
	components: {
		Box
	}
});
