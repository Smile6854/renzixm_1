<template>
  <!-- 因为要布局 所以要变成块元素 -->
  <div>
    <svg-icon
      icon-class="fullscreen"
      style="color: #fff; width: 20px; height: 20px"
      @click="changeScreen"
    />
  </div>
</template>

<script>
import screenfull from 'screenfull'

export default {
  methods: {
    changeScreen() {
      //   document.documentElement.requestFullscreen()
      if (!screenfull.isEnabled) {
        this.$message.warning('当前全屏功能不可用')
        return
      }
      //   直接全屏
      screenfull.toggle() // 全屏方法
    }
  }
}
</script>

<style></style>
