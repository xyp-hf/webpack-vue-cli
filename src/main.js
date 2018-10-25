// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import "babel-polyfill";
import App from './App'
import store from './store';
import "./assets/css/reset.css";
Vue.config.productionTip = false

/* eslint-disable no-new */
const runxIM = document.createElement("div");
runxIM.setAttribute("id", "runx_im");
document.body.appendChild(runxIM);
new Vue({
  el: '#runx_im',
  components: { App },
  template: '<App/>',
  store,
})
