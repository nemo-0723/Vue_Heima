/*此文件是入口文件 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标样式
import './assets/font/iconfont.css'
//导入全局样式表
import './assets/css/global.css'

//导入插件
import TreeTable from 'vue-table-with-tree-grid'

//导入axios
import axios from 'axios'
//设置请求根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'

/* axios 请求拦截器 
   需要授权的 API，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌 
      发起登录请求时，不需要token，所以不用考虑
      发起其它请求时，已经登录成功了，有token了，就可以发起成功 
                    未登录，则没有token,就不能成功发起请求  */
axios.interceptors.request.use(config=>{
  //在请求头中使用 `Authorization` 字段提供 `token` 令牌
  config.headers.Authorization=window.sessionStorage.getItem('token');
  //在最后必须return config
  return config
})

//将axios全局挂载到VUE原型上   则其他地方只需要：this.挂载的名称【此处即this.$http】   即可使用
Vue.prototype.$http = axios



Vue.config.productionTip = false


//注册为全局可用的组件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
