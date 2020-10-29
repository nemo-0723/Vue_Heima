<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-button type="primary">添加角色</el-button>
            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',index===0?'bdtop':'','vcenter']" v-for='(item,index) in scope.row.children' :key='item.id'>
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="handleClose(scope.row,item.id)">{{item.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19" >
                                <!-- 通过for 循环  嵌套渲染二级权限 -->
                                <el-row :class="[index2===0?'':'bdtop','vcenter']" v-for='(item2,index2) in item.children' :key='item2.id'>
                                    <el-col :span="6" >
                                        <el-tag type="success" closable @close="handleClose(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <!-- 再通过for 循环  嵌套渲染三级权限 -->
                                        <el-tag type="warning" closable @close="handleClose(scope.row,item3.id)" v-for='item3 in item2.children' :key='item3.id'>{{item3.authName}}</el-tag>   
                                    </el-col>
                                </el-row>
                            </el-col>        
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称" ></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述" ></el-table-column>
                <el-table-column  label="操作" width="300">
                    <!-- 根据用户id 来操作   所以要用到作用域插槽 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <!-- 分配权限按钮 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的弹窗区域 -->
        <el-dialog title="分配权限" :visible.sync="isShowSetRightDialog" width="50%" @close="setRightDialogClose">
            <!-- 树形控件 -->
            <el-tree :data="rightsList"  :props="treeProps" show-checkbox  node-key="id"  :default-checked-keys="preventRightsKeys"
               ref='treeRef' ></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isShowSetRightDialog = false">取 消</el-button>
                <el-button type="primary" @click="allotRights()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            //角色列表
            rolesList:[],
            //分配权限的弹窗是否显示
            isShowSetRightDialog:false,
            //所有权限列表
            rightsList:[],
            //所有权限列表树形控件显示的信息
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            //角色本来就有的权限id值数组
            preventRightsKeys:[],
            //当前即将分配权限的对应角色的id
            roleId:0

        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        //获取角色列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status!==200) return this.$message.error('获取角色列表数据失败')
            this.rolesList=res.data
        },
        //根据Id删除对应的权限
        handleClose(role,rightId){
            this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
                if(res.meta.status!==200) return this.$message.error('删除权限失败')
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                //this.getRolesList()  会发生页面的重新渲染
                role.children=res.data;
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            });
        },
        //控制分配权限的弹窗是否显示
        async showSetRightDialog(role){
            //获取所有权限列表
            const {data:res}= await this.$http.get('rights/tree');
            if(res.meta.status!==200)  return this.$message.error('获取权限失败')
            //所有权限
            this.rightsList=res.data;

            //递归获取原有的三级权限id列表
            this.getPreventRightsKeys(role,this.preventRightsKeys);
            this.isShowSetRightDialog=true;

            //把id 保存到data中
            this.roleId=role.id
        },
        
        //!!!!!!通过【递归】的形式，获取角色下所有的三级权限的id,并保存到preventRightsKeys 数组中
        getPreventRightsKeys(node,arr){
            //如果当前node节点不包含children属性，则是三级节点
            if(!node.children){
               return arr.push(node.id) 
            }
            //如果当前node节点包含children属性，则不是三级节点，进行递归
            node.children.forEach(item=>
                this.getPreventRightsKeys(item,arr))
        },
        //监听分配权限的弹窗关闭事件
        setRightDialogClose(){
            this.preventRightsKeys=[]
        },
        //点击确定为角色分配权限
        async allotRights(){
            //获取所有被选中的叶子节点的key和半选中节点的key
            const keys=[...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()];
            //转换成以，分割的字符串
            const idStr=keys.join(',');
            const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{
                rids:idStr
            })
            if(res.meta.status!==200) return this.$message.error('分配角色失败')
            this.$message.success('更新成功');
            this.isShowSetRightDialog=false;
            this.getRolesList()

        }

    }
}
</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>