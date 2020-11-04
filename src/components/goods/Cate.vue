<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类区域 -->
            <el-row>
                <el-col :span="8">
                    <el-button type="primary" @click="addCategoryDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index
            index-text="#" border :show-row-hover="false">
                <!-- 是否有效 对应列的作用域插槽 -->
                <template slot="cat_deleted" scope="scope">
                    <i v-if="scope.row.cat_deleted===false" class="el-icon-success"></i>
                    <i v-else class="el-icon-error"></i> 
                </template>
                 <!-- 排序 对应列的作用域插槽 -->
                <template slot="cat_level" scope="scope">
                    <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                 <!-- 操作 对应列的作用域插槽 -->
                <template slot="set" scope="scope">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" >编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCategory(scope.row.cat_id)" >删除</el-button>
                </template>
            </tree-table>

            
            <!-- 分页区域 -->
            <el-pagination :total="total" :page-size="queryInfo.pagesize" :current-page="queryInfo.pagenum" :page-sizes="[1, 3, 5, 10]" 
             layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange">
            </el-pagination>
        </el-card>
        
        <!-- 添加分类的弹窗区域 -->
        <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%"  @close="addCateDialogClose">

            <!-- 添加分类的表单 -->
            <el-form  :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" >
                    <!-- 级联选择器 -->
                    <el-cascader  v-model="selectedKeys"  :options="parentCateList" :props="cascaderProps" 
                      @change="parentCateChange" clearable change-on-select></el-cascader>
                </el-form-item>
            </el-form>

            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return {
            //商品分类的数据列表
            cateList:[],
            //商品分类的数据的请求参数
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            //商品分类总数
            total:0,
            //为商品分类表格的 指定列 定义
            columns: [
                {
                    label: '分类名称', //列标题名称
                    prop: 'cat_name',//对应列内容的属性名
                    width: '400px',//列宽度
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    minWidth: '50px',//列最小宽度
                    type: 'template',//列类型 为模板
                    template: 'cat_deleted',//对应的作用域插槽名称
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    type: 'template',
                    template: 'cat_level',
                },
                {
                    label: '操作',
                    minWidth: '200px',
                    type: 'template',
                    template: 'set',
                },
                
            ],
            //添加分类的弹窗是否显示
            addDialogVisible:false,
            //添加分类的表单的数据对象
            addCateForm:{
                cat_name:'',//将要添加的分类名称
                cat_pid:0,//父级分类的id
                cat_level:0//当前要添加的分类等级 
            },
            //添加分类的表单的数据验证规则
            addCateFormRules:{
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
                ]
            },

            //父级分类的数据列表
            parentCateList:[],
            //指定级联选择器的配置对象
            cascaderProps:{
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //选中的父级分类的Id数组
            selectedKeys:[],
           
            
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取商品分类数据
        async getCateList(){
            const {data:res}=await this.$http.get('categories',{
                params:this.queryInfo
            })
            if(res.meta.status!==200) return this.$message.error('获取分类数据失败')
            this.cateList=res.data.result
            this.total=res.data.total
        },
        // 分页   pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getCateList()
        },
        // 分页   页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getCateList()
        },
        //添加商品分类是否显示
        addCategoryDialog(){
            this.getParentCateList()
            this.addDialogVisible=true
        },
        //获取父级分类的数据列表
        async getParentCateList(){
            const {data:res}=await this.$http.get('categories',{params:{ type:2 } })
            if(res.meta.status!==200) return this.$message.error('获取分类数据失败')
            this.parentCateList=res.data;
        },
        //级联选择器选择项发生变化时
        parentCateChange(){
            //如果数组长度>0,则选中了父级
            if(this.selectedKeys.length>0){
                //父级分类的Id
                this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1];
                //为当前分类的等级赋值
                this.addCateForm.cat_level=this.selectedKeys.length;
                return
            }else{
                this.addCateForm.cat_id=0;
                this.addCateForm.cat_level=0;
            }
        },
        //点击确定 添加分类
        async addCate(){
            const {data:res}=await this.$http.post('categories',this.addCateForm)
            if(res.meta.status!==201) return this.$message.error('添加分类数据失败')
            this.$message.success('添加分类数据成功')
            this.getCateList()
            this.addDialogVisible=false;
        },
        //关闭添加分类弹窗 清空表单
        addCateDialogClose(){
            //重置表单
            this.$refs.addCateFormRef.resetFields()
            //重置级联选择器
            this.selectedKeys=[]
        },



        
        //删除 商品分类事件
        async deleteCategory(Cate_id){
            this.$confirm('此操作将删除该分类数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res}=await this.$http.delete(`categories/${Cate_id}`);
                if(res.meta.status!==200) return this.$message.error('删除失败')
                this.$message.success('删除成功!');
                this.getCateList()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        //编辑 商品分类弹窗打开




        
    }
}
</script>
<style lang="less" scoped>
.zk-table{
    margin-top: 15px;
}
.el-icon-success{
    color: green;
}
.el-icon-error{
    color: red;
}
</style>