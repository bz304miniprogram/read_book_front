//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
  },
  //事件处理函数
  onLoad: function() {
    this.setData({
      "userInfo":app.globalData.userInfo,
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
  genPoster(){
    wx.request({
      url: app.globalData.HOST + '/get_annual_poster',
      method:"POST",
      data:{
        'sessionId':app.globalData.sessionId
      },
      success:res=>{
        console.log(res)
      },
      fail(res){
        console.log(res)
      }
    })
  }
})