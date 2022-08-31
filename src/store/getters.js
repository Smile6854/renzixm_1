// import { userInfo } from "os"

const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token, // token的快捷访问
  name: state => state.user.userInfo.username, // 建立用户名称的映射
  userId: state => state.user.userInfo.userId, // 建立用户名称的映射
  staffPhoto: state => state.user.userInfo.staffPhoto, // 建立头像的快捷访问
  companyId: state => state.user.userInfo.companyId, // 建立对于公司Id的快捷访问
  routes: state => state.permission.routes // 建立权限模块下的快捷访问
  // avatar: state => state.user.avatar,
  // name: state => state.user.name
}
export default getters
