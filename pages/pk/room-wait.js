const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

const wss = require("../../utils/wss.js");

_Page({
    data: {
        showConfirm: false
    },
    roomId: null,
    onLoad: function(e) {
        this.roomId = e.id || e.pkroom;

        if (!this.roomId || !app.GLOBAL_DATA.USER_INFO) {
            app.gotoPage("/pages/pk/start");
            return;
        }

        let that = this;
        app.getUserInfo(function(u) {
            that.setData({
                fooHeadimg: u.headimgUrl,
                fooNick: u.nick
            });

            if (e.id) {
                that.fooReady();
            } else if (e.pkroom) {
                that.barEnter();
            }
        });
    },
    fooReady: function() {
        let that = this;
        zutils.post(app, "api/pk/foo-ready?room=" + this.roomId, function(res) {
            let _data = res.data;

            if (_data.error_code != 0) {
                that.__error(_data.error_msg);
            } else {
                that.initSocket();
                setTimeout(function() {
                    that.setData({
                        showOp: true,
                        stateText: "等待对手加入"
                    });
                }, 999);
                that.setData({
                    roomNo: _data.data.roomNo
                });
            }
        });
    },
    barEnter: function() {
        let that = this;
        zutils.post(app, "api/pk/bar-enter?room=" + this.roomId, function(res) {
            let _data = res.data;

            if (_data.error_code != 0) {
                that.__error(_data.error_msg);
            } else {
                that.initSocket();
                _data = _data.data;
                that.setData({
                    barHeadimg: _data.fooHeadimg,
                    barNick: _data.fooNick
                });
                setTimeout(function() {
                    that.setData({
                        showOp: true,
                        stateText: "等待发起者开始"
                    });
                }, 999);
            }
        });
    },
    confirmPk: function(e) {
        let that = this;

        let _url =
            "api/pk/foo-start?room=" +
            this.roomId +
            "&formId=" +
            +(e.detail.formId || "");

        zutils.post(app, _url, function(res) {
            let _data = res.data;

            if (_data.error_code != 0) {
                that.__error(_data.error_msg);
            } else {
                wss.close("PKNEXT");

                _my.redirectTo({
                    url: "room-pk?id=" + that.roomId
                });
            }
        });
    },
    initSocket: function() {
        let url =
            "ws/api/pk/room-echo?uid=" +
            app.GLOBAL_DATA.USER_INFO.uid +
            "&room=" +
            this.roomId;
        wss.init(url, this.handleMessage);
    },
    handleMessage: function(data) {
        let that = this;

        switch (data.action) {
            case 1010:
                // BAR 进入
                data.showConfirm = true;
                data.stateText = "请确认开始对战";
                this.__barEnterActionTimer = setTimeout(function() {
                    that.setData(data);
                }, 1500);
                break;

            case 1011:
                // FOO 开始
                wss.close("PKNEXT");

                _my.redirectTo({
                    url: "room-pk?id=" + this.roomId
                });

                break;

            case 1012:
                // BAR 放弃
                if (this.__barEnterActionTimer) {
                    clearTimeout(this.__barEnterActionTimer);
                    this.__barEnterActionTimer = null;
                }

                this.setData({
                    showConfirm: false,
                    barHeadimg: null,
                    barNick: null,
                    stateText: "等待对手加入"
                });
                break;

            case 1013:
                // FOO 放弃
                this.__error("发起者已放弃");

                break;

            default:
                console.log("未知 Action " + data.action);
        }
    },
    cancelPk: function() {
        _my.showModal({
            title: "提示",
            content: "确认放弃本轮对战吗？",
            success: function(res) {
                if (res.confirm) {
                    wss.close("PKWAIT");

                    _my.navigateBack();
                }
            }
        });
    },
    // 显示错误并退出
    __error: function(error_msg) {
        _my.showModal({
            title: "提示",
            content: error_msg || "系统错误",
            showCancel: false,
            success: function() {
                _my.navigateBack();
            }
        });
    },
    onUnload: function() {
        wss.close("PKWAIT");
    },
    onShareAppMessage: function() {
        let that = this;
        let d = {
            title: app.GLOBAL_DATA.USER_INFO.nick + "向你发起挑战",
            path: "/pages/pk/start?pkroom=" + this.roomId,
            success: function(res) {}
        };
        return d;
    },
    copyRoomNo: function() {
        _my.setClipboardData({
            data: this.data.roomNo + "",
            success: function() {
                _my.showToast({
                    icon: "none",
                    title: "房间号已复制"
                });
            }
        });
    }
});
