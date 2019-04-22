// pages/bookshelf/bookshelf.js
var base64 = require("../images/bookshelf");
const app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    bookList: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function() {
    this.setData({
      background: base64.background,
    });
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(res.userInfo)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    if (app.globalData.sessionId) {
      this.get_bookshelf(app.globalData.sessionId)
    } else {
      app.sessionIdReadyCallback = res => {
        callback: this.get_bookshelf(res.sessionId)
      }
    }

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  },
  get_bookshelf: function(sessionId) {
    wx.request({
      url: 'http://127.0.0.1:8000/get_bookshelf', // code2id
      method: "POST",
      data: {
        'sessionId': sessionId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        console.log(res)
        var bookList = res.data.data
        for(var i=0;i<bookList.length;i++){
          bookList[i]["isSearchList"] = false
          bookList[i]["dataDic"] = JSON.stringify(bookList[i])
        }
        this.setData({
          bookList: res.data.data
        })
      },
      fail() {
        console.log('get_bookshelf failed')
      }
    })
  },
  scan: function() {
    console.log("scanning")
    wx.navigateTo({
      url: 'scan'
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})