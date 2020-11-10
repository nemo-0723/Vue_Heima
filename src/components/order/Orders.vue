<template>
    <div>
         <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card >
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column  type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号" ></el-table-column>
                <el-table-column prop="order_price" label="订单价格" ></el-table-column>
                <el-table-column prop="pay_status" label="是否付款" >
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column  prop="create_time" label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | formatTime}}
                    </template>
                </el-table-column>
                <el-table-column  label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeAdress"></el-button>
                        <!-- 显示物流按钮 -->
                        <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                    :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>

        </el-card>


        <!-- 修改地址的弹窗 -->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addressDialogClosed">
            <!-- 内容主体区 -->
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader  :options="cityData" v-model="addressForm.address1"  
                     clearable ></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>

            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" >确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流信息的弹窗 -->
        <el-dialog title="物流进度" :visible.sync="ProgressBoxDialogVisible" width="50%">
            

            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="ProgressBoxDialogVisible = false">取 消</el-button>
                <el-button type="primary" >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
// 导入城市级联数据
import cityData from './citydata.js'
export default {
    data(){
        return{
            // 订单列表数据
            orderList:[],
            // 订单列表数据的查询参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:5
            },
            total:0,

            // 控制修改地址的弹窗是否显示
            addressDialogVisible:false,
            // 修改地址表单数据
            addressForm:{
                address1:[],
                address2:''
            },
            addressFormRules:{
                address1:[
                     { required: true, message: '请输入省市区/县', trigger: 'blur' },
                ],
                address2:[
                     { required: true, message: '请填写详细地址', trigger: 'blur' },
                ]
            },
            // 城市级联数据
            cityData,

            // 控制物流信息的弹窗是否显示
            ProgressBoxDialogVisible:false,
            

        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        // 获取订单列表数据
        async getOrderList(){
            const {data:res}= await this.$http.get('orders',{params:this.queryInfo})
            if(res.meta.status!==200) return this.$message.error('获取数据失败')
            this.orderList=res.data.goods
            this.total=res.data.total
        },
        // pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getOrderList()
        },
         // 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getOrderList()
        },

        // 修改地址弹窗显示
        changeAdress(){
            this.addressDialogVisible=true
        },
        addressDialogClosed(){
            this.$refs.addressRef.resetFields()
        },

        // 物流信息弹窗显示
        showProgressBox(){
            
            this.ProgressBoxDialogVisible=true
        }
    }
}
</script>
<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>