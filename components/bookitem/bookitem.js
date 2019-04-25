// component/bookitem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    infoDic: {
      type: Object,
    },
    index: Number,
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
    created() {
      console.log("created")
    },
    attached() {
      console.log("attached")
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    onTap() {
      const eventDetail = {
        "index": this.properties.index
      } // detail对象，提供给事件监听函数
      const eventOption = {
        bubbles: true
      } // 触发事件的选项
      console.log("checkbox trigger")
      this.triggerEvent('updatecheckbox', eventDetail, eventOption)
    },
    onLongPress() {
      console.log("this is long press")
      if (!this.properties.infoDic.isSearchList) {
        this.setData({
          "deleteMode": !this.properties.deleteMode
        })
      }
    },
    deleteBook() {
      wx.request({
        url: app.globalData.HOST+'/delete_book',
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
    }
  }
})