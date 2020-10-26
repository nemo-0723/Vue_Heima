<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="exit">退出</el-button>
        </el-header>
        <!-- 页面主体区 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">
                    |||
                </div>
                <!-- 侧边栏菜单区 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409Eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
                    <!-- 一级菜单区域 -->
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!-- 一级菜单模板 -->
                        <template slot="title">
                            <!-- 图标 通过类名绑定图标对象来渲染   该图标对象里属性名设为一次菜单的id  唯一   属性值设为图标类名-->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>

                        <!-- 二级菜单区域 -->
                        <!-- 菜单开启使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                             <!-- 二级菜单模板 -->
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 内容区 -->
            <el-main>
                <!--子路由 welcome的路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            //左侧菜单数据
            menuList:[],
            //左侧菜单一级菜单图标名称
            iconsObj:{
                '125':'iconfont icon-user-group',
                '103':'iconfont icon-zhanghuquanxian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-weibiaoti-',
                '145':'iconfont icon-shuju'
            },
            //是否折叠菜单
            isCollapse:false,
            //被激活的二级菜单链接地址
            activePath:'/users'
        }
    },
    // vue生命周期  created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
    created(){
        //获取所有的菜单
        this.getMenuList(),
        //在页面刷新的时候把保存的值取出来
        this.activePath=window.sessionStorage.getItem('activePath')
    },
    methods:{
        //退出登录
        exit(){
            //删除token
            window.sessionStorage.clear();
            //跳转到首页
            this.$router.push('/login')
        },
        async getMenuList(){
            const { data:res } = await this.$http.get('/menus')
            if(res.meta.status!==200) return this.$message.error(res.meta.msg);
            this.menuList=res.data;
        },
        //点击按钮切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse=!this.isCollapse
        },
        //保存二级菜单（链接）的激活状态  点击哪个菜单 哪个就亮
        saveNavState(path){
            window.sessionStorage.setItem('activePath',path);
            this.activePath=path;
        }
    },
   
}
</script>
<style lang="less" scoped>
.home-container{
    height: 100%;
}
.el-header{
    /* Flex布局
        当我们为父盒子设为 flex 布局以后，子元素的 float、clear 和 vertical-align 属性将失效
        定义flex盒子后内容不再区分行级标签和块级标签都可以设置宽高！！！
        1）父项常见属性
          flex-direction设置主轴的方向    子元素是跟着主轴来排列
          justify-content 设置主轴上的子元素排列方式  
          flex-wrap设置是否换行 
          align-items 设置侧轴上的子元素排列方式（单行 ）
          align-content  设置侧轴上的子元素的排列方式（多行）
        */
    display: flex;
    justify-content: space-between;//先两面贴边，再平分剩余空间
    padding-left: 0;
    align-items: center;
    //样式的继承 font-  text-  line-  开头的 以及  color    a标签不继承
    color: #fff;
    font-size: 20px;
    background-color: #373D41;
    div{
        display: flex;
        align-items: center;
        /*img{
            vertical-align: middle;
             //vertical-align 垂直对齐
               只针对于行内元素或者行内块元素，通常用来控制图片/表单与文字的对齐（middle）。
               该元素的中心对齐周围元素的中心。  
        }*/
        span{
            margin-left: 15px;
        }
    }
}
.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #eaedf1;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: #373D41;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>