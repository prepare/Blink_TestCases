// Allows a document to exercise the Push API within a service worker by sending commands.

// The port through which the document sends commands to the service worker.
var port = null;

// The most recently seen subscription.
var lastSeenSubscription = null;

self.addEventListener('message', function(workerEvent) {
    port = workerEvent.data;

    // Listen to incoming commands on the message port.
    port.onmessage = function(event) {
        if (typeof event.data != 'object' || !event.data.command)
            return;

        switch (event.data.command) {
            case 'hasPermission':
                self.registration.pushManager.hasPermission().then(function(permissionStatus) {
                    port.postMessage({ command: event.data.command,
                                       success: true,
                                       permission: permissionStatus });
                }).catch(makeErrorHandler(event.data.command));
                break;

            case 'subscribe':
                self.registration.pushManager.subscribe().then(function(subscription) {
                    lastSeenSubscription = subscription;
                    port.postMessage({ command: event.data.command,
                                       success: true,
                                       subscriptionId: subscription.subscriptionId,
                                       endpoint: subscription.endpoint });
                }).catch(makeErrorHandler(event.data.command));
                break;

            case 'getSubscription':
                self.registration.pushManager.getSubscription().then(function(subscription) {
                    lastSeenSubscription = subscription;
                    var subscriptionId = subscription ? subscription.subscriptionId : null;
                    port.postMessage({ command: event.data.command,
                                       success: true,
                                       subscriptionId: subscriptionId });
                }).catch(makeErrorHandler(event.data.command));
                break;

            case 'unsubscribe':
                self.registration.pushManager.getSubscription()
                    .then(function(subscription) {
                        // We keep track of lastSeenSubscription so we can attempt to unsubscribe
                        // more than once.
                        subscription = subscription || lastSeenSubscription;
                        if (!subscription)
                            throw new Error('There is no subscription to unsubscribe');
                        return subscription.unsubscribe();
                    })
                    .then(function(unsubscribeResult) {
                        port.postMessage({ command: event.data.command,
                                           success: true,
                                           unsubscribeResult: unsubscribeResult });
                    })
                    .catch(makeErrorHandler(event.data.command));
                break;

            default:
                port.postMessage({ command: 'error',
                                   errorMessage: 'Invalid command: ' + event.data.command });
                break;
        }
    };

    // Notify the controller that the worker is now available.
    port.postMessage('ready');
});

function makeErrorHandler(command) {
    return function(error) {
        var errorMessage = error ? error.message : 'unknown error';
        port.postMessage({ command: command,
                           success: false,
                           errorMessage: errorMessage });
    };
}
