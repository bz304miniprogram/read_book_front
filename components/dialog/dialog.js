Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        if (newVal) {
          this.triggerEvent('open');
          this.setData({
            "visible":newVal
          })
          // wx.pageScrollTo({
          //   scrollTop: 0,
          //   duration: 100
          // })
        }
      }
    },
    animation: {
      type: Boolean,
      value: true
    },
    opacity: {
      type: Number,
      value: 0.4
    },
    title: {
      type: String,
      value: ''
    },
    showClose: {
      type: Boolean,
      value: true
    },
    showFooter: {
      type: Boolean,
      value: false
    },
    closeOnClickModal: {
      type: Boolean,
      value: true
    },
    fullscreen: {
      type: Boolean,
      value: false
    },
    width: {
      type: Number,
      value: 85
    },
    position: {
      type: String,
      value: 'center',
      observer: function (newVal) {
        this.setData({
          _position: this.checkPosition(newVal) ? newVal : 'center'
        })
      }
    }
  },
  data: {
    positions: ['center', 'top', 'bottom'],
    _position: 'center'
  },
  lifetimes:{
    attached: function () {
      this.setData({
        _position: this.checkPosition(this.data.position) ? this.data.position : 'center'
      })
    },
    moved: function () {
    },
    detached: function () {
    }

  },
  
  methods: {
    setTitle(title){
      this.setData({
        'title':title
      })
    },
    checkPosition: function (val) {
      return this.data.positions.indexOf(val) >= 0;
    },
    touchstart: function () {
      if (this.data.closeOnClickModal) {
        this.close();
      }
    },
    closedialog: function () {
        this.setData({
          'visible':false
        })
    },
    close: function () {
      this.closedialog();
      this.triggerEvent('close');
    },
    confirm: function () {
      this.closedialog();
      this.triggerEvent('confirm');
    }
  }
})
