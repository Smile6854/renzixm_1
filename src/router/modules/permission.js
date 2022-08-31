// 导出员工的路由规则
import Layot from '@/layout'
export default {
  // 路由规则
  path: '/permission', // 路径地址
  name: 'permissions', // 给模块的一级路由加一个name属性 这个属性 我们后面会在做权限的时候用到
  component: Layot,
  children: [
    // 二级路由的path什么都不用写的时候 此时它表示二级路由的默认路由
    {
      path: '', // 这里不用写 甚末都不用写表示 /employees  不但有布局 layout => 员工主页
      component: () => import('@/views/permission'),
      meta: {
        title: '权限管理', // 这里为什么要用title 因为左侧导航读取了这里的title属性
        icon: 'lock'
      }
    }
  ]
}
