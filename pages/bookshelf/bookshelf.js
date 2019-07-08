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
    bookList: [],
    flush: true,
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
      app.userInfoReadyCallback = res => { // this => bookshelf
        console.log("this is userInfoReadCallback:")
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
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
    if(this.data.flush){
    if (app.globalData.sessionId) {
      this.get_bookshelf(app.globalData.sessionId)
    } else {
      var that = this
      console.log("this is sessionIdReadyCallBack:")
      app.sessionIdReadyCallback = res => {
        that.get_bookshelf(res.sessionId)
      };
    }
    this.data.flush = false;
    }
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
    this.setData({
      "bookList": []
    });
    wx.request({
      url: app.globalData.HOST+'/get_bookshelf', // code2id
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
        if (bookList.length == 0) {
          this.setData({
            "noBooks": true
          })
        } else {
          this.setData({
            "noBooks": false
          })
        }
        for (var i = 0; i < bookList.length; i++) {
          bookList[i]["isSearchList"] = false
          bookList[i]["stringInfoDic"] = encodeURIComponent(JSON.stringify(bookList[i]))
          
        }
        this.setData({
          "bookList": bookList
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
      url: 'scan?type=scan'
    })
    this.data.flush = true;
  },
  input: function () {
    console.log("input")
    wx.navigateTo({
      url: 'scan?type=input'
    })
    this.data.flush = true;
  },
  getUserInfo: function(e) {
    console.log(e)
    if (app.globalData.userInfo = e.detail.userInfo)
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    else{
      app.showToast("授权失败, 可在我的->授权管理中重新授权")
    }
  },
})