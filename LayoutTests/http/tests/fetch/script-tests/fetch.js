if (self.importScripts) {
  importScripts('../resources/fetch-test-helpers.js');
}

sequential_promise_test(function(t) {
    return fetch('http://')
      .then(
        t.unreached_func('fetch of invalid URL must fail'),
        function() {});
  }, 'Fetch invalid URL');

// https://fetch.spec.whatwg.org/#fetching
// Step 4:
// request's url's scheme is not one of "http" and "https"
//   A network error.
sequential_promise_test(function(t) {
    return fetch('ftp://localhost/')
      .then(
        t.unreached_func('fetch of non-HTTP(S) CORS must fail'),
        function() {});
  }, 'fetch non-HTTP(S) CORS');

// https://fetch.spec.whatwg.org/#concept-basic-fetch
// The last statement:
// Otherwise
//   Return a network error.
sequential_promise_test(function(t) {
    return fetch('foobar://localhost/', {mode: 'no-cors'})
      .then(
        t.unreached_func('scheme not listed in basic fetch spec must fail'),
        function() {});
  }, 'fetch of scheme not listed in basic fetch spec');

sequential_promise_test(function(t) {
    return fetch('/serviceworker/resources/fetch-status.php?status=200')
      .then(function(response) {
          assert_equals(response.status, 200);
          assert_equals(response.statusText, 'OK');
        });
  }, 'Fetch result of 200 response');

sequential_promise_test(function(t) {
    return fetch('/serviceworker/resources/fetch-status.php?status=404')
      .then(function(response) {
          assert_equals(response.status, 404);
          assert_equals(response.statusText, 'Not Found');
        });
  }, 'Fetch result of 404 response');

sequential_promise_test(function(t) {
    var request = new Request(
      '/serviceworker/resources/fetch-status.php?status=200#fragment');

    // The url attribute's getter must return request's url,
    // serialized with the exclude fragment flag set.
    assert_equals(request.url,
      BASE_ORIGIN + '/serviceworker/resources/fetch-status.php?status=200');

    return fetch(request)
      .then(function(response) {
          assert_equals(response.status, 200);
          assert_equals(response.statusText, 'OK');
          // The url attribute's getter must return the empty string
          // if response's url is null and response's url,
          // serialized with the exclude fragment flag set, otherwise.
          assert_equals(response.url,
            BASE_ORIGIN +
            '/serviceworker/resources/fetch-status.php?status=200');
        });
  }, 'Request/response url attribute getter with fragment');

sequential_promise_test(function(t) {
    var redirect_target_url =
      BASE_ORIGIN + '/serviceworker/resources/fetch-status.php?status=200';
    var redirect_original_url =
      BASE_ORIGIN + '/serviceworker/resources/redirect.php?Redirect=' +
      redirect_target_url;

    var request = new Request(redirect_original_url);
    assert_equals(request.url, redirect_original_url,
      'Request\'s url is the original URL');

    return fetch(request)
      .then(function(response) {
          assert_equals(response.status, 200);
          assert_equals(response.statusText, 'OK');
          assert_equals(response.url, redirect_target_url,
            'Response\'s url is locationURL');
          assert_equals(request.url, redirect_original_url,
            'Request\'s url remains the original URL');
        });
  }, 'Request/response url attribute getter with redirect');

function evalJsonp(text) {
  return new Promise(function(resolve) {
      var report = resolve;
      // text must contain report() call.
      eval(text);
    });
}

sequential_promise_test(function(t) {
    var request =
      new Request('/serviceworker/resources/fetch-access-control.php',
                  {
                    method: 'POST',
                    body: new Blob(['Test Blob'], {type: 'test/type'})
                  });
    return fetch(request)
      .then(function(response) { return response.text(); })
      .then(evalJsonp)
      .then(function(result) {
          assert_equals(result.method, 'POST');
          assert_equals(result.body, 'Test Blob');
        });
  }, 'Fetch with Blob body test');

sequential_promise_test(function(t) {
    var request = new Request(
      '/serviceworker/resources/fetch-access-control.php',
      {method: 'POST', body: 'Test String'});
    return fetch(request)
      .then(function(response) { return response.text(); })
      .then(evalJsonp)
      .then(function(result) {
          assert_equals(result.method, 'POST');
          assert_equals(result.body, 'Test String');
        });
  }, 'Fetch with string body test');

sequential_promise_test(function(t) {
    var text = 'Test ArrayBuffer';
    var array = new Uint8Array(text.length);
    for (var i = 0; i < text.length; ++i)
      array[i] = text.charCodeAt(i);
    var request = new Request(
      '/serviceworker/resources/fetch-access-control.php',
      {method: 'POST', body: array.buffer});
    return fetch(request)
      .then(function(response) { return response.text(); })
      .then(evalJsonp)
      .then(function(result) {
          assert_equals(result.method, 'POST');
          assert_equals(result.body, 'Test ArrayBuffer');
        });
  }, 'Fetch with ArrayBuffer body test');

sequential_promise_test(function(t) {
    var text = 'Test ArrayBufferView';
    var array = new Uint8Array(text.length);
    for (var i = 0; i < text.length; ++i)
      array[i] = text.charCodeAt(i);
    var request = new Request(
      '/serviceworker/resources/fetch-access-control.php',
      {method: 'POST', body: array});
    return fetch(request)
      .then(function(response) { return response.text(); })
      .then(evalJsonp)
      .then(function(result) {
          assert_equals(result.method, 'POST');
          assert_equals(result.body, 'Test ArrayBufferView');
        });
  }, 'Fetch with ArrayBufferView body test');

sequential_promise_test(function(t) {
    var formData = new FormData();
    formData.append('StringKey1', '1234567890');
    formData.append('StringKey2', 'ABCDEFGHIJ');
    formData.append('BlobKey', new Blob(['blob content']));
    formData.append('FileKey',
                    new File(['file content'], 'file.dat'));
    var request = new Request(
      '/serviceworker/resources/fetch-access-control.php',
      {method: 'POST', body: formData});
    return fetch(request)
      .then(function(response) { return response.text(); })
      .then(evalJsonp)
      .then(function(result) {
          assert_equals(result.method, 'POST');
          assert_equals(result.post['StringKey1'], '1234567890');
          assert_equals(result.post['StringKey2'], 'ABCDEFGHIJ');
          var files = [];
          for (var i = 0; i < result.files.length; ++i) {
            files[result.files[i].key] = result.files[i];
          }
          assert_equals(files['BlobKey'].content, 'blob content');
          assert_equals(files['BlobKey'].name, 'blob');
          assert_equals(files['BlobKey'].size, 12);
          assert_equals(files['FileKey'].content, 'file content');
          assert_equals(files['FileKey'].name, 'file.dat');
          assert_equals(files['FileKey'].size, 12);
        });
  }, 'Fetch with FormData body test');

test(function(t) {
    function runInfiniteFetchLoop() {
      fetch('dummy.html')
        .then(function() { runInfiniteFetchLoop(); });
    }
    runInfiniteFetchLoop();
  },
  'Destroying the execution context while fetch is happening should not ' +
  'cause a crash.');

sequential_promise_test_done();
done();
