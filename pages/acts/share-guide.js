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
    csave: function(e) {
        if (this.data.openSettingNeed == true) return;
        if (this.__inProgress && this.__inProgress == true) return;
        this.__inProgress = true;

        _my.showLoading({
            title: "请稍后"
        });

        let that = this;
        zutils.get(app, "api/acts/aqrcode?noloading", function(res) {
            if (res.data.data) {
                _my.downloadFile({
                    url: res.data.data,
                    success: function(res) {
                        that.__saveImageToPhotosAlbum(res.tempFilePath);
                    },
                    complete: function() {
                        that.__inProgress = false;

                        _my.hideLoading();
                    }
                });
            }
        });
    },
    openSettingAfter: function(res) {
        console.log("openSettingAfter - " + JSON.stringify(res));
        res = res.detail;

        if (res.authSetting["scope.writePhotosAlbum"] == true) {
            this.__saveImageToPhotosAlbum();

            this.setData({
                openSettingNeed: false
            });
        } else {
            app.alert("操作未被允许。请再次点击获取并允许小程序保存到相册");
        }
    },
    // 保存图片至相册
    __saveImageToPhotosAlbum: function(path) {
        path = path || this.__aqrImgPath;
        this.__aqrImgPath = path;
        let that = this;

        _my.saveImageToPhotosAlbum({
            filePath: path,
            success: function(res) {
                _my.showToast({
                    title: "已保存至相册"
                });
            },
            fail: function(res) {
                console.log("saveImageToPhotosAlbum - " + JSON.stringify(res));
                app.alert(
                    "操作未被允许。请再次点击获取并允许小程序保存到相册",
                    function() {
                        that.setData({
                            openSettingNeed: true
                        });
                    }
                );
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
