// components/guide.js
// var textPainter = require("../poster/text_painter.js");
// const app = getApp();
// const cx = wepy.createCanvasContext('chart')
Component({
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    closeGuide() {
      this.setData({
        'isPreview': false
      })
    },
    guideUser() {
      let promise0 = new Promise(function (resolve, reject) { //请求蓝色箭头
        wx.getImageInfo({
          src: '../../pages/images/arrow.png',
          success: function (res) {
            resolve(res)
          }
        })
      });
      let promise1 = new Promise(function (resolve, reject) { //请求蓝色箭头
        wx.getImageInfo({
          src: '../../pages/images/arrow2.png',
          success: function (res) {
            resolve(res)
          }
        })
      });
      let promise2 = new Promise(function (resolve, reject) { //请求背景图片
        wx.getImageInfo({
          src: '../../pages/images/pure-gray.png',
          success: function (res) {
            resolve(res)
          }
        })
      });
      Promise.all(
        [promise0, promise1, promise2]
      ).then(res => {
        console.log('begin guide')
        const ctx = wx.createCanvasContext('guide', this) //绑定一个组件
        //构建底板
        // ctx.setFillStyle('white')
        // ctx.fillRect(0, 0, 400, 400)
        // ctx.drawImage("../../" + res[2].path, 0, 0, 400, 400) 

        //绘制方法
        ctx.setTextAlign('left') //  位置
        ctx.setFillStyle('white') //  颜色
        ctx.setFontSize(20) //  字号
        ctx.textAlign = "center"; //文字居中
        ctx.fillText('单击以输入书名添加书籍', 200, 80)
        ctx.fillText('拍摄书架以添加书籍', 280, 150)

        ctx.drawImage("../../" + res[1].path, 280, 0, 160, 160)
        ctx.drawImage("../../" + res[0].path, 300, 5, 50, 50)


        /* 绘制 */
        var that = this
        ctx.draw(true, function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 400,
            height: 200,
            destWidth: 400,
            destHeight: 200,
            canvasId: 'guide',
            success: function (res) {
              wx.hideLoading()
              that.setData({
                "posterUrl": res.tempFilePath,
                "isPreview": true,
                "generating": false,
              })
            }, //success: function (res)
            fail: function (res) {
              console.log(res)
            } //fail: function (res)
          }, that); //wx.canvasToTempFilePath
        }); //ctx.draw(true, function ()
      })
    }
  } //methods
})