//app.js
//sesisonId bind with wx.login() and app.globalData always contains sessionId and userInfo
App({
  server_update_user() {
    wx.request({
      url: this.globalData.HOST + '/update_user',
      method: 'POST',
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded'
      // },
      data: {
        'sessionId': this.globalData.sessionId,
        'userInfo': this.globalData.userInfo
      },
      complete(res) {
        console.log(res.data.message)
      }
    });
  },
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        wx.request({ // 发送 res.code 到后台换取 openId, sessionKey, unionId
          url: this.globalData.HOST + '/code2id', // code2id
          data: {
            'code': res.code
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: res => {
            console.log("this is sessionId:")
            console.log(res.data.data.sessionId)
            this.globalData.sessionId = res.data.data.sessionId;
            this.globalData.hasSessionId = true;
            this.get_track(res.data.data.sessionId, "week")
            //this.get_track(res.data.data.sessionId, "month")
            if (this.sessionIdReadyCallback) {
              this.sessionIdReadyCallback(res.data.data)
            }
            if (this.globalData.hasUserInfo)
              this.server_update_user()
          },
          fail() {
            console.log('code2seesion failed')
          }
        })

      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              this.globalData.hasUserInfo = true;
              if (this.globalData.hasSessionId)
                this.server_update_user()
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    HOST: "http://118.25.153.35:80"
    //sessionId
  },
  showToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
    }, 4000)
  },
  get_track(sessionId, range) {
    var track_url;
    if (range == "week") {
      track_url = this.globalData.HOST + "/get_week_track";
    } else {
      track_url = this.globalData.HOST + "/get_month_track"
    }
    wx.request({
      url: track_url,
      method: "POST",
      data: {
        "sessionId": sessionId
      },
      success: res => {
        console.log(res)
        if (range == "week")
          this.globalData.week_track = res.data.data;
        else
          this.globalData.month_track = res.data.data;
      },
      fail: res => {
        console.log("get week tracker failed")
      }
    });
  }
})