<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @clear="clearSearch">
                        <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                        <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

             <!-- 商品列表区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column  type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"  width="590px"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="110px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
                <el-table-column prop="add_time" label="创建时间">
                    <template slot-scope="scope">
                        {{scope.row.add_time | formatTime}}
                    </template>
                </el-table-column>
                <el-table-column  label="操作" width="120px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" ></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"  @click="deleteGood(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

             <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 8, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                    :total="total" background>
            </el-pagination>

        </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return{
            //商品列表数据
            goodsList:[],
            //商品列表数据请求参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:3
            },
            //商品总数
            total:0,


        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        //获取商品列表数据
        async getGoodsList(){
            const {data:res}=await this.$http.get('goods',{params:this.queryInfo});
            if(res.meta.status!==200) {
                return this.$message.error('获取商品列表失败');
            }
            this.goodsList=res.data.goods
            this.total=res.data.total
            
        },
        // 每一页显示多少个 pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getGoodsList()
        },
        // 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getGoodsList()
        },
        //搜索商品
        searchGoods(){
            this.getGoodsList()
        },
        //清空搜索输入框
        clearSearch(){
            this.getGoodsList()
        },
        //根据id删除商品
        async deleteGood(id){
            this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res}=await this.$http.delete(`goods/${id}`);
                if(res.meta.status!==200) return this.$message.error('删除商品失败')
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.getGoodsList()  
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        //点击添加商品按钮，跳转到添加商品页面
        goAddPage(){
            this.$router.push('/goods/add')
        }




    }
}
</script>
<style lang="less" scoped>

</style>