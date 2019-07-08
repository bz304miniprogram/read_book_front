// pages/bookshelf/scan.js
import * as watch from "../../components/watch.js";
const app = getApp();
var search = require("./search.js")
Page({
  data: {
    hasResult: false,
    searchList: [],
    recommand: [],
    candidate: [],
    flush: false,
    failed: false,
    type:0
  },
  onLoad: function(options) {
    if (options.type=="scan"){
      this.setData({
        type:1
      })
      wx.setNavigationBarTitle({
        title: '扫一扫',
      })
      this.takePhoto()
    }
    if (options.type=="input"){
      this.setData({
        type: 0
      })
    wx.setNavigationBarTitle({
      title: '查一查',
    })
    }
    watch.setWatcher(this);
  },
  watch: {
    flush: function(newVal, oldVal) {
      this.updateBooks();
    }
  },
  onReady: function() {
    //this.takePhoto();
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
  updateBooks() {
    var list = [];
    for (var i = 0; i < this.data.recommand.length; i++) {
      if (this.data.recommand[i] != null)
        list.push(this.data.recommand[i])
    }
    for (var i = 0; i < this.data.candidate.length; i++) {
      if (this.data.candidate[i])
        for (var j = 0; j < this.data.candidate[i].length; j++)
          list.push(this.data.candidate[i][j]);
    }
    this.setData({
      "searchList": list,
      "hasResult": true
    })
  },
  updateCheckBox(e){
    this.data.searchList[e.detail.index].isFirst = !this.data.searchList[e.detail.index].isFirst
  },
  reset() {
    this.setData({
      'failed': false
    })
    this.takePhoto()
  },
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['camera'],
      success: res => {
        wx.showLoading({
          title: '上传中',
          //mask: true,
        })
        const uploadTask = wx.uploadFile({
          url: app.globalData.HOST + '/upload_pic',
          filePath: res.tempFilePaths[0],
          name: "pic",
          formData: {
            sessionId: app.globalData.sessionId
          },
          success: res => {
            wx.showLoading({
              title: '分析中',
            })
            var ocrResult = JSON.parse(res.data).data;
            console.log("this is ocrResult")
            console.log(ocrResult)
            if (ocrResult.length == 0) {
              wx.hideLoading()
              this.setData({
                'failed': true,
              })
            }
            setTimeout(wx.hideLoading, 100 * ocrResult.length);
            for (let i = 0; i < ocrResult.length; i++) {
              this.data.recommand = new Array(ocrResult.length);
              this.data.candidate = new Array(ocrResult.length);
              search.search(ocrResult[i].search_string, ocrResult[i].search_words, this, i);
            }
          }
        }); //end of uploadTsk
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        });
      },
      fail: res => {
        this.setData({
          "failed": true
        })
      }
    })
  },
  bookshelfAdd() {
    var chosen_books = new Array()
    var searchList = this.data.searchList
    for (var i = 0; i < searchList.length; i++) {
      if (searchList[i].isFirst && !searchList[i].isAdded) {
        chosen_books.push({
          "sessionId": app.globalData.sessionId,
          "imgUrl": searchList[i].imgUrl,
          "webUrl": searchList[i].webUrl,
          "title": searchList[i].title,
          "intro": searchList[i].intro,
          "shortIntro": searchList[i].shortIntro,
          "rating": searchList[i].rating,
        })
        searchList[i].isAdded = true;
      }
    }
    if (chosen_books.length == 0)
      return
    wx.request({
      url: app.globalData.HOST + '/bookshelf_add',
      method: "POST",
      data: {
        "chosen_books": chosen_books
      },
      success: res => {
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
  input_search(e){
    this.data.recommand = new Array(1)
    this.data.candidate = new Array(1)
    search.search(e.detail.search_string,e.detail.search_words,this,0)
  }
})