const _my = require("/__antmove/api/index.js")(my);
const zutils = require("./zutils.js");

var WSS = {
    wsUrl: null,
    reconnectTimes: 0,
    init: function(url, handle) {
        let wsUrl = zutils.baseUrl.replace("https://", "wss://ws.");
        if (zutils.baseUrl.substr(0, 5) == "http:")
            wsUrl = zutils.baseUrl.replace("http:", "ws:");
        WSS.wsUrl = wsUrl + url;
        console.log("WSURL " + WSS.wsUrl);
        WSS.reconnectTimes = 0;

        WSS.__connect();

        _my.onSocketOpen(function(res) {
            console.log("连接已建立 ... " + JSON.stringify(res));
            WSS.__connectReady = true;
        });

        _my.onSocketError(function(res) {
            console.log("onSocketError - " + JSON.stringify(res));
            WSS.__connectReady = false;

            WSS.__connect();
        });

        _my.onSocketClose(function(res) {
            console.log("连接已断开 ... " + JSON.stringify(res));
            WSS.__connectReady = false;

            if (res.code != 1000) {
                WSS.__connect();
            }
        });

        _my.onSocketMessage(function(res) {
            console.log("收到消息 ... " + JSON.stringify(res));

            let _data = JSON.parse(res.data);

            handle(_data);
        });
    },
    __connect: function() {
        WSS.reconnectTimes++;

        if (WSS.reconnectTimes > 0 && WSS.reconnectTimes % 5 == 0) {
            _my.showToast({
                icon: "none",
                title: "当前网络不稳定"
            });
        }

        if (WSS.reconnectTimes > 50) {
            _my.showToast({
                icon: "none",
                title: "连接已断开"
            });

            return;
        }

        _my.connectSocket({
            url: WSS.wsUrl,
            header: {
                "content-type": "application/json"
            }
        });
    },
    send: function(action, data) {
        if (!WSS.__connectReady || WSS.__connectReady == false) {
            console.warn("连接未就绪");
            return;
        }

        let json = {
            action: action,
            data: data || ""
        };
        json = JSON.stringify(json);

        _my.sendSocketMessage({
            data: json,
            complete: function(res) {
                console.log(
                    "sendSocketMessage - " + json + " >> " + JSON.stringify(res)
                );
            }
        });
    },
    close: function(reason) {
        if (WSS.__connectReady == true) {
            WSS.__connectReady = false;

            _my.closeSocket({
                reason: reason || ""
            });
        }
    }
}; // API

module.exports = {
    init: WSS.init,
    send: WSS.send,
    close: WSS.close
};
