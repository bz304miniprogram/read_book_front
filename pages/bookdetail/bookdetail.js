// pages/bookdetail/bookdetail.js
const app = getApp()
Page({
  data: {
    hasIntro: false,
    isPreview: false,
    useAlbum: false,
    generating: false,
    startRead: false,
    hasDetailIntro: false,
    isPreview2: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //console.log(options.current)
    let infoDic = JSON.parse(decodeURIComponent(options.current))
    console.log(infoDic)
    wx.setNavigationBarTitle({
      title: infoDic.title,
    })
    this.setData({
      "infoDic": infoDic
    })
    if (!infoDic.writer) {
      wx.request({
        url: app.globalData.HOST + "/update_infoDic",
        data: {
          'webUrl': infoDic.webUrl,
          'shortIntro': infoDic.shortIntro
        },
        method: "POST",
        success: res => {
          var newInfoDic = Object.assign(infoDic, res.data.data.infoDic)
          this.setData({
            "infoDic": newInfoDic
          })
        },
        fail(res) {
          console.log("update infoDic failed")
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log("i am onhide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log("i am unload")
    if (this.data.ReadTrackerId) {
      wx.reLaunch({
        url: '../bookshelf/bookshelf',
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  previewImage: function(){
    wx.previewImage({
      current: 'this.data.infoDic.imgUrl', // 当前显示图片的http链接
      urls: [this.data.infoDic.imgUrl] // 需要预览的图片http链接列表
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getDetailIntro() {
    if (!this.data.hasDetailIntro) {
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      wx.request({
        url: app.globalData.HOST + '/book_intro',
        method: 'POST',
        data: {
          'webUrl': "https://m.douban.com/subject/" + this.data.infoDic.webUrl
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          console.log(res)
          wx.hideLoading()
          this.setData({
            "infoDic.detailIntro": res.data.data.intro,
            "hasDetailIntro": true,
          })
        },
        fali() {
          console.log("request bookDetail failed")
        }
      })
    }
  },
  readSuccess(e) {
    console.log(e)
    wx.request({
      url: app.globalData.HOST + '/read_success',
      method: 'POST',
      data: {
        "ReadTrackerId": this.data.ReadTrackerId
      },
      success: res => {
        console.log(res)
      },
      fail() {
        console.log("read success failed")
      }
    })
  },
  startRead(e) {
    wx.request({
      url: app.globalData.HOST + '/start_read',
      method: "POST",
      data: {
        "sessionId": app.globalData.sessionId,
        "webUrl": this.data.infoDic.tags, //temporarily put tag in webUrl
        "title": this.data.infoDic.title,
        "readTime": e.detail.readTime
      },
      success: res => {
        console.log(res)
        app.get_track(app.globalData.sessionId, 'week');
        this.setData({
          "ReadTrackerId": res.data.data.ReadTrackerId
        })
      },
      fail() {
        console.log("start read failed")
      }
    })
  },
  genPoster() {
    this.selectComponent("#poster").genPoster(this.data.infoDic)
  },
})