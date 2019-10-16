const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
  data: {
    tabIndex: 1
  },
  onLoad: function(e) {
    let that = this;
    app.getUserInfo(function(u) {
      zutils.get(app, "api/user/isvip", function(res) {
        that.setData({
          isVip: res.data.isVip
        });
        that.loadStats();
        that.loadExams();
      });
      zutils.get(app, "api/user/infos", function(res) {
        _my.setNavigationBarTitle({
          title: (res.data.data.subject || "") + "答题报告"
        });
      });
    });
  },
  loadStats: function() {
    let that = this;
    zutils.get(app, "api/exam/report/stats", function(res) {
      let _data = res.data.data;

      if (_data.examCount > 0) {
        that.setData(_data);
        let rate = _data.answerRight / _data.answerCount;
        that.setData({ rightRate: rate })
      }
    });
  },
  loadExams: function(e) {
    let t = e ? e.currentTarget.dataset.index : 1;

    if (t == 2 && this.data.isVip == false) {
      this.gotoVipBuy();
      return;
    }

    this.setData({
      tabIndex: t
    });
    let that = this;
    zutils.get(app, "api/exam/report/exam-by?type=" + t, function(res) {
      let _data = res.data.data;

      for (let i = 0; i < _data.length; i++) {
        _data[i][6] = ~~((_data[i][4] * 100) / _data[i][3]);
      }

      that.setData({
        exams: _data
      });
    });
  },
  gotoVipBuy: function() {
    app.gotoVipBuy("本功能为VIP专享，开通VIP会员可立即查看");
  },
  onShareAppMessage: function() {
    let d = app.warpShareData();
    return d;
  }
});
