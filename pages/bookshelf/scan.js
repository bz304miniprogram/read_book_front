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
      title: '上传中',
      mask: true,
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
          url: app.globalData.HOST + '/upload_pic',
          filePath: res.tempImagePath,
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
            if(ocrResult.length==0){
              wx.hideLoading()
              app.showToast("图片分析失败，书籍填充满相框可以提高识别率哦！")
              this.setData({
                'disabled': false,
              })
            }
            var searchList = []
            setTimeout(wx.hideLoading,1000*ocrResult.length);
            for (var i = 0; i < ocrResult.length; i++) {
              var searchListReady = function(search_string, search_words, that) {
                return new Promise(function(resolve, reject) {
                  console.log("this is promise")
                  //doubanQuery
                  wx.request({ 
                    url: "https://www.douban.com/search",
                    method: "GET",
                    data: {
                      'cat': 1001,
                      'q': search_string
                    },
                    header: {
                      "Content-Type": "application/json; charset=UTF-8"
                    },
                    success: res => {
                      var detail_pattern = /<a class=\"nbg\" href=\"(?:\S*)\"[^\n]*sid: (\d*),.*title=\"(.*)\" ><img src=\"(.*)\"><\/a>/g;
                      var wtpy_pattern = /<span class=\"subject-cast\">([^\n]*)<\/span>\s*<\/div>\s*<\/div>\s*(?:<p>(.*)<\/p>)*/g;
                      var rating_pattern = /(?:<span class=\"rating_nums\">(\d.\d)<\/span>)|(?:<span>\(目前无人评价\)<\/span>)/g;
                      var list = [];
                      var it1 = detail_pattern.exec(res.data);
                      var it2 = wtpy_pattern.exec(res.data);
                      var it3 = rating_pattern.exec(res.data);
                      while (it1 != null && it2 != null && it3 != null) {
                        var temp = that.bookDicConstructor(it1, it2, it3, search_string, search_words)
                        if (temp)
                          list.push(temp)
                        it1 = detail_pattern.exec(res.data);
                        it2 = wtpy_pattern.exec(res.data);
                        it3 = rating_pattern.exec(res.data);
                      }
                      list.sort(function(a, b) {
                        return b.confidence - a.confidence;
                      });
                      console.log(list)
                      list = list.slice(0, 4)
                      for (var i = 0; i < list.length; i++) {
                        list[i].isSearchList = true;
                        list[i].isFirst = i == 0 ? true : false;
                        list[i].isAdded = false;
                        list[i].stringInfoDic = encodeURIComponent(JSON.stringify(list[i]))
                      }
                      resolve(list);
                    },
                    fail: res => {
                      console.log("doubanQuery failed")
                      reject("doubanQuery failed");
                    }
                  }); //end of doubanQuery
                })
              }
              searchListReady(ocrResult[i].search_string, ocrResult[i].search_words, this).then(result => {
                console.log(result);
                searchList = searchList.concat(result)
                this.setData({
                  'searchList': searchList,
                  'hasResult': true,
                })
              })
            }
            // var searchList = JSON.parse(res.data).data
            // console.log("this is searchList:")
            // console.log(searchList)
            // for (var i = 0; i < searchList.length; i++) {
            //   searchList[i]["isSearchList"] = true
            //   searchList[i]["isAdded"] = false;
            //   searchList[i]["stringInfoDic"] = JSON.stringify(searchList[i])
            // }
            // this.setData({   //bind searchList to searchList
            //   hasResult: true,
            //   searchList: searchList,
            // });
            // wx.setNavigationBarTitle({
            //   title: "识别结果"
            // });
          }
        });
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        });
      }
    }) //end of take photo
  },
  dp_function(dp, i, j, target, word) {
    if (i < 0 || j < 0) {
      return 0;
    }
    if (dp[i][j] >= 0)
      return dp[i][j];
    if (target[i] == word[j])
      dp[i][j] = this.dp_function(dp, i - 1, j - 1, target, word) + 1;
    else
      dp[i][j] = Math.max(this.dp_function(dp, i - 1, j, target, word), this.dp_function(dp, i, j - 1, target, word));
    return dp[i][j];
  },
  gen_confidence(target, search_words) {
    var sum = 0
    console.log(target)
    for (var k = 0; k < search_words.length; k++) {
      var dp = new Array(target.length);
      for (var i = 0; i < dp.length; i++) {
        dp[i] = new Array(search_words[k].length);
        for (var j = 0; j < dp[i].length; j++) {
          dp[i][j] = -1;
        }
      }
      sum += this.dp_function(dp, target.length - 1, search_words[k].length - 1, target, search_words[k]);
    }
    return sum;
  },
  bookDicConstructor(it1, it2, it3, search_string, search_words) {
    var dic = {};
    var confidence = this.gen_confidence(it1[2] + it2[1].replace('/', ''), search_words)
    if (confidence == 0)
      return undefined;
    else
      dic.confidence = confidence
    dic.search_string = search_string;
    if (it2[2])
      dic.intro = it2[2]
    else
      dic.intro = "暂无简介"
    dic.webUrl = it1[1]
    dic.title = it1[2]
    dic.imgUrl = it1[3]
    dic.shortIntro = it2[1]
    if (it3[1])
      dic.rating = it3[1]
    else
      dic.rating = "暂无评分"
    return dic;
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
          "shortIntro": searchList[i].shortIntro,
          "rating": searchList[i].rating,
          //"pubTime":searchList[i].pubTime,
        })
        searchList[i].isAdded = true;
      }
    }
    wx.request({
      url: app.globalData.HOST + '/bookshelf_add',
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