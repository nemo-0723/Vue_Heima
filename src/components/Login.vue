<template>
    <div class="login_container"> 
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :model="LoginForm" :rules="LoginFormRules" class="login_form">
                <!-- 用户名 -->
                <el-form-item  prop="username">
                    <!-- 使用阿里字体图标库：替换elementui中图标的类名即可 -->
                    <el-input v-model="LoginForm.username" prefix-icon="iconfont icon-touxiang"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item  prop="password">
                    <el-input v-model="LoginForm.password" prefix-icon="iconfont icon-suo" type="password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        
    </div>
</template>
<script>
    export default{ 
        data() {
            return {
                //登录表单的数据绑定对象
                LoginForm: {
                    username: '',
                    password:''
                },
                //登录表单的验证规则
                LoginFormRules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 9, message: '长度在 6 到 9 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        methods:{
            //重置表单
            resetForm() {
                this.$refs.loginFormRef.resetFields();
            },
            //登录操作
            login(){
                //validate方法实现 对表单进行预验证
                this.$refs.loginFormRef.validate(async valid =>{
                    if(!valid)  return;
                    /*发起请求  使用async await 方法解决异步编程中回调地狱的问题   使用结构赋值对返回的对象结果进行解构获得data
                    并重命名为res*/
                    const { data:res } = await this.$http.post('/login',this.LoginForm);
                    if(res.meta.status!==200) return this.$message.error(res.meta.msg);
                    this.$message.success("登录成功");
                    /* 保存token   登录身份验证信息
                        1.项目中的其它接口，必须在登录之后才能访问
                        2.token只能在当前网站打开的期间生效，所以保存到 sessionStorage
                    */
                   window.sessionStorage.setItem('token',res.data.token);
                   //通过编程式导航跳转到首页
                    this.$router.push('/home');
                })
            }
        },
    }
</script>
<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
       
    }
    .login_box{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        width: 450px;
        height: 320px;
        background-color: #fff;
        border-radius: 3px;
        .avatar_box{
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            background-color: #fff;
            img{
                height: 100%;
                width: 100%;
                border-radius: 50%;
                background-color: #eee;

            }
        }  
    }
    .login_form{
        position: absolute;
        bottom: 0;
        /*W3C盒子模型:content、padding、border、margin
            我们给元素设置的width和height其实是content的宽高！！！ */
        width: 100%;
        padding: 10px 20px;
        //改为IE盒子模型：content[包含padding、border]、margin
        box-sizing: border-box;
    }
    .btns{
        display: flex;
        justify-content: flex-end;
    }
</style>