const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
  data: {
    openSettingNeed: false
  },
  __aqrImgPath: null,
  onLoad: function(e) {
    let that = this;
    zutils.get(app, "api/share/gen-texts", function(res) {
      that.setData(res.data.data);
    });
  },
  ccopy: function(e) {
    let ccdata = this.data.text;

    _my.setClipboardData({
      data: ccdata,
      success: function() {
        _my.showToast({
          title: "已复制"
        });
      }
    });
  },
  inviteList: function() {
    _my.navigateTo({
      url: "../my/coin-records?type=invite"
    });
  },
  onShareAppMessage: function() {
    let d = app.warpShareData();
    d.imageUrl = "https://cdn.chinaruankao.com/a/wxx/share-img.png";
    return d;
  }
});
