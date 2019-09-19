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

        _my.login({
            success: function(res) {
                that.__loginCode = res.code;
                that.setData({
                    authActive: true
                });
            }
        });
    },
    storeUserInfo: function(e) {
        let res = e.detail;

        if (res.errMsg != "getUserInfo:ok") {
            this.setData({
                authText: "重新授权"
            });
            return;
        }

        this.setData({
            authText: "请稍后",
            authActive: false
        });
        console.log("存储授权 - " + JSON.stringify(res));
        let that = this;
        let _data = {
            code: that.__loginCode,
            iv: res.iv,
            data: res.encryptedData
        };
        zutils.post(app, "api/user/wxx-login?noloading", _data, function(res) {
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

    goback() {
        _my.navigateBack();
    }
});
