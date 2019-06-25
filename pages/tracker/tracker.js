// pages/tracker/tracker.js
import * as echarts from '../../components/ec-canvas/echarts';

const app = getApp();
let chart_week = null;
let heatChart = null;
let month_track = null;

function getOption_w(week_track) {
  return {
    title: {
      text: week_track.title,
      left: 'center'
    },
    color: ["#37A2DA", "red"],
    tooltip: {
      trigger: 'item',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
        name: '成功时间',
        stack: 'read',
        type: 'bar',
        data: week_track.readSuccess,
      },
      {
        name: '失败时间',
        stack: 'read',
        type: 'bar',
        data: week_track.readFailed,
      }
    ]
  };
}

function getOption_m(month_track) {
  //console.log(month_track.readSuccess)
  const model = {
    yCates: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      'Sunday'
    ],
    xCates: ['1', '2', '3', '4', '5'],
    data: month_track.readSuccess
  };

  const data = model.data.map(function(item) {
    return [item[1], item[0], item[2] || '-'];
  });

  const option = {
    tooltip: {
      position: 'top'
    },
    animation: false,
    grid: {
      bottom: 60,
      top: 10,
      left: 80
    },
    xAxis: {
      type: 'category',
      data: model.xCates,
    },
    yAxis: {
      type: 'category',
      data: model.yCates
    },
    visualMap: {
      min: 0,
      max: 60,
      show: false,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      inRange: {
        color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "red"],
      }
    },
    series: [{
      name: '读书时间',
      type: 'heatmap',
      data: data,
      label: {
        normal: {
          show: true,
          formatter: function(params) {
            return parseInt(params.value[2])
          }
        }
      },
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  return option;
}

function get_month_track(month) {
  wx.request({
    url: app.globalData.HOST + '/get_month_track',
    method: 'POST',
    data: {
      'sessionId': app.globalData.sessionId,
      'month': month,
    },
    success: res => {
      console.log(res)
      return res.data.data
    },
    fail: res => {
      console.log("get week track failed")
    }
  });
}

function gen_statistic(track) {
  var totalSuccess = 0,
    percent = 0;
  if (track.readSuccess.length == 7) 
    for (var i = 0; i < track.readSuccess.length; i++) {
      totalSuccess += track.readSuccess[i];
    }
  else
    for (var i=0;i<track.readSuccess.length;i++){
      totalSuccess += track.readSuccess[i][2]-0.1
    }
  if (track.successTimes + track.failedTimes != 0)
    percent = 100 * track.successTimes / (track.successTimes + track.failedTimes);
  return {
    "percent": parseInt(percent),
    "totalSuccess": totalSuccess
  };
}
Page({
  data: {
    tabList: ['周', '月'],
    current: 0, //当前选中的Tab项
    ec: [{
        onInit: function(canvas, width, height) {
          chart_week = echarts.init(canvas, null, {
            width: width,
            height: height
          });
          canvas.setChart(chart_week);
          chart_week.setOption(getOption_w(app.globalData.week_track));
          return chart_week;
        }
        //lazyload: true,
      },
      {
        lazyLoad: true,
        // onInit: function(canvas, width, height) {
        //   const chart_month = echarts.init(canvas, null, {
        //     width: width,
        //     height: height
        //   });
        //   canvas.setChart(chart_month);
        //   chart_week.setOption(getOption(app.globalData.month_track));
        //   return chart_month;
        // }
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.heatComponent = this.selectComponent('#chart_1');
    this.init_heat();
  },
  init_heat: function() {
    var date = new Date;
    var month = date.getMonth() + 1;
    var monthRange = new Array(month)
    for (var i = 0; i < monthRange.length; i++)
      monthRange[i] = i + 1;
    this.setData({
      "monthRange": monthRange,
      "month": month - 1,
    });
    this.heatComponent.init((canvas, width, height) => {
      heatChart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(heatChart);
      let promise0 = new Promise(function(resolve, reject) {
        wx.request({
          url: app.globalData.HOST + '/get_month_track',
          method: 'POST',
          data: {
            'sessionId': app.globalData.sessionId,
            'month': month,
          },
          success: res => {
            resolve(res.data.data)
          },
          fail: res => {
            console.log("get week track failed")
          }
        });
      });
      Promise.all(
        [promise0]
      ).then(res => {
        month_track = res[0]
        heatChart.setOption(getOption_m(month_track))
        this.setData({
          "statistics": [gen_statistic(app.globalData.week_track), gen_statistic(month_track)]
        })
      });
      // heatChart.setOption(getOption(app.globalData.week_track));
    });

  },
  contentChange: function(e) {
    return;
  },
  tabItemClick: function(e) {
    console.log("this is tap")
    this.setData({
      current: e.currentTarget.dataset.pos
    })
    var that =this;
    setTimeout(function(){
      console.log("this is tap")
      that.setData({
        current: e.currentTarget.dataset.pos
      })
    },500)
  },
  monthChange(e) {
    console.log("this is monthChange");
    this.setData({
      'month': parseInt(e.detail.value)
    })
    let promise0 = new Promise(function(resolve, reject) {
      wx.request({
        url: app.globalData.HOST + '/get_month_track',
        method: 'POST',
        data: {
          'sessionId': app.globalData.sessionId,
          'month': parseInt(e.detail.value) + 1,
        },
        success: res => {
          console.log(res)
          resolve(res.data.data)
        },
        fail: res => {
          console.log("get week track failed")
        }
      });
    });
    Promise.all(
      [promise0]
    ).then(res => {
      month_track = res[0]
      heatChart.setOption(getOption_m(month_track));
      this.setData({
        "statistics[1]": gen_statistic(month_track)
      })
    });
  }
})