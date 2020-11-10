import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Users from '../components/Users.vue'
import Rights from '../components/Rights.vue'
import Roles from '../components/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/Goods.vue'
import Add from '../components/goods/Add.vue'
import Orders from '../components/order/Orders.vue'
Vue.use(VueRouter)

const routes = [
  { path:'/',redirect:'/login' },
  { path:'/login',component:Login  },
  { 
    path:'/home',
    component:Home,
    redirect:'/users',
    children:[ {path:'/users',component:Users} ,
               { path:'/rights',component:Rights},
               { path:'/roles',component:Roles},
               { path:'/categories',component:Cate},
               { path:'/params',component:Params},
               { path:'/goods',component:Goods},
               { path:'/goods/add',component:Add},
               { path:'/orders',component:Orders}]
  },
  
]

const router = new VueRouter({
  routes
})

/* 全局前置路由导航守卫    用户登录后才能访问到其他页面

  to: Route: 即将要进入的目标 路由对象
  from: Route: 当前导航正要离开的路由
  next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
  next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
  next(false): 中断当前的导航。如果浏览器的 URL 改变了，那么 URL 地址会重置到 from 路由对应的地址。
  next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。
*/
router.beforeEach((to,from,next)=>{
    // 如果用户要访问登录页面，则直接放行(允许访问登录页)
    if(to.path === '/login') return next()
    //获取保存的token
    const token = window.sessionStorage.getItem('token')
    //如果没有token，则强制跳转到登录页面
    if(!token) return next('/login')
    next()
})
export default router
