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
                    // here for the demo's sake we are not going to generelaize
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
