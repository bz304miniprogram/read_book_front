// pages/bookshelf/scan.js
import * as watch from "../../components/watch.js";
const app = getApp();
var search = require("./search.js")
Page({
  data: {
    hasResult: false,
    searchList: [],
    recommend: [],
    candidate: [],
    query_complete: [],
    flush: false,
    failed: false,
    type: '',
    dialog_visible: -1,
    photo: '',
    scaning: true,
  },
  onLoad: function(options) {
    this.setData({
      'type': options.type
    })
    if (options.type == "scan") {
      wx.setNavigationBarTitle({
        title: '扫一扫',
      })
      this.takePhoto()
    }
    if (options.type == "input") {
      wx.setNavigationBarTitle({
        title: '查一查',
      })
    }
    watch.setWatcher(this);
  },
  watch: {
    flush: function(newVal, oldVal) {
      this.updateBooks();
    },
    query_complete: function(newVal, oldVal) {
      var f = true;
      for (var i = 0; i < newVal.length; i++)
        if (!newVal[i]) {
          f = false;
          break;
        }
      if (f) {
        wx.hideLoading()
      }
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
    if (this.data.type == "input") {
      for (var i = 0; i < this.data.recommend.length; i++) {
        if (this.data.recommend[i] != null){
          this.data.recommend[i]["type"] = "search_input"
          list.push(this.data.recommend[i])
        }
      }
      for (var i = 0; i < this.data.candidate.length; i++) {
        if (this.data.candidate[i])
          for (var j = 0; j < this.data.candidate[i].length; j++){
            this.data.candidate[i][j]["type"] = "search_input"
            list.push(this.data.candidate[i][j]);
          }
      }
      this.setData({
        "searchList": list,
        "hasResult": true
      })
    } else {
      for (var i = 0; i < this.data.recommend.length; i++) {
        if (this.data.recommend[i] != null)
          list.push(this.data.recommend[i])
      }
      this.setData({
        "searchList": list,
        "candidate": this.data.candidate,
        "hasResult": true
      })
    }
  },
  updateCheckBox(e) {
    this.data.searchList[e.detail.index].isFirst = !this.data.searchList[e.detail.index].isFirst
  },
  showCandidate(e) {
    this.setData({
      'dialog_visible': e.detail.index
    })
    this.selectComponent("#dialog_" + e.detail.index.toString()).setTitle(e.detail.search_string)
  },
  closeHandler() {
    this.setData({
      'dialog_visible': -1
    })
  },
  exchangeItem(e) {
    this.data.searchList[e.detail.row_idx]["type"] = "search_candidate";
    var temp = this.data.searchList[e.detail.row_idx];
    this.data.candidate[e.detail.row_idx][e.detail.col_idx]["type"] = "search_recommend";
    this.data.searchList[e.detail.row_idx] = this.data.candidate[e.detail.row_idx][e.detail.col_idx];
    this.data.candidate[e.detail.row_idx][e.detail.col_idx] = temp;
    this.setData({
      'searchList':this.data.searchList,
      'candidate':this.data.candidate
    })
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
      sourceType: ['camera', 'album'],
      success: res => {
        wx.showLoading({
          title: '上传中',
          //mask: true,
        })
        this.setData({
          'photo': res.tempFilePaths[0],
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
            //setTimeout(wx.hideLoading, 100 * ocrResult.length);
            for (let i = 0; i < ocrResult.length; i++) {
              this.data.recommend = new Array(ocrResult.length);
              this.data.candidate = new Array(ocrResult.length);
              this.data.query_complete = new Array(ocrResult.length).fill(false);
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
  input_search(e) {
    this.data.recommend = new Array(1)
    this.data.candidate = new Array(1)
    this.data.query_complete = [false]
    wx.showLoading({
      title: '找啊找',
      //mask: true,
    })
    search.search(e.detail.search_string, e.detail.search_words, this, 0,10)
  }
})