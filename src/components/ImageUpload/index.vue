<template>
  <div>
    <!-- 给action 一个#号 就不会报错了 -->
    <!-- file-list 是上传的文件列表，让上传组件显示 -->
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :on-preview="preview"
      :on-remove="handleremove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      :file-list="fileList"
      :class="{ disabled : fileComputed }"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-dialog :visible.sync="showDialog" title="图片预览">
      <!--  -->
      <img style="width: 100%; height: 100%" :src="imgUrl" alt="">
    </el-dialog>
    <el-progress v-if="showPercent" :percentage="percent" style="width:180px" />
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5' // 引入腾讯云cos包
const cos = new COS({
  SecretId: 'AKIDDG5f06xZw3xc2EBsKXWGl0zjDSRBfutd', // 身份识别 ID
  SecretKey: 'YqsgGafUBesqZ3IH1bw2sTpvlMiofGcj' // 身份密钥
})
export default {
  data() {
    return {
      fileList: [],
      showDialog: false,
      imgUrl: '',
      currentFileUid: null,
      percent: 0, // 当前的百分比
      showPercent: false
    }
  },
  computed: {
    // 如果它为true 表示就不再显示加号了
    fileComputed() {
      return this.fileList.length === 1
    }
  },
  methods: {
    preview(file) {
      // 点击预览
      //   console.log(file.url)
      this.imgUrl = file.url
      this.showDialog = true
    },
    handleremove(file, fileList) {
    //   console.log(file, fileLis)
    //   this.fileList = fileList // 这种方法也可以
      this.fileList = this.fileList.filter(item => item.uid !== file.uid) // 将当前的删除文件排除在外
    },
    changeFile(file, fileList) {
    //   console.log(file, fileList)
    //   this.fileList.push(file)
    //   this.fileList.length = 1
    // 正规方法
      this.fileList = fileList.map(item => item)
    },
    beforeUpload(file) {
      // console.log(file)
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      // eslint-disable-next-line no-empty
      if (!types.some(item => item === file.type)) {
        // 如果不存在
        this.$message.error('上传的图片只能是 JPG JPEG GIF BMP格式!')
        return false // 上传终止
      }
      // 检查文件 5M  1M =1024KB 1kb =1024B
      const maxSize = 5 * 1024 * 1024
      if (file.zize > maxSize) {
        // 超过了限制文件大小
        this.$message.error('上传文件的大小不能超过5MB!')
        return false
      }
      // 已经确定当前上传的就是当前的file了
      this.currentFileUid = file.uid
      this.showPercent = true
      return true
    },
    // 进行上传操作
    upload(params) {
      // console.log(params.file)
      if (params.file) {
        // 执行上传操作
        cos.putObject({
          Bucket: 'rzxm-1313426708', // 存储桶
          Region: 'ap-nanjing', // 地域
          Key: params.file.name, // 文件名
          Body: params.file, // 要上传的文件对象
          StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
          onProgress: (params) => {
            // console.log(params)
            this.percent = +params.percent * 100
          }
          // 上传到腾讯云 => 那个存储桶 哪个地域的存储桶 文件格式 名称 回调
        }, (err, data) => {
          // data 返回的数据之后 应该如何处理
          // console.log(err || data)
          // data中有一个statusCode === 200 的时候说明成功
          if (!err && data.statusCode === 200) {
            // 此时说明文件上传成功 要获取成功的返回地址
            // fileList才能显示到上传组件上 此时我们要将fileList的数据的url地址变成 现在上传成功的地址
            // 目前虽然是一张图片 但是 我们的fileList是一个数组
            // 需要知道当前上传成功的是拿一张图片
            this.fileList.map(item => {
              if (item.uid === this.currentFileUid) {
                return { url: 'http://' + data.Location, upload: true }
                // upload：true 表示这张图片已经上传完毕 这个属性要为我们后期应用的时候做标记
              }
              return item
            })
            // 关闭进度条
            // 重置百分比
            setTimeout(() => {
              this.showPercent = false
              this.percent = 0
            }, 1000)
          }
        })
      }
    }
  }
}
</script>

<style>
.disabled .el-upload--picture-card {
 display: none
}
</style>
