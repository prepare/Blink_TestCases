function reportResult(msg) {
    if (self.opener)
        self.opener.postMessage(msg, "*");
    else if (self.top)
        self.top.postMessage(msg, "*");
    else
        postMessage(msg);
}

(function () {
    try {
        var ws = new WebSocket("ws://127.0.0.1:8880/echo");
    } catch (e) {
        reportResult("DONE");
        return;
    }
    reportResult("FAIL: No exception was thrown")
})();
