// 负责管理所有的自定义指令

export const imagerror = {
// 指令对象，会在当前的dom元素插入到节点之后执行
  inserted(dom, options) {
    // dom 表示当前指令作用的dom对象
    // dom 认为此时就是图片
    dom.src = dom.src || options.src // 初始化的时候 如果有值 则赋值 如果没值 则需要进行默认值赋值
    // 当图片有地址 但是地址没有加载成功的时候会报错 会触发图片的一个事件 => onerror
    dom.onerror = function() {
    // 当图片出现异常的时候 会将指令配置的默认图片设置为该图片的内容
    // dom 可以注册error
      dom.src = options.value
    }
  },
  componentUpdated(dom, options) {
    // 该钩子函数惠子啊当前指令作用的组件 更新数据完毕之后 执行
    // inserted只会执行一次
    dom.src = dom.src || options.src
  }
}

// {/* <img v-imagerror="img" /> */}
// data(){ return {img: 'a.png} }
