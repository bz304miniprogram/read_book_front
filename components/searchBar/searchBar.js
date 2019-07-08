// components/searchBar/searchBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    inputShowed:{
      type:Boolean,
      value:false
    },
    inputVal: {
      type:String,
      value:""
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
  methods: {
    showInput: function() {
      this.setData({
        inputShowed: true
      });
    },
    search_trigger: function() {
      var search_string = this.properties.inputVal;
      var search_words = search_string.split(",");
      search_string = search_words.join("+");
      this.triggerEvent("search", {"search_string":search_string,"search_words":search_words})
    },
    clearInput: function() {
      this.setData({
        inputVal: ""
      });
    },
    inputTyping: function(e) {
      this.setData({
        inputVal: e.detail.value
      });
    }
  }
})