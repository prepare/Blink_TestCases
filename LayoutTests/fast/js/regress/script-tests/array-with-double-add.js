function foo() {
    var a = [];
    var b = [];
    
    for (var i = 0; i < 1000; ++i) {
        a.push(i + 0.5);
        b.push(i - 0.5);
    }
    
    for (var i = 0; i < 1000; ++i) {
        for (var j = 0; j < a.length; ++j)
            a[j] += b[j];
    }

    var result = 0;
    for (var i = 0; i < a.length; ++i)
        result += a[i];
    
    return result;
}

var result = foo();
if (result != 499500000)
    throw "Bad result: " + result;

