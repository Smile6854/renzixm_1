<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 放置页签 pane:面-->
          <el-tab-pane label="角色管理">
            <!-- //label是每个标签页的名字 -->
            <!-- 新增角色按钮 -->
            <el-row style="height: 60px">
              <el-button icon="el-icon-plus" size="small" type="primary" @click="showDialog = true">新增角色</el-button>
            </el-row>
            <!-- 表格 -->
            <!-- //设置默认边框，这里严格意义应该写:border="true"，或者只写border
            （border要求是boolean类型）*** -->
            <el-table border="" :data="list">
              <!-- //但是这里写了个空字符串也可以，但是不规范，只有写:border="false"，或者不写，才不显示边框，其他情况都是显示边框 -->
              <!-- //label列名 -->
              <el-table-column
                align="center"
                type="index"
                label="序号"
                width="120"
              />
              <el-table-column
                align="center"
                prop="name"
                label="角色名称"
                width="240"
              />
              <!-- //width也可以添加px单位 -->
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <!-- //视频中没有添加template -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteRole(row.id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-row
              type="flex"
              justify="center"
              align="middle"
              style="height: 60px"
            >
              <!-- 分页组件 prev:左箭头上一页，next：右箭头下一页，pager：页码列表-->
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev,pager,next"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>

          <!-- ----------第二个页签的内容------------------ -->
          <el-tab-pane label="公司信息">
            <!-- //警告文字类型，也就是颜色  //显示默认图标//不允许关闭，类型 -->
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
              boolean
            />
            <!-- //lable-width是form-item的label的宽度，不能没有px单位 -->
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="公司名称">
                <!-- //input没有width属性 -->
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!--  放置弹层 -->
    <el-dialog title="编辑弹层" :visible="showDialog" @close="btnCancel">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button size="small" @click="btnCancel">取消</el-button>
          <el-button size="small" type="primary" @click="btnOk">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 放置一个分配权限弹层 -->
    <el-dialog title="分配权限" :visible="showPermDialog" @close="btnPermCancel">
      <!-- 权限是一棵树 -->
      <!-- 数据绑定到组件上 -->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        show-checkbox
        :check-strictly="true"
        :data="permData"
        :props="defaultProps"
        :default-expand-all="true"
        :default-checked-keys="selectCheck"
        node-key="id"
      />
      <!-- 确定 取消 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOk">确定</el-button>
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, getRoleDetail, updateRole, addRole, assignPerm } from '@/api/setting'
import { mapGetters } from 'vuex'
import { getPermissionList } from '@/api/permission'
import { tranListToTreeData } from '@/utils'
export default {
  data() {
    return {
      list: [],
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0 // 记录总数
      },
      permData: [], // 接收权限数据
      roleId: null, // 用来记录当前分配权限的ID
      selectCheck: [], // 用来记录当前的权限点的标识
      defaultProps: {
        label: 'name'
      }, // 定义显示字段的名称 和 子属性的字段名称
      formData: {
        // 公司信息
      },
      showDialog: false, // 控制弹层显示
      showPermDialog: false, // 分配权限弹层显示
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      // console.log(total, rows)
      this.page.total = total
      this.list = rows
      // console.log(this.list)
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId) // 赋值给formData
    },
    // 编辑
    async editRole(id) {
      this.roleForm = await getRoleDetail(id)
      this.showDialog = true
    },
    // 编辑后确认
    async btnOk() {
      try {
        await this.$refs.roleForm.validate()
        // 只有校验通过的情况下 才会执行await的下方内容
        // roleForm.这个对象有Id就是编辑
        if (this.roleForm.id) {
          await updateRole(this.roleForm)
        } else {
          // 新增
          await addRole(this.roleForm)
        }
        // 重新拉取数据
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false
      } catch (err) {
        console.log(err)
      }
    },
    btnCancel() {
      this.roleForm = {
        name: '',
        description: ''
      }
      this.$refs.roleForm.resetFields()
      this.showDialog = false
    },
    async deleteRole(id) {
      // 提示
      try {
        await this.$confirm('确认删除该角色码？')
        // 只有点击确认才能进入
        await deleteRole(id)
        this.getRoleList()
        this.$message.success('删除角色成功')
      } catch (err) {
        console.log(err)
      }
    },
    changePage(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    // 弹出层
    // 获取权限点数据 在点击的时候调用 获取权限点数据
    async assignPerm(id) {
      this.permData = tranListToTreeData(await getPermissionList(), '0') // 转化数据为树形结构
      this.roleId = id
      // 应该去获取 这个id的 权限点
      // 有Id 就可以 先储存起来
      const { permIds } = await getRoleDetail(id) // permIds是当前角色所拥有的权限点数据
      console.log(permIds)
      this.selectCheck = permIds // 将当前的角色所拥有的ID
      this.showPermDialog = true
    },
    async btnPermOk() {
      // 调用el-tree 的方法
      // this.$refs.permTree.getCheckedKeys()
      // await assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      await assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.showPermDialog = false
      this.selectCheck = []
    }
  }
}
</script>

<style>
.el-dialog__header {
  background-color: #5daeff
}
</style>
