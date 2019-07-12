//index.js
//获取应用实例
const app = getApp()
Page({
  data: {},
  //事件处理函数
  onLoad: function() {
    this.setData({
      "userInfo": app.globalData.userInfo,
    })
  },
  openSetting: function() {
    wx.openSetting({
      success: res => {
        console.log("openSetting success")
        //if(res.authSetting['scope:userInfo'])
      }
    })
  },
  genPoster() {
    wx.request({
      url: app.globalData.HOST + '/get_annual_poster',
      method: "POST",
      data: {
        'sessionId': app.globalData.sessionId
      },
      success: res => {
        console.log(res)
        if (res.data.data.maxTime == "") {
          app.showToast("选择一本书开始读吧")
          return
        }
        this.selectComponent("#poster").genPoster(res.data.data) //genposter 触发前 setData已经执行完毕
      },
      fail(res) {
        console.log(res)
      }
    })
  }
})