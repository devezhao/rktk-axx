const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
  data: {
    selected: null,
    tipsbarHide: true,
    vipHide: false
  },
  back: null,
  onLoad: function(e) {
    this.back = e.back || 0;

    if (this.back == "vip") {
      my.setNavigationBar({
        backgroundColor: "#a18d62"
      });
      // _my.setNavigationBarColor({
      //   frontColor: "#ffffff",
      //   backgroundColor: "#a18d62"
      // });
    }

    if (this.back == "vip" || this.back == "vipsn") {
      this.setData({
        vipHide: true
      });
    }

    var that = this;
    app.getUserInfo(function(u) {
      that.setData({
        user: u.uid
      });
      zutils.get(app, "api/subject/list-top", function(res) {
        var data = res.data;
        that.setData({
          subjectList_1: data.data.L1,
          subjectList_2: data.data.L2,
          subjectList_3: data.data.L3
        });
      });
    });
  },
  subjectChange: function(e) {
    var _selected = e.detail.value;

    if (this.back == "vip" || this.back == "vipsn") {
      app.GLOBAL_DATA.__BuySubject = _selected;

      _my.navigateBack();

      return;
    }

    var _subjectList1 = this.data.subjectList_1;

    for (var i = 0, len = _subjectList1.length; i < len; ++i) {
      _subjectList1[i][3] = _subjectList1[i][0] == _selected;
    }

    var _subjectList2 = this.data.subjectList_2;

    for (var i = 0, len = _subjectList2.length; i < len; ++i) {
      _subjectList2[i][3] = _subjectList2[i][0] == _selected;
    }

    var _subjectList3 = this.data.subjectList_3;

    for (var i = 0, len = _subjectList3.length; i < len; ++i) {
      _subjectList3[i][3] = _subjectList3[i][0] == _selected;
    }

    this.setData({
      subjectList_1: _subjectList1,
      subjectList_2: _subjectList2,
      subjectList_3: _subjectList3
    });
    this.data.selected = _selected;
  },
  saveChange: function(e) {
    var that = this;

    if (!that.data.selected) {
      _my.showToast({
        icon: "none",
        title: "请选择你的考试类型"
      });

      return;
    }

    zutils.post(
      app,
      "api/subject/set-main?id=" +
      that.data.selected +
      "&formId=" +
      (e.detail.formId || ""),
      function(res) {
        app.GLOBAL_DATA.RELOAD_SUBJECT = ["Home", "Subject", "Index"];

        if (that.back == 1) {
          _my.navigateBack();
        } else {
          _my.switchTab({
            url: "../question/subject-list"
          });
        }
      }
    );
  },
  gotoPage: function(e) {
    zutils.post(
      app,
      "api/user/report-formid?formId=" + (e.detail.formId || "")
    );
    app.gotoPage(e);
  }
});
