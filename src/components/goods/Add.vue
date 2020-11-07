<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示 -->
            <el-alert  title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>

            <!-- 横向步骤条 -->
            <el-steps  :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 竖向标签页 -->
            <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs tab-position="left" v-model="activeIndex"  :before-leave="beforeTabLeave" 
                 @tab-click='tabClicked'>
                    <el-tab-pane label="基本信息"  name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model.number="addForm.goods_price" ></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model.number="addForm.goods_weight" ></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model.number="addForm.goods_number" ></el-input>
                        </el-form-item>
                        <!-- 选择分类 -->
                        <el-form-item label="商品分类：" prop="goods_cat">
                            <el-cascader  v-model="addForm.goods_cat"  :options="CateList" :props="cascaderProps" 
                                 clearable  @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数"  name="1">
                        <!-- 渲染item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableList" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" v-for="(cb,index) in item.attr_vals" :key="index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性"  name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableList" :key="item.attr_id" >
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片"  name="3">
                        <el-upload :action="uploadUrl" :headers="headerObj"  list-type="picture"
                          :on-preview="handlePreview"  :on-remove="handleRemove" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容"  name="4">
                        <quill-editor  v-model="addForm.goods_introduce"/>
                        <el-button type="primary" class="btn-add" @click="add">添加商品</el-button>


                        
                    </el-tab-pane>
                </el-tabs>
            </el-form>

        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="DialogVisible" width="50%" >
            <img :src="picSrc" class="previewImg">
        </el-dialog>
    </div>
</template>
<script>
// 导入lodash  使用深拷贝功能
import _ from 'lodash'
export default {
    data(){
        return{
            //当前激活的竖向标签页的name值
            activeIndex: '0',
            //添加商品的表单数据对象
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[],//商品所属的分类数组
                goods_introduce:'',
                pics:[],
                attrs:[]
            },
            //添加商品的表单验证规则
            addFormrules:{
                goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' },
                            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }],
                goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' },
                            { type: 'number', message: '商品价格必须为数字值'}],
                goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' },
                            { type: 'number', message: '商品价格必须为数字值'}],
                goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' },
                            { type: 'number', message: '商品价格必须为数字值'}],
                goods_cat:[{ required: true, message: '请选择商品分类'}]
                
            },
            // 商品分类的数据列表
            CateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            // 动态参数列表
            manyTableList:[],
            // 静态属性列表
            onlyTableList:[],
            // 图片上传的url地址
            uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的header请求头对象  此处发送请求不用axios  故需要单独设置token
            headerObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            // 控制图片预览的弹窗是否显示
            DialogVisible:false,
            // 图片URL
            picSrc:''

        }
    },
    computed:{
        // 三级分类id
        cateId(){
            return this.addForm.goods_cat[2]
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
       // 获取商品分类的数据列表
        async getCateList(){
            const {data:res}=await this.$http.get('categories')
            if(res.meta.status!==200) return this.$message.error('获取分类数据失败')
            this.CateList=res.data;
        },
        // 级联选择器选中项发生变化， 会触发这个事件
        handleChange(){
           
        },
        //  监听标签页的切换 
        beforeTabLeave(activeName, oldActiveName){
            // 如果没有选中分类，则阻止它跳转到其它标签页
            if(oldActiveName==='0' && this.addForm.goods_cat.length!==3){
                this.$message.error('请先选择分类')
                return false
            }
        },
        // 标签页的点击事件
        tabClicked(){
            // 访问动态参数面板
            if(this.activeIndex==='1'){
                this.getParamsList('many')
            // 访问静态属性面板
            }else if(this.activeIndex==='2'){
                this.getParamsList('only')
            }
        },
        // 获取商品的参数列表
        async getParamsList(sel){
            const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
            {params:{sel:sel}})
            if(res.meta.status!==200) return this.$message.error('获取分类数据失败')
            if(sel==='many'){
                //对得到的数据进行预处理  把字符串转为数组
                res.data.forEach(item=>{
                    item.attr_vals=item.attr_vals.length===0?[]:item.attr_vals.split(',')
                })
                this.manyTableList=res.data
            }else{
                this.onlyTableList=res.data
            }
        },
        //  图片上传   图片预览
        handlePreview(file){
            this.picSrc=file.response.data.url
            this.DialogVisible=true
        },
        // 图片上传   图片移除
        handleRemove(file){
            //1. 获取将要删除的图片的临时路径
            const filePath=file.response.data.tmp_path;
            //2. 在pics 数组中 找到这张图片的索引值
            const index=this.addForm.pics.findIndex(x=>
                x.pic===filePath
            )
            //3. 删除图片
            this.addForm.pics.splice(index,1)
            console.log(this.addForm)
        },
        // 图片上传  上传成功
        handleSuccess(response){
            const picInfo={ pic:response.data.tmp_path }
            this.addForm.pics.push(response.data.tmp_path)
        },
        // 点击按钮 添加商品
        add(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid){
                    return this.$message.error('请填写必要的表单项')
                }                                   
                // 处理goods_cat   使用深拷贝
                const form=_.cloneDeep(this.addForm)
                form.goods_cat=form.goods_cat.join(',')

                //处理动态参数
                this.manyTableList.forEach(item=>{
                    const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(',')}
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableList.forEach(item=>{
                    const newInfo={ attr_id: item.attr_id, attr_value: item.attr_vals}
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs=this.addForm.attrs
                // 商品名称必须唯一
                const{data:res}=await this.$http.post('goods',form)
                if(res.meta.status!==201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.$router.push('/goods')

            })
        }
    },
}
</script>

<style lang="less" scoped>
.el-steps{
    margin: 20px 0;
}
.el-checkbox{
    margin: 0 10px 0!important;
}
.previewImg{
    width: 100%;
}
.btn-add{
    margin-top: 15px;
}
</style>