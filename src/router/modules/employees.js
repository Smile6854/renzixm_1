// 导出员工的路由规则
import Layot from '@/layout'
export default {
  // 路由规则
  path: '/employees', // 路径地址
  name: 'employees', // 给模块的一级路由加一个name属性 这个属性 我们后面会在做权限的时候用到
  component: Layot,
  children: [
    // 二级路由的path什么都不用写的时候 此时它表示二级路由的默认路由
    {
      path: '', // 这里不用写 甚末都不用写表示 /employees  不但有布局 layout => 员工主页
      component: () => import('@/views/employees'),
      meta: {
        title: '员工管理', // 这里为什么要用title 因为左侧导航读取了这里的title属性
        icon: 'people'
      }
    },
    {
      path: 'detail/:id?', // ？的含义是表示该参数可传可不传 // 动态路由参数  /employees/detail
      component: () => import('@/views/employees/detail'),
      hidden: true, // 表示改内容不在左侧菜单显示
      meta: {
        title: '员工详情'
      }
    }, {
      path: 'print/:id',
      component: () => import('@/views/employees/print'),
      hidden: true, // 这里
      meta: {
        title: '员工打印'
      }
    }
  ]
}
