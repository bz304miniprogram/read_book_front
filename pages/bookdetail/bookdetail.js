// pages/bookdetail/bookdetail.js
const app = getApp()
Page({
  data: {
    hasIntro: false,
    isPreview: false,
    useAlbum: false,
    generating:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(JSON.parse(options.current))
    let  infoDic= JSON.parse(options.current)
    wx.setNavigationBarTitle({
      title: infoDic.title,
    })
    this.setData({
      "infoDic":infoDic
    })
    if (infoDic.isSearchList) {
      wx.request({
        url: app.globalData.HOST+'/book_intro',
        method: 'POST',
        data: {
          'webUrl': "https://m.douban.com/subject/" + infoDic.webUrl
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          console.log(res)
          this.setData({
            "infoDic.intro": res.data.data.intro,
          })
        },
        fali() {
          console.log("request bookDetail failed")
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log("i am unload")
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  readSuccess(e) {
    console.log(e)
    wx.request({
      url: app.globalData.HOST+'/read_success',
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
    console.log(e)
    wx.request({
      url: app.globalData.HOST+'/start_read',
      method: "POST",
      data: {
        "sessionId": app.globalData.sessionId,
        "webUrl": this.data.infoDic.webUrl,
        "title": this.data.infoDic.title,
        "readTime": e.detail.readTime
      },
      success: res => {
        console.log(res)
        this.setData({
          "ReadTrackerId": res.data.data.ReadTrackerId
        })
      },
      fail() {
        console.log("start read failed")
      }
    })
  },
  longTextPainter(ctx, text, fontsize, width, x, y) { // return the new y
    var row_length = parseInt(width / fontsize);
    var i = 0
    while (i < text.length) {
      var temp = "";
      for (var j = 0; j < row_length && i < text.length; i++, j++)
        temp += text[i]
      ctx.fillText(temp, x, y + fontsize * (parseInt((i - 1) / row_length)))
    }
    return y + fontsize * (parseInt((i - 1) / row_length))
  },
  genPoster() {
    console.log("this is gen_poster")
    var src1 = app.globalData.userInfo;
    var src2 = this.data.infoDic;
    this.setData({
      "generating":true
    })
    wx.showLoading({
      title: '生成中',
      mask: true,
    })
    let promise0 = new Promise(function(resolve, reject) {
      wx.getImageInfo({
        src: '../images/background.png',
        success: function(res) {
          console.log(res)
          resolve(res)
        }
      })
    });
    let promise1 = new Promise(function(resolve, reject) {
      wx.getImageInfo({
        src: src1.avatarUrl,
        success: function(res) {
          console.log(res)
          resolve(res);
        }
      })
    });
    let promise2 = new Promise(function(resolve, reject) {
      wx.getImageInfo({
        src: src2.imgUrl,
        success: function(res) {
          console.log(res)
          resolve(res);
        }
      })
    });
    // let promise3 = new Promise(function(resolve,reject){
    //   wx.request({
    //     url: app.globalData.HOST+'/get_wxcode',
    //     method:'get',
    //     success:res=>{
    //       console.log(res)
    //     },
    //     fail(){
    //       console.log("get_wxcode failed")
    //     }
    //   })
    // })
    /* 图片获取成功才执行后续代码 */
    Promise.all(
      [promise0, promise1, promise2]
    ).then(res => {
      console.log(res)
      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg')
      ctx.setFillStyle('white')
      ctx.fillRect(0, 0, 500, 800)
      ctx.draw()
      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage("../../../../../" + res[0].path, 0, 0, 500, 400)
      ctx.drawImage(res[2].path, 50, 60, 140, res[2].height / res[2].width * 140)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('left') //  位置
      ctx.setFillStyle('white') //  颜色
      ctx.setFontSize(16) //  字号
      ctx.fillText('-发现身边的书-', 190, 20)
      ctx.setFontSize(28)
      var detail_x = 225
      var detail_y = 93
      detail_y = this.longTextPainter(ctx, this.data.infoDic.title, 28, 275, detail_x, detail_y)
      //ctx.fillText(this.data.infoDic.title, 225, 83)
      ctx.setFontSize(18)
      ctx.fillText('作者：' + this.data.infoDic.writer, detail_x + 10, detail_y + 38)
      ctx.fillText('出版社：' + this.data.infoDic.publisher, detail_x + 10, detail_y + 68)
      ctx.fillText('出版时间：' + this.data.infoDic.pubTime, detail_x + 10, detail_y + 98)
      ctx.fillText('评分：' + this.data.infoDic.rating, detail_x + 10, detail_y + 128)
      ctx.fillText('简介：',20,300)
      this.longTextPainter(ctx,this.data.infoDic.intro,18,470,20,330)
      
      ctx.save()
      ctx.beginPath(); //开始绘制
      var avatar_width = 60
      var avatar_x = 120
      var avatar_y = 450
      ctx.arc(avatar_width / 2 + avatar_x, avatar_width / 2 + avatar_y, avatar_width / 2, 0, Math.PI * 2, false);
      ctx.setStrokeStyle('white')
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(res[1].path, avatar_x, avatar_y, avatar_width, avatar_width);
      ctx.restore();
      ctx.setFillStyle('black')
      ctx.fillText("我正在读我书架上的", avatar_x + 70, avatar_y + 25)
      ctx.fillText(this.data.infoDic.title, avatar_x + 70, avatar_y + 50)
      /* 绘制 */
      var that = this
      ctx.draw(true, setTimeout(function() {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 500,
          height: 800,
          destWidth: 500,
          destHeight: 800,
          canvasId: 'shareImg',
          success: function(res) {
            wx.hideLoading()
            console.log(res.tempFilePath);
            that.setData({
              "posterUrl": res.tempFilePath,
              "isPreview": true,
              "generating":false,
            })
          },
          fail: function(res) {
            console.log("canvas to file failed")
          }
        });
      }, 1000));

    });
  },
  save() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum'])
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: res => {
              this.savetoAlbum()
            },
            fail:res=> {
              this.setData({
                isPreview:false,
              })
              app.showToast("授权失败, 可在我的->授权管理中重新授权")
              console.log("authorize failed")
            }
          });
        else
        this.savetoAlbum()
      }
    });
  },
  hidePreview(){
    this.setData({
      isPreview:false,
    })
  },
  savetoAlbum() {
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.posterUrl,
      success(res) {
        console.log(res)
      },
      fail() {
        app.showToast("授权失败, 可在我的->授权管理中重新授权")
        console.log("save to Album failed")
      }
    })
  }
})