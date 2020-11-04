<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card >
            <!-- 提示 -->
            <el-alert  title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"> </el-alert>
            <!-- 选择分类 -->
            <el-row>
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader  v-model="selectedKeys"  :options="CateList" :props="cascaderProps" 
                        @change="CateChange" clearable ></el-cascader>
                </el-col>
            </el-row>
            <!-- 参数 -->
             <el-tabs  v-model="activeName" @tab-click="handleTabClick">
                 <!-- 动态参数区域 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled='isBtnDisable' @click="showAddParamsDialog"> 添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe >
                        <!-- 展开列 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag  v-for='(item,index) in scope.row.attr_vals' :key='index'
                                    closable  :disable-transitions="false" @close="handleClose(index,scope.row)">{{item}}</el-tag> 
                                <el-input class="input-new-tag"  size="small" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" 
                                    @blur="handleInputConfirm(scope.row)" @keyup.enter.native="handleInputConfirm(scope.row)" ref="saveTagInput"></el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)" >+ New Tag</el-button>   
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column  label="操作" >
                            <template slot-scope="scope">
                                <!-- 修改按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态属性区域 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled='isBtnDisable' @click="showAddParamsDialog"> 添加属性</el-button>
                     <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe >
                         <!-- 展开列 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag  v-for='(item,index) in scope.row.attr_vals' :key='index'
                                    closable  :disable-transitions="false" @close="handleClose(index,scope.row)">{{item}}</el-tag> 
                                <el-input class="input-new-tag"  size="small" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" 
                                    @blur="handleInputConfirm(scope.row)" @keyup.enter.native="handleInputConfirm(scope.row)" ref="saveTagInput"></el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)" >+ New Tag</el-button>   
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column  label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column  label="操作" >
                            <template slot-scope="scope">
                                <!-- 修改按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加动态参数或静态属性的弹窗区域 -->
        <el-dialog :title="'添加'+titleText" :visible.sync="isShowAddParamsDialog" width="50%" @close="AddParamsDialogClosed">
            <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isShowAddParamsDialog = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的弹窗区域 -->
        <el-dialog :title="'修改'+titleText" :visible.sync="isShowEditDialog" width="50%" @close="EditParamsDialogClosed">
            <el-form :model="editParamsForm" :rules="addParamsFormRules" ref="editParamsFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isShowEditDialog = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            // 分类的数据列表
            CateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            // 选中的分类的Id数组
            selectedKeys:[],
            // 被激活的页签名称
            activeName: 'many',
            // 动态参数数据列表
            manyTableData:[],
            // 静态属性数据列表
            onlyTableData:[],
            // 控制添加参数弹窗是否显示
            isShowAddParamsDialog:false,
            // 添加的动态参数或静态属性表单数据
            addParamsForm:{
                attr_name:''//参数名
            },
            // 添加参数的表单数据验证规则
            addParamsFormRules:{
                attr_name: [
                    { required: true, message: '请输入参数名', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ]
            },
            // 控制修改参数弹窗是否显示
            isShowEditDialog:false,
            // 修改的参数或静态属性表单数据
            editParamsForm:{
                attr_name:'',//参数名
                attr_id:0
            },
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取商品分类的数据列表
        async getCateList(){
            const {data:res}=await this.$http.get('categories',{params:{ type:3 } })
            if(res.meta.status!==200) return this.$message.error('获取分类数据失败')
            this.CateList=res.data;
        },
        // 获取商品的参数
        async getParamsData(){
            if(this.selectedKeys.length!==3){
                //如果没有选择分类，就把表格数据清空
                this.selectedKeys=[]
                this.manyTableData=[]
                this.onlyTableData=[]
                return
            }
            const {data:res}=await this.$http.get(`categories/${this.CateId}/attributes`,
                    { params:{ sel: this.activeName }
            })
            if(res.meta.status!==200) return this.$message.error('请选择商品分类')
            //对获取到的参数中attr_vals字符串进行处理
            res.data.forEach( item=>{
                // 如果attr_vals字符串为空，则返回一个空数组即可
                item.attr_vals=item.attr_vals ? item.attr_vals.split(',') : [];
                // 每一行数据单独提供自己的  添加一个布尔值 控制文本框的显示与隐藏
                item.inputVisible=false
                //文本框中的输入到的值
                item.inputValue=''
            })
            //判断得到数据是动态参数还是静态属性 分别赋值
            if(this.activeName==='many') {
                this.manyTableData=res.data
            }else{
                this.onlyTableData=res.data
            }
        },
        //级联选择器选择项发生变化时
         CateChange(){
            this.getParamsData()
        },
        //Tab页签点击事件
        handleTabClick(){
            this.getParamsData()
        },
        // 添加参数弹窗事件
        showAddParamsDialog(){
            this.isShowAddParamsDialog=true
        },
        // 关闭添加参数的弹窗 清空表单事件
        AddParamsDialogClosed(){
            this.$refs.addParamsFormRef.resetFields()
        },
        // 点击按钮  添加参数
        addParams(){
            // 预验证
            this.$refs.addParamsFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res}=await this.$http.post(`categories/${this.CateId}/attributes`,
                    {   attr_name : this.addParamsForm.attr_name ,
                        attr_sel:this.activeName,
                    })
                if(res.meta.status!==201) return this.$message.error('添加参数失败')
                this.$message.success('添加参数成功')
                this.isShowAddParamsDialog=false
                this.getParamsData()
            })
        },
        // 修改参数弹窗事件
        async showEditDialog(data){
            const {data:res}=await this.$http.get(`categories/${data.cat_id}/attributes/${data.attr_id}`,
                { params:{ attr_sel:this.activeName } })
            if(res.meta.status!==200) return this.$message.error('获取参数失败')
            this.editParamsForm=res.data
            this.isShowEditDialog=true
        },
        //关闭修改参数的弹窗 清空表单事件
        EditParamsDialogClosed(){
            this.$refs.editParamsFormRef.resetFields()
        },
        // 点击按钮  修改参数
        editParams(){
            this.$refs.editParamsFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res}=await this.$http.put(`categories/${this.CateId}/attributes/${this.editParamsForm.attr_id}`,
                    {   attr_name : this.editParamsForm.attr_name ,
                        attr_sel:this.activeName,
                    })
                if(res.meta.status!==200) return this.$message.error('修改参数失败')
                this.isShowEditDialog=false
                this.getParamsData()
            })
        },
        //删除 参数
        async deleteParams(data){
            const {data:res}=await this.$http.delete(`categories/${this.CateId}/attributes/${data.attr_id}`)
                if(res.meta.status!==200) return this.$message.error('删除参数失败')
                this.$message.success('删除参数成功')
                this.getParamsData()
        },
        // 展示输入框
        showInput(row){
            row.inputVisible = true;
            //文本框自动获得焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 输入框失去焦点 或者按下enter 事件
        async handleInputConfirm(row) {
            // 如果输入框输入的值为空，则清空输入值并隐藏输入框 return 出去
            if(row.inputValue.trim().length === 0){
                row.inputValue=''
                row.inputVisible = false;
                return
            }
            // 否则 添加到attr_vals中
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue=''
            row.inputVisible = false;
            this.saveAttrVals(row)
        },
        //删除 对应的参数可选项
        handleClose(index,row){
            //splice(index,1)删除数组的指定元素
            row.attr_vals.splice(index,1)
            this.saveAttrVals(row)
        },
        //  发起请求 将对attr_vals的操作保存到数据库
        async saveAttrVals(row){
            const {data:res}=await this.$http.put(`categories/${this.CateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(',') //把数组转换为字符串
            })
            if(res.meta.status!==200) return this.$message.error('添加参数失败')
        }

    },
    computed:{
        // 如果按钮需要被禁用，则返回true,否则返回false
        isBtnDisable(){
            if(this.selectedKeys.length!==3){
                return true
            }
            return false
        },
        //当前选中的三级分类的id
        CateId(){
            //如果选中了，则返回三级分类的id 否则返回null
            if(this.selectedKeys.length===3){
                return this.selectedKeys[2]
            }
            return null
        },
        // 动态计算标题的文本
        titleText(){
             if(this.activeName==='many'){
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>
<style lang="less" scoped>
.el-alert{
    margin-bottom: 20px;
}
.el-tag{
    margin-right: 10px;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>