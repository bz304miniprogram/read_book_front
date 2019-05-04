// components/clock/clock.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    readTime:{
      type:Number,
      value:15,
    },
    topMessage:{
      type:String,
      value: "定个小目标吧",
    },
    clock: {
      type: Number,
      value: 15,
      observer() {
        if (this.properties.clock == 0 && this.properties.isCounting == true) {
          this.setData({
            "isCounting":false
          })
          clearInterval(this.properties.interval)
          clearInterval(this.properties.interval_s)
          console.log("clock trigger")
          this.triggerEvent('readSuccess')
        }
        this.formatClock()
      }
    },
    formatClock: {
      type: String,
      value: '00:15'
    },
    isCounting: {
      type: Boolean,
      value: false
    },
    generating:Boolean,
    interval: Number,
    interval_s: Number,
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
    changeClock(e) {
      this.setData({
        "readTime": e.detail.value,
        "clock": this.properties.readTime,
      })
    },
    startCount() {
      const eventDetail = {
        "readTime": this.properties.readTime
      }
      this.triggerEvent("startRead",eventDetail)
      this.setData({
        "isCounting": true,
        "topMessage":"离开本页面就会放弃哦",
        "interval_s": setInterval(function() {
          var formatClock = this.properties.formatClock
          if (formatClock.indexOf(':') != -1)
            formatClock = formatClock.replace(':', ' ')
          else
            formatClock = formatClock.replace(' ', ':')
          this.setData({
            "formatClock": formatClock
          })
        }.bind(this), 500),
        "interval": setInterval(function() {
          var clock = this.properties.clock
          this.setData({
            "clock": clock - 1
          });
        }.bind(this), 60000)
      })
    },
    formatClock() {
      var hour = parseInt(this.properties.clock / 60).toString()
      var min = (this.properties.clock % 60).toString()
      if (min.length == 1)
        min = '0' + min
      this.setData({
        "formatClock": '0' + hour + ':' + min
      })
    },
    genPoster(){
      if(this.properties.generating)
        return
      this.triggerEvent("genPoster");
    }
  },

})