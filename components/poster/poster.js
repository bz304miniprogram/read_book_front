// components/poster.js
var textPainter = require("./text_painter.js");
const app = getApp();
Component({
  properties: {
    infoDic: {
      type: Object,
    },
    posterType: {
      type: String,
      value: null,
    },
    cached: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: { //调用两个画图
    genPoster(infoDic) {
      if (this.properties.cached) {
        this.setData({
          'isPreview': true
        })
        return
      } else {
        if (this.properties.posterType == 'detail') {
          this.genPoster_detail(infoDic)
          this.properties.cached = true
        }
        if (this.properties.posterType == 'annual') {
          this.genPoster_annual(infoDic)
          this.properties.cached = true
        }
      }
    },
    savetoAlbum() {
      var that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.properties.posterUrl,
        success(res) {
          console.log(res)
        },
        fail() {
          app.showToast("授权失败, 可在我的->授权管理中重新授权")
          console.log("save to Album failed")
        }
      })
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
              fail: res => {
                this.setData({
                  isPreview: false,
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
    hidePreview() {
      this.setData({
        isPreview: false,
      })
    },
    genPoster_detail(infoDic) {
      if (app.globalData.userInfo == null) {
        app.showToast("获取信息失败，请在我的->授权管理开启信息权限")
        return
      } else
        var src1 = app.globalData.userInfo
      var src2 = infoDic;
      this.setData({
        "generating": true
      })
      wx.showLoading({
        title: '生成中',
        mask: true,
      })

      let promise0 = new Promise(function(resolve, reject) { //请求背景图
        wx.getImageInfo({
          src: '../../pages/images/background.png',
          success: function(res) {
            resolve(res)
          }
        })
      });
      let promise1 = new Promise(function(resolve, reject) { //用户头像
        wx.getImageInfo({
          src: src1.avatarUrl,
          success: function(res) {
            resolve(res);
          }
        })
      });
      let promise2 = new Promise(function(resolve, reject) { //书的封面
        wx.getImageInfo({
          src: src2.imgUrl,
          success: function(res) {
            resolve(res);
          }
        })
      });
      let promise3 = new Promise(function(resolve, reject) { //小程序图
        wx.getImageInfo({
          src: app.globalData.HOST + "/get_wxcode",
          success: res => {
            resolve(res)
          },
          fail: res => {
            console.log("get_wxcode failed")
          }
        })
      })

      /* 图片获取成功才执行后续代码 */
      Promise.all(
        [promise0, promise1, promise2, promise3]
      ).then(res => {
        console.log(res)
        /* 创建 canvas 画布 */
        const ctx = wx.createCanvasContext('shareImg', this)
        ctx.setFillStyle('white')
        ctx.fillRect(0, 0, 500, 800)
        ctx.draw()
        /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
        ctx.drawImage("../../" + res[0].path, 0, 0, 500, 400) //大背景
        ctx.drawImage(res[2].path, 50, 60, 140, res[2].height / res[2].width * 140) /*书籍图片*/
        ctx.drawImage(res[3].path, 150, 550, 200, 200); //小程序图片
        /* 绘制文字 位置自己计算 参数自己看文档 */
        ctx.setTextAlign('left') //  位置
        ctx.setFillStyle('white') //  颜色
        ctx.setFontSize(16) //  字号
        ctx.fillText('-发现身边的书-', 190, 20)
        ctx.setFontSize(28)
        var detail_x = 225
        var detail_y = 93
        detail_y = textPainter.longTextPainter(ctx, infoDic.title, 28, 275, detail_x, detail_y, 2) //绘制大题目
        // ctx.fillText(infoDic.title, 225, 83)
        ctx.setFontSize(18)
        var detail_list = ['作者：' + infoDic.writer, '出版社：' + infoDic.publisher, '出版时间：' + infoDic.pubTime, '评分：' + infoDic.rating]
        textPainter.blockPainter(ctx, detail_list, 18, 2645, detail_x + 10, detail_y + 38, 28) //绘制上一句话
        ctx.fillText('简介：', 20, 300)
        textPainter.longTextPainter(ctx, infoDic.intro, 18, 470, 20, 330, 4) //绘制简介内容

        ctx.save()
        ctx.beginPath(); //开始绘制
        var avatar_width = 60
        var avatar_x = 120
        var avatar_y = 450
        ctx.arc(avatar_width / 2 + avatar_x, avatar_width / 2 + avatar_y, avatar_width / 2, 0, Math.PI * 2, false);
        ctx.setStrokeStyle('white')
        // ctx.stroke();
        // ctx.clip();
        ctx.drawImage(res[1].path, avatar_x, avatar_y, avatar_width, avatar_width); //微信头像方变园
        // ctx.restore();
        ctx.setFillStyle('black')
        ctx.fillText("我正在读我书架上的", avatar_x + 70, avatar_y + 25)
        textPainter.longTextPainter(ctx, infoDic.title, 18, 300, avatar_x + 70, avatar_y + 50) //绘制书名


        /* 绘制 */
        var that = this
        ctx.draw(true, function() {
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
              that.setData({
                "posterUrl": res.tempFilePath,
                "isPreview": true,
                "generating": false,
              })
            },
            fail: function(res) {
              console.log(res)
            }
          }, that);
        });
      });
    },

    //以下开始第二张图

    genPoster_annual(infoDic) {
      if (app.globalData.userInfo == null) {
        app.showToast("获取信息失败，请在我的->授权管理开启信息权限")
        return
      } else
        var src1 = app.globalData.userInfo //全局
      var src2 = infoDic; //后端请求的内容
      this.setData({
        "generating": true
      })
      wx.showLoading({
        title: '生成中',
        mask: true,
      })

      let promise0 = new Promise(function(resolve, reject) { //请求背景图
        wx.getImageInfo({
          src: '../../pages/images/wallhaven-j5ky3m.png',
          success: function(res) {
            resolve(res)
          }
        })
      });
      let promise1 = new Promise(function(resolve, reject) { //头像
        wx.getImageInfo({
          src: src1.avatarUrl,
          success: function(res) {
            resolve(res);
          }
        })
      });
      // let promise2 = new Promise(function (resolve, reject) {//书封面
      //   wx.getImageInfo({
      //     src: src2.imgUrl,
      //     success: function (res) {
      //       resolve(res);
      //     }
      //   })
      // });
      let promise3 = new Promise(function(resolve, reject) { //小程序
        wx.getImageInfo({
          src: app.globalData.HOST + "/get_wxcode",
          success: res => {
            resolve(res)
          },
          fail: res => {
            console.log("get_wxcode failed")
          }
        })
      })
      /* 图片获取成功才执行后续代码 */
      Promise.all(
        [promise0, promise1, promise3]
      ).then(res => {
        const ctx = wx.createCanvasContext('shareImg', this) //绑定一个组件

        //构建底板
        ctx.setFillStyle('white')
        ctx.fillRect(0, 0, 500, 800)
        ctx.drawImage("../../" + res[0].path, 0, 0, 500, 800) //大背景

        //绘制标题
        ctx.setTextAlign('left') //  位置
        ctx.setFillStyle('black') //  颜色
        ctx.setFontSize(24) //  字号
        ctx.textAlign="center"; //文字居中
        ctx.fillText('-年度统计-', 250, 30)

        //最常读
        ctx.setTextAlign('left') //  位置
        ctx.setFillStyle('black') //  颜色
        ctx.setFontSize(20) //  字号
        ctx.textAlign="center"; //文字居中
        
        ctx.fillText(infoDic.maxTime, 250, 70)
        ctx.fillText('是这一年你读过最多的书', 250, 105)
        ctx.fillText('共计阅读了'+infoDic.sum+'分钟', 250, 140)

        /** 画饼图*/
        // 数据源
        var array = [infoDic.topTag[0][1], infoDic.topTag[1][1], infoDic.topTag[2][1], infoDic.topTag[3][1], infoDic.topTag[4][1], infoDic.topTag[5][1]];
        var colors = ["#48D1CC", "#238E23", "#9370DB", "#87CEEB", "#6B8E23", "#FFE4B5"];
        var total = 0;
        // 计算总量
        for  (var  val  =  0;  val  <  array.length;  val++)  {      
          total  +=  array[val];    
        }
        
        // 圆心坐标
        var point = {
          x: 150,
          y: 600 
        };
        //半径
        var radius = 140;
        for (var i = 0; i < array.length; i++) {      
          ctx.beginPath();      
          var  start  =  0;      
          if  (i  >  0)  {        
            for  (var  j  =  0;  j  <  i;  j++)  {          
              start  +=  array[j]  /  total  *  2  *  Math.PI;        
            }      
          }      
          ctx.arc(point.x,  point.y,  radius,  start,  start + array[i]  /  total  *  2  *  Math.PI,  false);      
          ctx.setLineWidth(2);
          ctx.lineTo(point.x,  point.y);      
          ctx.setStrokeStyle('#F5F5F5');      
          ctx.setFillStyle(colors[i]);      
          ctx.fill();      
          ctx.closePath();      
          ctx.stroke();    
        }

        //饼图文字
        ctx.setTextAlign('left') //  位置
        ctx.setFillStyle('black') //  颜色
        ctx.setFontSize(16) //  字号
        // ctx.textAlign="center"; //文字居中
        
        ctx.fillText(infoDic.topTag[0][0], 350, 450)
        ctx.fillText(infoDic.topTag[1][0], 350, 500)
        ctx.fillText(infoDic.topTag[2][0], 350, 550)
        ctx.fillText(infoDic.topTag[3][0], 350, 600)
        ctx.fillText(infoDic.topTag[4][0], 350, 650)
        ctx.fillText(infoDic.topTag[5][0], 350, 700)

        console.log(infoDic)
        /* 创建 canvas 画布 */
        //const ctx = wx.createCanvasContext('shareImg', this)
        // ctx.setFillStyle('white')
        // ctx.fillRect(0, 0, 500, 800)
        // ctx.setTextAlign('left') //  位置
        // ctx.setFillStyle('black') //  颜色
        // ctx.setFontSize(16) //  字号
        // ctx.fillText(infoDic.maxTime, 20, 30)
        // ctx.fillText(infoDic.topTag, 20, 50)

        // ctx.draw()
        // ctx.drawImage("../../" + res[0].path, 0, 0, 500, 800) //大背景
        // //ctx.drawImage(res[2].path, 50, 60, 140, res[2].height / res[2].width * 140) /*书籍图片*/
        // ctx.drawImage(res[2].path, 150, 550, 200, 200); //小程序图片
        // ctx.drawImage(res[1].path, 225, 93, 60, 60); //微信头像



        /* 绘制 */
        var that = this
        ctx.draw(true, function() {
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
              that.setData({
                "posterUrl": res.tempFilePath,
                "isPreview": true,
                "generating": false,
              })
            }, //success: function (res)
            fail: function(res) {
              console.log(res)
            } //fail: function (res)
          }, that); //wx.canvasToTempFilePath
        }); //ctx.draw(true, function ()
      }); //Promise.all([]).then
    }, //genPoster_annual(infoDic)
  } //methods
})