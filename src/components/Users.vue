<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card >
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                        <el-button type="primary" @click="addUserDialog">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userList" border stripe>
                <el-table-column  type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="用户名" ></el-table-column>
                <el-table-column prop="email" label="邮箱" ></el-table-column>
                <el-table-column prop="mobile" label="电话" ></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column  label="状态" >
                    <!-- 把状态布尔值渲染为一个开关   作用域插槽   在每次调用时能有各自的渲染效果
                        作用域插槽就是父组件在调用子组件的时候给子组件传了一个插槽，
                        这个插槽为作用域插槽，该插槽必须放在template标签里面。 -->
                    <template slot-scope="scope">
                        <!-- 根据状态值的不同，渲染出不同的开关样式 -->
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column  label="操作" width="180px">
                    <!-- 根据用户id 来操作   所以要用到作用域插槽 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeUserDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)" ></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRolesDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>

        </el-card>

        <!-- 添加用户的弹窗 -->
        <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" @close="addDialogClose" >
            <!-- 内容主体区 -->
            <el-form :model="addForm" :rules="addFormRules"  ref="addFormRef" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>

            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的弹窗 -->
        <el-dialog title="修改用户" :visible.sync="changeUserDialogVisible" width="50%" @close="changeDialogClose">
            <!-- 内容主体区 -->
            <el-form :model="changeForm" :rules="addFormRules"  ref="changeFormRef" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="changeForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="changeForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="changeForm.mobile"></el-input>
                </el-form-item>
            </el-form>

            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="changeUserDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="changeUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的弹窗 -->
        <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="setRoleDialogClosed">
            <!-- 内容主体区 -->
            <p>当前的用户：{{currentUser.username}}</p>
            <p>当前的角色：{{currentUser.role_name}}</p>
            <p>分配新角色：
                <el-select  v-model="selectRoleId" clearable >
                    <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName"  :value="item.id">
                    </el-option>
                </el-select>
            </p>
            <!-- 按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRole">确 定</el-button>
            </span>
        </el-dialog>

       
    </div>
</template>
<script>
export default {
    data(){
        //自定义手机号的验证规则
        var validateMobile = (rule, value, callback) => {
            const regMobile=/^[1][3,4,5,7,8][0-9]{9}$/; 
            if (regMobile.test(value)) {
                //验证通过
                return callback(); 
            } 
            //验证失败
            return callback(new Error('请输入正确的手机号格式'));      
        };
        return {
            //获取用户列表的参数对象
            queryInfo:{
                query:'',
                //当前页数
                pagenum:1,
                //当前页显示多少个
                pagesize:2
            },
            //用户列表
            userList:[],
            //用户总数
            total:0,
            //控制添加用户的对话框显示与隐藏
            addUserDialogVisible:false,
            //添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            //添加用户的表单数据验证规则
            addFormRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                ],
                mobile: [
                    //是否输入了号码
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    //规则
                    { validator: validateMobile, trigger: 'blur' }
                ]
            },
            //控制修改用户的对话框显示与隐藏
            changeUserDialogVisible:false,
            //修改用户的表单数据
            changeForm:{
                username:'',
                email:'',
                mobile:'',
                id:0,
            },
            //控制分配角色弹窗是否显示
            setRolesDialogVisible:false,
            //分配角色时的当前用户
            currentUser:{},
            //所有角色列表
            rolesList:[],
            selectRoleId: ''
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        //获取用户列表数据
        async getUserList(){
            const {data:res}=await this.$http.get('users',{params:this.queryInfo});
            if(res.meta.status!==200) {
                return this.$message.error('获取用户列表失败');
            }
            this.userList=res.data.users;
            this.total=res.data.total

        },
        // pagesize 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getUserList()
        },
        // 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getUserList()
        },
        //用户状态改变
        async userStateChange(userInfo){
            //修改用户状态
            const {data:res}= await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if(res.meta.status!==200) {
                userInfo.mg_state=!userInfo.mg_state
                return this.$message.error('修改用户状态失败')  
            }
            this.$message.success('修改用户状态成功')  
        },
        //打开添加用户的对话框
        addUserDialog(){
            this.addUserDialogVisible=!this.addUserDialogVisible;
        },
        //关闭添加用户的对话框
        addDialogClose(){
            //重置表单
            //this.$refs 操作DOM元素
            this.$refs.addFormRef.resetFields()
        },
        //添加用户
        addUser(){
            //添加前 ，进行表单的预验证
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid)  return 
                //验证通过，真正添加
                const {data:res}= await this.$http.post('users',this.addForm);
                if(res.meta.status!==201){
                    return this.$message.error("添加用户失败")
                }
                this.$message.success("添加用户成功")
                //关闭弹窗
                this.addUserDialogVisible=false;
                //重新加载用户列表
                this.getUserList() 
            })  
        },
        //打开修改用户的对话框
        async changeUserDialog(id){
            this.changeUserDialogVisible=true;
            const {data:res}=await this.$http.get(`users/${id}`);
            if(res.meta.status!==200) return  this.$message.error('获取用户数据失败')
            this.changeForm=res.data;
        },
        //关闭修改用户的对话框
        changeDialogClose(){
            //重置表单
            //this.$refs 操作DOM元素
            this.$refs.changeFormRef.resetFields()
        },
        //修改用户
        changeUser(){
             //添加前 ，进行表单的预验证
            this.$refs.changeFormRef.validate(async valid=>{
                if(!valid)  return 
                //验证通过，真正添加
                const {data:res}= await this.$http.put(`users/${this.changeForm.id}`,
                {
                    'id':this.changeForm.id,
                    'email':this.changeForm.email,
                    'mobile':this.changeForm.mobile
                });
                if(res.meta.status!==200){
                    return this.$message.error("修改用户失败")
                }
                this.$message.success("修改用户成功")
                //关闭弹窗
                this.changeUserDialogVisible=false;
                //重新加载用户列表
                this.getUserList() 
            })  
        },
        //删除用户
        deleteUser(id){
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res}=await this.$http.delete(`users/${id}`);
                if(res.meta.status!==200) return this.$message.error('删除不成功')
                this.$message.success('删除成功!');
                this.getUserList();
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        //控制分配角色弹窗是否显示事件
        setRolesDialog(user){
            this.currentUser=user;
            //获取所有角色列表
            this.getRolesList();
            this.setRolesDialogVisible=true;
        },
        //获取角色列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status!==200) return this.$message.error('获取角色列表数据失败')
            this.rolesList=res.data;
        },
        //分配角色
        async setRole(){
            const {data:res}=await this.$http.put(`users/${this.currentUser.id}/role`,
                {rid:this.selectRoleId}
            )
            if(res.meta.status!==200) return this.$message.error(res.meta.msg) 
            this.$message.success('分配角色成功')
            this.setRolesDialogVisible=false;
            this.getUserList()
            
            
        },
        //分配角色的弹窗关闭事件
        setRoleDialogClosed(){
            this.selectRoleId='';
            this.currentUser={}
        }


    }
        
    
}
</script>
<style lang="less" scoped>

</style>