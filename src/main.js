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
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' 
import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css' 

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
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)


//日期的格式化  实现vue中的过滤器功能  先定义过滤器 再使用       
Vue.filter("formatTime",function(originVal){
  const data= new Date(originVal);  

  const year   =  data.getFullYear();  
  const month  =  (data.getMonth() + 1+'').padStart(2,'0');  
  const day    =  (data.getDate()+'').padStart(2,'0'); 
  const hour   =  (data.getHours()+'').padStart(2,'0');
  const minute =  (data.getMinutes()+'').padStart(2,'0');
  const second =  (data.getSeconds()+'').padStart(2,'0');
  
  return  year + "-"+month + "-" + day + " " +hour+ ":"+minute+":" +second;;//将格式化后的字符串输出到前端显示
});


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
