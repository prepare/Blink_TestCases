function test(value, inlineValue, computedValue)
{
    if (value !== null)
        e.style.textDecorationStyle = value;
    shouldBeEqualToString("e.style.textDecorationStyle", inlineValue);
    computedStyle = window.getComputedStyle(e, null);
    shouldBeEqualToString("computedStyle.textDecorationStyle", computedValue);
    debug("");
}

description("Test to make sure text-decoration-style is computed properly.")

var testContainer = document.createElement("div");
testContainer.contentEditable = true;
document.body.appendChild(testContainer);

testContainer.innerHTML = '<div id="test-parent" style="text-decoration-style: dashed !important;">hello <span id="test-ancestor">world</span></div>';
debug("Ancestor should not inherit 'dashed' value from parent (fallback to initial 'solid' value):")
e = document.getElementById('test-ancestor');
test(null, "", "solid");

debug("Parent should cointain 'dashed':");
e = document.getElementById('test-parent');
test(null, "dashed", "dashed");

testContainer.innerHTML = '<div id="test-js">test</div>';
debug("JavaScript setter tests for valid, initial, invalid and blank values:");
e = document.getElementById('test-js');
shouldBeEmptyString("e.style.textDecorationStyle");

debug("\nValid value 'solid':");
test("solid", "solid", "solid");

debug("Valid value 'double':");
test("double", "double", "double");

debug("Valid value 'dotted':");
test("dotted", "dotted", "dotted");

debug("Valid value 'dashed':");
test("dashed", "dashed", "dashed");

debug("Valid value 'wavy':");
test("wavy", "wavy", "wavy");

debug("Initial value:");
test("initial", "initial", "solid");

debug("Invalid value (this property accepts one value at a time only):");
test("double dotted", "initial", "solid");

debug("Invalid value (ie. 'unknown'):");
test("unknown", "initial", "solid");

debug("Empty value (resets the property):");
test("", "", "solid");

document.body.removeChild(testContainer);
