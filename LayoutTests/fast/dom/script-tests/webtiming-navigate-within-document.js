description("This test checks that navigating within the document does not reset Web Timing numbers.");

window.performance = window.performance || {};
var timing = performance.timing || {};

function checkTimingNotChanged()
{
    var properties = getAllPropertyNames(timing);
    for (var i = 0; i < properties.length; ++i) {
        var property = properties[i];
        if (timing[property] === initialTiming[property])
            testPassed(property + " is unchanged.");
        else
            testFailed(property + " changed.");
    }
    finishJSTest();
}

var initialTiming = {};
function saveTimingAfterLoad()
{
    for (var property in timing) {
        initialTiming[property] = timing[property];
    }
    window.location.href = "#1";
    setTimeout("checkTimingNotChanged()", 0);
}

function loadHandler()
{
    window.removeEventListener("load", loadHandler);
    setTimeout("saveTimingAfterLoad()", 0);
}
window.addEventListener("load", loadHandler, false);

jsTestIsAsync = true;
