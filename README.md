# trooba-service-api

[![Greenkeeper badge](https://badges.greenkeeper.io/trooba/trooba-service-api.svg)](https://greenkeeper.io/)

This module is not an implementation, but a spec of what should be implemented by a transport component to support generic service management API like starting and stopping the server.

We would like to abstract this API to be able to re-use the same pipe with different transports.

### Spec

Based on most of the available server implementations we can easily identify the basic APIs that every transport should provide to be used to serve incoming traffic.

The transport implementation should expose this API under generic name 'server:default' which will be used by Trooba when it tries to execute server API

#### Start server API

* Should start the server and return a reference to the server instance to manage it.
* An optional callback will be called when the server is ready.

```js
const Trooba = require('trooba');
const pipe = Trooba.use(transport, {
    port: 8000
}).build();
const server = pipe.create();

// start the service
const svr = server.listen(() => {
    console.log('The server is ready');
});
```

#### Stop server API

* Becomes available in server instance returned by listen method
* Accept an optional callback that will be called when server successfully closed all the connections.

```js
// ...
// later in-time
svr.close(() => {
    console.log('The server is stopped');
});
```

#### Example

```js
'use strict';

/*
    This example demonstrates a creation of http server for Trooba pipeline framework
*/

const Assert = require('assert');
const Http = require('http');
const Trooba = require('trooba');

const pipe = Trooba
    .use(httpServerTransport, {
        port: 8080
    })
    // controller
    .use(pipe => {
        pipe.on('request', request => {
            pipe.respond({
                status: 200,
                body: `Hello world`
            });
        });
    })
    .build();

const server = pipe.create('server:default');
server.listen(() => {
    console.log('The server is ready');
});

function httpServerTransport(pipe, config) {
    Assert.ok(config.port !== undefined, 'Port must be provided as part of transport config');

    pipe.set('server:default', function serverFactory(pipe) {
        return {
            listen(callback) {
                const server =  Http.createServer((req, res) => {
                    // here for the demo's sake we are not going to generalize
                    // request and response and handle them as is
                    pipe.create().request(req, (err, response) => {
                        if (err) {
                            res.writeHead(500);
                            res.end(err.message);
                            return;
                        }
                        res.writeHead(response.status, response.headers);
                        res.end(response.body);
                    });
                });

                return server.listen(config.port, callback);
            }
        };
    });
}
```
