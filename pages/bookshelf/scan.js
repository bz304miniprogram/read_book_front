// pages/bookshelf/scan.js
const app = getApp();
Page({
  data: {
    useCamera: false,
    hasResult: false,
    bookList: [],
  },
  onLoad: function(options) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.camera'])
          wx.authorize({
            scope: 'scope.camera',
            success: res => {
              this.setData({
                useCamera: true
              })
            },
            fail() {
              console.log("authorize failed")
            }
          })
        else this.setData({
          useCamera: true
        })
      }
    })
  },
  onReady: function() {

  },

  onShow: function() {

  },

  onHide: function() {

  },

  onUnload: function() {

  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  },
  // takePhoto() {
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['original'],
  //     sourceType: [ 'camera'],
  //     success(res) {
  //       // tempFilePath可以作为img标签的src属性显示图片
  //       const tempFilePaths = res.tempFilePaths
  //     }
  //   })
  // },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(app.globalData.sessionId)
        const uploadTask = wx.uploadFile({
          url: 'http://127.0.0.1:8000/upload_pic',
          filePath: res.tempImagePath,
          name: "pic",
          formData: {
            sessionId: app.globalData.sessionId
          },
          success:res=> {
            console.log(res)
            this.setData({
              hasResult:true,
              bookList :JSON.parse(res.data).data
            })
            this.hasResult=true
            console.log(JSON.parse(res.data))
          }

        })
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  test: function() {
    console.log(this.useCamera)
  }
})