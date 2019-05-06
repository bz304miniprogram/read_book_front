// pages/bookshelf/scan.js
const app = getApp();
Page({
  data: {
    useCamera: false,
    hasResult: false,
    searchList: [],
    disabled: false,
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
              app.showToast("授权失败, 可在我的->授权管理中重新授权")
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
    if (this.data.disabled)
      return
    wx.showLoading({
      title: '分析中',
      mask:true,
    })
    this.setData({
      "disabled": true,
    })
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(app.globalData.sessionId)
        const uploadTask = wx.uploadFile({
          url: app.globalData.HOST+'/upload_pic',
          filePath: res.tempImagePath,
          name: "pic",
          formData: {
            sessionId: app.globalData.sessionId
          },
          success: res => {
            wx.hideLoading()
            var searchList = JSON.parse(res.data).data
            console.log("this is searchList:")
            console.log(searchList)
            for (var i = 0; i < searchList.length; i++) {
              searchList[i]["isSearchList"] = true
              searchList[i]["isAdded"] = false;
              searchList[i]["stringInfoDic"] = JSON.stringify(searchList[i])
            }
            this.setData({   //bind searchList to searchList
              hasResult: true,
              searchList: searchList,
            })
            wx.setNavigationBarTitle({
              title: "识别结果"
            })
            console.log(JSON.parse(res.data))
          }

        });
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        })
      }
    })
  },
  updateCheckBox(e) {
    var temp = this.data.searchList
    console.log(e.detail)
    temp[e.detail.index].isFirst = !temp[e.detail.index].isFirst
    this.setData({
      searchList: temp
    })
  },
  bookshelfAdd() {
    var chosen_books = new Array()
    console.log(this.data.searchList)
    var searchList = this.data.searchList
    for (var i = 0; i < searchList.length; i++) {
      if (searchList[i].isFirst) {
        chosen_books.push({
          "sessionId": app.globalData.sessionId,
          "imgUrl": searchList[i].imgUrl,
          "webUrl": searchList[i].webUrl,
          "title": searchList[i].title,
          //"writer": searchList[i].writer,
          //"publisher": searchList[i].publisher,
          "intro": searchList[i].intro,
          "shortIntro":searchList[i].shortIntro,
          "rating": searchList[i].rating,
          //"pubTime":searchList[i].pubTime,
        })
        searchList[i].isAdded = true;
      }
    }
    wx.request({
      url: app.globalData.HOST+'/bookshelf_add',
      method: "POST",
      data: {
        "chosen_books": chosen_books
      },
      success: res => {
        console.log(res)
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          "searchList": searchList,
        })
        // empty list navigateback
        var f = 1
        for (var i = 0; i < searchList.length; i++)
          if (!searchList[i].isAdded) {
            f = 0
            break
          }
        if (f)
          wx.navigateBack({
            delta: 1
          })
        // end of isempty
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