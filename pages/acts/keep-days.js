const _Page = require("/__antmove/component/componentClass.js")("Page");
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
    data: {
        aqrUrl: "https://cdn.chinaruankao.com/a/aqr-rktk.jpg",
        slogen: "积跬步以至千里，请继续坚持"
    },
    __slogen: [
        "积跬步以至千里，请继续坚持",
        "驽马十驾功在不舍，请继续坚持",
        "锲而不舍金石可镂，请继续坚持",
        "大吉大利今晚吃鸡，请继续坚持"
    ],
    __slogenIdx: 0,
    onLoad: function(e) {
        let days = e.days || 1;
        this.setData({
            days: days,
            date: e.date || "2018.01.01",
            daysFs: ~~days > 99 ? 66 : 88
        });
        let that = this;
        zutils.get(app, "api/acts/aqrcode?noloading", function(res) {
            if (res.data.data) {
                that.setData({
                    aqrUrl: res.data.data
                });
            }
        });
    },
    slogenRandom: function() {
        this.__slogenIdx++;
        if (this.__slogenIdx >= this.__slogen.length) this.__slogenIdx = 0;
        this.setData({
            slogen: this.__slogen[this.__slogenIdx]
        });
    },
    onShareAppMessage: function() {
        return app.warpShareData();
    }
});
