const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
    data: {
        tipsbarHide: true
    },
    onLoad: function() {
        if (app.GLOBAL_DATA.USER_INFO.uid) {
            this.setData({
                user: app.GLOBAL_DATA.USER_INFO.uid
            });
        }
    },
    onShareAppMessage: function() {
        return app.warpShareData();
    },
    debugTapTimes: 0,
    onShow: function() {
        this.debugTapTimes = 0;
    },
    enableDebug: function() {
        this.debugTapTimes++;

        if (this.debugTapTimes == 3) {
            _my.setEnableDebug({
                enableDebug: true
            });

            _my.showToast({
                icon: "none",
                title: "DEBUG 模式已开启"
            });
        }
    },
    github: function() {
        app.alert("Fork on GitHub. https://github.com/devezhao/rktk-wxx/");
    }
});
