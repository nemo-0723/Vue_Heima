/*此文件是入口文件 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标样式
import './assets/font/iconfont.css'
//导入全局样式表
import './assets/css/global.css'

//导入axios
import axios from 'axios'
//设置请求根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
//将axios全局挂载到VUE原型上   则其他地方只需要：this.挂载的名称【此处即this.$http】   即可使用
Vue.prototype.$http = axios



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
