const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
  data: {
    authActive: false
  },
  onLoad: function(e) {
    this.nexturl = decodeURIComponent(e.nexturl || "/pages/index/index");

    _my.setNavigationBarTitle({
      title: "软考必备"
    });

    let that = this;

    my.getAuthCode({
      scopes: 'auth_base',
      success: (res) => {
        that.__loginCode = res.authCode;
        that.setData({
          authActive: true
        });
      },
    });
  },

  storeUserInfo: function(e) {
    my.getOpenUserInfo({
      success: (res) => {
        this.setData({
          authText: "请稍后",
          authActive: false
        });

        console.log(JSON.stringify(res))
        let ui = JSON.parse(res.response).response
        ui.__code = that.__loginCode

        zutils.post(app, "api/user/wxx-login-update?noloading", JSON.stringify(ui), function(res) {
          app.GLOBAL_DATA.USER_INFO = res.data.data;

          _my.setStorage({
            key: "USER_INFO",
            data: app.GLOBAL_DATA.USER_INFO,
            success: function() {
              if (that.nexturl == "back") _my.navigateBack();
              else app.gotoPage(that.nexturl, true);
            }
          });
        });
      },
      fail: (res) => {
        console.log(JSON.stringify(res))
      }
    })
  },

  goback() {
    _my.navigateBack();
  }
});
