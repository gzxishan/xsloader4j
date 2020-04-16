import Vue from "vue";
import Cube from "cube";
import App from "./App.vue";

Vue.use(Cube);

new Vue({
  render: h => h(App)
}).$mount("#app");
