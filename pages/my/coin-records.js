const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
    data: {
        tabs: ["全部", "支出", "收入"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0
    },
    pageNo: 1,
    onLoad: function(e) {
        if (e.type && e.type == "invite") {
            this.setData({
                activeIndex: 2
            });
        }

        var that = this;

        _my.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft:
                        (res.windowWidth / that.data.tabs.length - 84) / 2,
                    sliderOffset:
                        (res.windowWidth / that.data.tabs.length) *
                        that.data.activeIndex
                });
            }
        });

        app.getUserInfo(function() {
            that.loadRecords();
        });
    },
    loadRecords: function(e) {
        if (!!e) {
            this.setData({
                sliderOffset: e.currentTarget.offsetLeft,
                activeIndex: e.currentTarget.id
            });
        }

        var ttype = this.data.activeIndex == 1 ? 10 : 1;

        if (this.data.activeIndex == 0) {
            ttype = 0;
        }

        var that = this;
        zutils.get(
            app,
            "api/coin/records?type=" + ttype + "&page=" + this.pageNo,
            function(res) {
                that.setData({
                    records: res.data.data,
                    nodata: that.pageNo == 1 && res.data.data.length == 0
                });
            }
        );
    }
});
