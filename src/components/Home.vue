<template>
    <div>
        <el-button type="info" @click="exit">退出</el-button>
    </div>
</template>
<script>
export default {
    data(){

    },
    methods:{
        //退出登录
        exit(){
            //删除token
            window.sessionStorage.clear();
            //跳转到首页
            this.$router.push('/login')
        }
    }
}
</script>
<style lang="less" scoped>

</style>