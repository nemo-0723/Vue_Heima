import Vue from 'vue'
// 按需导入组件
import { Button ,Form, FormItem, Input, Message, Container,Header,Aside,Main,MenuItem,Menu,Submenu,Breadcrumb,BreadcrumbItem,Card,Row,Col,
    Table,TableColumn,Switch,Tooltip,Pagination,Dialog,Popconfirm,MessageBox} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(MenuItem)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Popconfirm)
Vue.prototype.$message=Message
Vue.prototype.$confirm=MessageBox.confirm