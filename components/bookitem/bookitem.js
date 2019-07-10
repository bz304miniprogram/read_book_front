// component/bookitem.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    infoDic: {
      type: Object,
    },
    index: Number,
    col_idx:{
      type:Number,
      value:0
    },
    deleteMode: Boolean,
    isDeleted: {
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
  lifetimes: {
    created() {},
    attached() {},
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    onClickCheckBox() {
      const eventDetail = {
        "index": this.properties.index
      } // detail对象，提供给事件监听函数
      const eventOption = {
        bubbles: true
      } // 触发事件的选项
      console.log("checkbox trigger")
      this.triggerEvent('updatecheckbox', eventDetail, eventOption)
    },
    onLongPress(e) {
      console.log("this is long press",e,this)
      if (this.properties.infoDic.type == "bookshelf") {
        this.setData({
          "deleteMode": !this.properties.deleteMode
        })
      }
    },
    deleteBook() {
      wx.request({
        url: app.globalData.HOST + '/delete_book',
        method: 'POST',
        data: {
          "webUrl": this.properties.infoDic.webUrl,
          "sessionId": this.properties.infoDic.sessionId
        },
        success: res => {
          if (res.data.message == "delete book success")
            this.setData({
              isDeleted: true
            })
        },
        fail() {
          console.log("delete failed")
        }
      })
    },
    showCandidate() {
      if (this.properties.infoDic.type == 'search_recommend') {
        this.triggerEvent('showCandidate', {
          "index": this.properties.index,
          "search_string": this.properties.infoDic.search_string
        })
      }
    },
    setInfoDic(infoDic) {
      if (this.properties.infoDic.type == 'search_candidate') {
        infoDic["type"] = 'search_recommend';
        this.setData(infoDic)
      }
    },
    getInfoDic(){
      return this.properties.infoDic
    },
    tapHandler() {
      if (this.properties.infoDic.type == "search_candidate") {
        this.triggerEvent("exchangeItem", {
          "infoDic": this.properties.infoDic,
          "row_idx":this.properties.index,
          "col_idx":this.properties.col_idx
        })
      }
      else {
        wx.navigateTo({
          url: "../bookdetail/bookdetail?current=" + this.properties.infoDic.stringInfoDic,
        })
      }
    },
  }
})