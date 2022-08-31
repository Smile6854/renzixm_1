<template>
  <div class="dashboard-container">
    <div class="app-container">
      <pagetools :show-before="true">
        <!-- 左侧显示总记录数 -->
        <!-- <span slot="before">共16条记录</span> -->
        <template v-slot:before>
          <span>共{{ page.total }}条记录</span>
        </template>
        <template v-slot:after>
          <el-button
            size="small"
            type="success"
            @click="$router.push('/import')"
          >excel导入</el-button>
          <el-button size="small" type="danger" @click="exportData">excel导出</el-button>
          <el-button
            :disabled="!checkPermission('POINT-USER-ADD')"
            size="small"
            icon="plus"
            type="primary"
            @click="showDialog = true"
          >新增员工</el-button>
        </template>
      </pagetools>
      <!-- 表格组件 -->
      <el-card>
        <!-- //border：显示边框，:border="true" -->
        <el-table v-loading="loading" border :data="list">
          <!-- //sortable是可排序的意思：规范写法sortable，只写属性名，代表:sortable="true" -->
          <el-table-column type="index" label="序号" sortable="" />
          <!-- //label列名 -->
          <el-table-column prop="username" label="姓名" sortable="" />
          <el-table-column label="头像" sortable="" width="120px" align="center">
            <template v-slot="{ row }">
              <img v-imagerror="require('@/assets/common/head.jpg')" :src="row.staffPhoto" style="border-radius: 50%; width: 100px; height: 100px; padding: 10px" alt="" @click="showQrCode(row.staffPhoto)">
            </template>
          </el-table-column>
          <el-table-column prop="workNumber" label="工号" sortable="" />
          <el-table-column
            prop="formOfEmployment"
            label="聘用形式"
            sortable=""
            :formatter="formatEmployment"
          />
          <el-table-column prop="departmentName" label="部门" sortable="" />
          <!-- 用作用域插槽来做+ 过滤器 -->
          <el-table-column prop="timeOfEntry" label="入职时间" sortable="">
            <!--  -->
            <template v-slot="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column prop="enableState" label="账户状态" sortable="">
            <template v-slot="{ row }">
              <!-- 根据当前的状态来 确定开关的打开 -->
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <!-- //table-column嵌套其他标签，需要用template，不需要写插槽名，默认插槽 -->
            <template v-slot="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
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
          <el-pagination
            layout="prev, pager, next"
            :current-page="page.page"
            :page-size="page.size"
            :total="page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
    </div>
    <!--  放置弹层-->
    <!-- sync修饰符 是 自组件 去改变父组件的数据的一个语法糖 -->
    <AddEmployee :show-dialog.sync="showDialog" />
    <!--  -->
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <!-- 放置分配角色权限弹层 -->
    <AssignRole ref="assignRole" :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入员工的枚举对象
import AddEmployee from './components/add-employee'
import AssignRole from './components/assign-role'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
// import { url } from 'inspector'

export default {
  name: 'Dashboard',
  components: {
    AddEmployee, AssignRole
  },
  data() {
    return {
      list: [], // 接收数组
      page: {
        page: 1, //
        size: 10, //
        total: 0 // 总数
      },
      loading: false, // 显示遮罩层
      showDialog: false, // 显示弹层
      showCodeDialog: false, // 显示二维码弹层
      showRoleDialog: false, // 显示分配权限弹层
      userId: null // ID
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      const { rows, total } = await getEmployeeList(this.page)
      this.list = rows
      this.page.total = total
      // console.log(this.list)
    },
    changePage(newPage) {
      this.page.page = newPage // 赋值最新页码
      this.getEmployeeList() // 从新拉取数据
    },
    formatEmployment(row, column, cellValue, index) {
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    async deleteEmployee(id) {
      try {
        await this.$confirm('你确定删除吗？')
        await delEmployee(id)
        this.getEmployeeList()
        this.$message.success('删除员工成功')
      } catch (err) {
        console.log(err)
      }
    },
    // 导出excel数据
    exportData() {
      // 做操作
      // 表头对应
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName'
      }
      // 导出excel
      import('@/vendor/Export2Excel').then(async(excel) => {
        // excel 是引入文件的导出对象
        // 导出 header从哪里来
        // data从哪里来
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total
        })
        const data = this.formatJson(headers, rows)
        const multiHeader = [
          ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
          ['姓名', '主要信息', '', '', '', '', '部门']
        ]
        const merges = ['A2:A3', 'B2:F2', 'G2:G3']
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: '员工工资表',
          multiHeader,
          merges
        })
        // [{ suername: '张三',mobile:12131212123 }] => [[]]
        // 要转化 数据结构 还要和表头的顺序对应上
        // 要求转出的标题是中文
      })
    },
    // 将表头数据和数据 进项对应
    formatJson(headers, rows) {
      return rows.map((item) => {
        // item是一个对象
        return Object.keys(headers).map((key) => {
          if (
            headers[key] === 'timeOfEntry' ||
            headers[key] === 'correctionTime'
          ) {
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            )
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
      })
      // 第二中写法
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
    },
    showQrCode(url) {
      // url存在的情况下 才弹出层
      if (url) {
        this.showCodeDialog = true
        this.$nextTick(() => {
          // 此时已经确定有ref 对象 了
          QrCode.toCanvas(this.$refs.myCanvas, url)
        })
      } else {
        this.$message.warning('该用户未上传头像')
      }
    },
    async editRole(id) {
      // 弹出层
      this.userId = id // props赋值 props赋值渲染是异步的
      await this.$refs.assignRole.getUserDetailById(id) // 调用子组件方法
      this.showRoleDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
