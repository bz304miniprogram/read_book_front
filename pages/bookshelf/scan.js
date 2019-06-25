// pages/bookshelf/scan.js
import * as watch from "../../components/watch.js";
const app = getApp();
Page({
  data: {
    hasResult: false,
    searchList: [],
    recommand:[],
    candidate:[],
    flush:false,
    failed: false,
    photo: true,
  },
  onLoad: function(options) {
    watch.setWatcher(this);
    // wx.getSetting({
    //   success: res => {
    //     if (!res.authSetting['scope.camera'])
    //       wx.authorize({
    //         scope: 'scope.camera',
    //         success: res => {
    //           this.setData({
    //             useCamera: true
    //           })

    //         },
    //         fail() {
    //           app.showToast("授权失败, 可在我的->授权管理中重新授权")
    //           console.log("authorize failed")
    //         }
    //       })
    //     else this.setData({
    //       useCamera: true
    //     })
    //   }
    // })
  },
  watch: {
   flush: function(newVal, oldVal){
        this.updateBooks();
    }
  },
  onReady: function() {
    if (this.data.photo) {
      this.takePhoto()
      this.data.photo = false
    }
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
  updateBooks(){
    var list =[];
    for(var i=0;i<this.data.recommand.length;i++){
      if(this.data.recommand[i]!=null)
        list.push(this.data.recommand[i])
    }
    for (var i = 0; i < this.data.candidate.length; i++) {
      if (this.data.candidate[i])
        for(var j=0; j< this.data.candidate[i].length;j++)
          list.push(this.data.candidate[i][j]);
    }
    this.setData({
      "searchList":list,
      "hasResult":true
    })
  },
  reset() {
    this.setData({
      'photo': true,
      'failed': false,
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
          mask: true,
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
                      var temp={
                      books :that.matchFunction(res, search_string, search_words,i),
                      index :i
                      };
                      resolve(temp);
                    },
                    fail: res => {
                      console.log("doubanQuery failed")
                      reject("doubanQuery failed");
                    }
                  }); //end of doubanQuery
                })
              }
              searchListReady(ocrResult[i].search_string, ocrResult[i].search_words, this).then(result => {
                console.log("this is book item")
                console.log(result);
                if (result.books.length > 0)
                  this.data.recommand[result.index]=result.books[0];
                  //this.data.recommand.push(result[0])
                this.data.candidate[result.index]=[];
                for (var i = 1; i < result.books.length; i++)
                  this.data.candidate[result.index].push(result.books[i])
                this.data.flush = !this.data.flush
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
        }); //end of uploadTsk
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        });
      },
      fail(res) {
        this.setData({
          "failed": true
        })
      }
    })
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
  matchFunction(res, search_string, search_words,index) {
    var detail_pattern = /<a class=\"nbg\" href=\"(?:\S*)\"[^\n]*sid: (\d*),.*title=\"(.*)\" ><img src=\"(.*)\"><\/a>/g;
    var wtpy_pattern = /<span class=\"subject-cast\">([^\n]*)<\/span>\s*<\/div>\s*<\/div>\s*(?:<p>(.*)<\/p>)*/g;
    var rating_pattern = /<span class=\"rating_nums\">(\d.\d)<\/span>|<span>\(目前无人评价\)<\/span>|<span>\(评价人数不足\)<\/span>/g;
    var list = [];
    var it1 = detail_pattern.exec(res.data);
    var it3 = rating_pattern.exec(res.data);
    var it2 = wtpy_pattern.exec(res.data);
    var i = 0;
    while (it1 != null && it2 != null && it3 != null && i < 10) {
      var temp = this.bookDicConstructor(it1, it2, it3, search_string, search_words)
      if (temp != null)
        list.push(temp)
      it1 = detail_pattern.exec(res.data);
      it2 = wtpy_pattern.exec(res.data);
      it3 = rating_pattern.exec(res.data);
      i++;
    }
    if (list.length == 0) {
      // if (search_words.length==0)
      //   return [];
      console.log("this is search_words")
      console.log(search_words)
      //if (search_words[search_words.length-1].length<=1)
      search_words.pop();
      //else 
        //search_words[search_words.length - 1] = search_words[search_words.length - 1].substr(0, search_words[search_words.length - 1].length-1)
      if ((search_words.length == 1 && search_words[0].length < 2) || search_words.length == 0)
        return [];
      else{
      search_string = search_words.join('+')
      var searchListReady = function(search_string, search_words, that) {
        return new Promise(function(resolve, reject) {
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
              resolve(that.matchFunction(res, search_string, search_words,index));
            },
            fail: res => {
              console.log("doubanQuery failed")
              reject("doubanQuery failed");
            }
          }); //end of doubanQuery
        }); //end of promise
      }
      searchListReady(search_string, search_words, this).then(result => {
        console.log("this is cut_last book item")
        console.log(result);
        if (result.length > 0)
          this.data.recommand[index]=result[0]
        for (var i = 1; i < result.length; i++)
          this.data.candidate[index].push(result[i])
        this.data.flush = !this.data.flush
      })
    }//end of if
    }
    list.sort(function(a, b) {
      return b.confidence - a.confidence;
    });
    console.log(search_string)
    list = list.slice(0, 4)

    for (var i = 0; i < list.length; i++) {
      list[i].isSearchList = true;
      list[i].isFirst = i == 0 ? true : false;
      list[i].isAdded = false;
      list[i].stringInfoDic = encodeURIComponent(JSON.stringify(list[i]))
    }
    return list;
  },
  bookDicConstructor(it1, it2, it3, search_string, search_words) {
    var dic = {};
    var confidence = 2 * this.gen_confidence(it1[2], search_words) + this.gen_confidence(it2[1].replace('/', ''), search_words)
    if (confidence == 0)
      return null;
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
    // console.log(this.data.searchList)
    var searchList = this.data.searchList
    for (var i = 0; i < searchList.length; i++) {
      if (searchList[i].isFirst && !searchList[i].isAdded) {
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
    if (chosen_books.length == 0)
      return
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