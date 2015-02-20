function initialize_TracingTest()
{

InspectorTest.preloadPanel("timeline");
WebInspector.TempFile = InspectorTest.TempFileMock;

InspectorTest.tracingModel = function()
{
    return WebInspector.panels.timeline._tracingModel;
}

InspectorTest.tracingTimelineModel = function()
{
    return WebInspector.panels.timeline._model;
}

InspectorTest.invokeWithTracing = function(functionName, callback, additionalCategories, enableJSSampling)
{
    InspectorTest.tracingTimelineModel().addEventListener(WebInspector.TimelineModel.Events.RecordingStarted, onTracingStarted, this);
    var categories = "-*,disabled-by-default-devtools.timeline*";
    if (additionalCategories)
        categories += "," + additionalCategories;
    InspectorTest.tracingTimelineModel()._startRecordingWithCategories(categories, enableJSSampling);

    function onTracingStarted(event)
    {
        InspectorTest.tracingTimelineModel().removeEventListener(WebInspector.TimelineModel.Events.RecordingStarted, onTracingStarted, this);
        InspectorTest.invokePageFunctionAsync(functionName, onPageActionsDone);
    }

    function onPageActionsDone()
    {
        InspectorTest.tracingTimelineModel().addEventListener(WebInspector.TimelineModel.Events.RecordingStopped, onTracingComplete, this);
        InspectorTest.tracingTimelineModel().stopRecording();
    }

    function onTracingComplete(event)
    {
        InspectorTest.tracingTimelineModel().removeEventListener(WebInspector.TimelineModel.Events.RecordingStopped, onTracingComplete, this);
        callback();
    }
}

}
