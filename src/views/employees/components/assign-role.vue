<template>
  <el-dialog title="分配角色" :visible="showRoleDialog" @close="btnCancel">
    <!-- el-checkbox-group选中的是 当前用户所拥有的角色  需要绑定 当前用户拥有的角色-->
    <el-checkbox-group v-model="roleIds">
      <!-- 选项 -->
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        <!--  -->
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false
    },
    // 用户的id 用来查询当前用户的角色信息
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: [], // 角色列表
      roleIds: [] // 这个数组负责存储 当前用户所拥有的角色id
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { rows } = await getRoleList({ page: 1, pagesize: 20 }) // 默认取20条数据
      this.list = rows
    },
    // 这个方法是甚末时候调用？ props传值是异步的 所以这里不能用 this.userId
    // 这个方法是给父组件调用的
    async getUserDetailById(id) {
      const { roleIds } = await getUserDetailById(id) // 将用户所拥有的角色赋值给当前用户的对象
      this.roleIds = roleIds
    },
    async btnOK() {
      await assignRoles({ id: this.userId, roleIds: this.roleIds }) // 保存用户的角色
      //  关闭弹层
      this.$emit('update:showRoleDialog', false)
      this.$message.success('保存成功')
    //   this.$parent.showRoleDialog = false
    },
    btnCancel() {
      this.roleIds = []
      this.$emit('update:showRoleDialog', false)
    }
  }
}
</script>
