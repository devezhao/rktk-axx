const _Page = require("/__antmove/component/componentClass.js")("Page");
const _my = require("/__antmove/api/index.js")(my);
const app = app || getApp();

const zutils = require("../../utils/zutils.js");

_Page({
    data: {
        hasError: "等待初始化",
        dialogHide: true
    },
    roomId: null,
    onShowTimes: 0,
    onShareTrigger: false,
    onLoad: function(e) {
        if (!!app.GLOBAL_DATA.RED_DOT[2]) {
            app.hideReddot(2, app.GLOBAL_DATA.RED_DOT[2]);
        }

        if (!!e.pkroom) {
            this.onShowTimes = 1;
        }

        let that = this;
        app.getUserInfo(function(u) {
            that.setData({
                headimgUrl: u.headimgUrl,
                nick: u.nick
            });

            if (e.pkroom) {
                that.__checkRoom(e.pkroom);
            } else {
                setTimeout(function() {
                    if (!that.roomId) {
                        that.onShow("onLoad");
                    }
                }, 100);
            }
        });
    },
    onShow: function(s) {
        if (!app.GLOBAL_DATA.USER_INFO) return;
        this.onShowTimes++;
        let tt = this.onShowTimes;
        let that = this;
        that.roomId = "HOLD";
        zutils.get(app, "api/pk/room-init", function(res) {
            let _data = res.data;

            if (_data.error_code == 0) {
                that.roomId = _data.data.roomid;
                that.setData({
                    hasError: null
                });
            } else {
                that.setData({
                    hasError: _data.error_msg
                });

                if (tt == 1 && _data.error_msg.indexOf("考试类型") > -1) {
                    _my.navigateTo({
                        url: "../question/subject-choice?back=1"
                    });
                }
            }

            that.__loadMeta();

            if (s == "onPullDownRefresh") _my.stopPullDownRefresh(); // 判断是否进入房间

            if (
                _data.error_code == 0 &&
                that.onShareTrigger === true &&
                app.reenterSource &&
                app.reenterSource.path == "pages/pk/start"
            ) {
                that.onShareTrigger = false;

                _my.navigateTo({
                    url: "room-wait?id=" + that.roomId
                });
            }
        });
        let u = app.GLOBAL_DATA.USER_INFO;

        if (u && this.data.nick != u.nick) {
            this.setData({
                headimgUrl: u.headimgUrl,
                nick: u.nick
            });
        }
    },
    __checkRoom: function(pkroom) {
        zutils.get(app, "api/pk/room-check?room=" + pkroom, function(res) {
            let _data = res.data.data;

            if (!_data || _data.state != 1) {
                app.alert("房间已关闭");
            } else {
                if (_data.isFoo) {
                    _my.navigateTo({
                        url: "room-wait?id=" + pkroom
                    });
                } else {
                    _my.navigateTo({
                        url: "room-wait?pkroom=" + pkroom
                    });
                }
            }
        });
    },
    __loadMeta: function() {
        let that = this;
        zutils.get(app, "api/pkrank/my-pkinfo", function(res) {
            that.setData(res.data);
        });
        zutils.get(app, "api/pkrank/rank-list?top=10", function(res) {
            that.setData({
                rankList: res.data
            });
        });
    },
    onPullDownRefresh: function() {
        this.onShow("onPullDownRefresh");
    },
    onShareAppMessage: function(e) {
        var d = app.warpShareData("/pages/pk/start");
        d.title = "快来参加软考PK赛";

        if (e.from == "button") {
            let that = this;
            d = {
                title: app.GLOBAL_DATA.USER_INFO.nick + "向你发起挑战",
                path:
                    "/pages/pk/start?pkroom=" +
                    (that.roomId && that.roomId != "HOLD" ? that.roomId : "") // 新版微信已取消
                // success: function (res) {
                //   if (that.roomId) {
                //     wx.navigateTo({
                //       url: 'room-wait?id=' + that.roomId
                //     });
                //   }
                // }
            };
            this.onShareTrigger = true;
        }

        return d;
    },
    onHide: function(e) {
        console.log("离开 PK 首页 ...");
    },
    checkReady: function() {
        if (this.data.hasError == null) {
            return;
        }

        let that = this;

        _my.showModal({
            title: "提示",
            content: this.data.hasError,
            showCancel: false,
            success: function() {
                if (
                    that.data.hasError.indexOf("考试类型") > -1 &&
                    that.onShowTimes > 1
                ) {
                    _my.navigateTo({
                        url: "../question/subject-choice?back=1"
                    });
                }
            }
        });
    },
    dialogOpen: function() {
        this.setData({
            dialogHide: false,
            inputFocus: true
        });
    },
    dialogClose: function() {
        this.setData({
            dialogHide: true
        });
    },
    inputData: {},
    inputTake: function(e) {
        this.inputData[e.currentTarget.dataset.id] = e.detail.value;
    },
    enterRoom: function() {
        let no = this.inputData["roomNo"];

        if (!no || ~~no < 100000) {
            _my.showToast({
                icon: "none",
                title: "请输入6位数字房间号"
            });

            return;
        }

        let that = this;
        zutils.get(app, "api/pk/room-query?roomNo=" + no, function(res) {
            if (res.data.error_code == 0) {
                that.dialogClose();

                that.__checkRoom(res.data.data.roomid);
            } else {
                _my.showToast({
                    icon: "none",
                    title: res.data.error_msg
                });
            }
        });
    }
});
