description("Tests that accessing Attr after its Element has been destroyed works without crashing.");

jsTestIsAsync = true;

var element = document.createElement("p");
element.setAttribute("a", "b");
var attributes = element.attributes;
element = null;
var attr = null;

asyncGC(function() {
    shouldBe("attributes.length", "1");
    shouldBe("attributes[0]", "attributes.item(0)");
    shouldBe("attributes.getNamedItem('a')", "attributes.item(0)");

    shouldBe("attributes.item(0).name", "'a'");
    shouldBe("attributes.item(0).value", "'b'");
    shouldBe("attributes.item(0).ownerElement.tagName", "'P'");

    attributes.item(0).value = 'c';

    shouldBe("attributes.item(0).value", "'c'");

    attributes.removeNamedItem('a');

    shouldBe("attributes.length", "0");

    element = document.createElement("p");
    element.setAttribute("a", "b");
    attr = element.attributes.item(0);
    element = null;

    asyncGC(function() {

        shouldBe("attr.name", "'a'");
        shouldBe("attr.value", "'b'");
        shouldBe("attr.ownerElement.tagName", "'P'");

        attr.value = 'c';

        shouldBe("attr.value", "'c'");

        finishJSTest();
    });
});
