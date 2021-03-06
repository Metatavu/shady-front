(function() {
  'use strict';
  
  const uuid = require('uuid4');
  const http = require('http');
  const proxy = require('http-proxy');

  const Balancer = class {
    
    constructor(workers) {
    
      const server = http.createServer((req, res) => {
        const worker = workers.selectWorker();
        if (worker) {
          const proxy = worker.proxy;
          proxy.web(req, res);

          proxy.on('error', (err, req, res) => {
            console.error(err, "Error");

            // TODO: Migrate to another server
            if (!res.socket) {
              // client abort
              res.end();      
            } else {
              if (res.socket.destroyed) {
                // client abort
                res.end();       
              } else {
                console.error(err);
              }
            }
          });
        } else {
          console.error("Unable to create web proxy: No workers connected...");
          if (res.socket) {
            res.socket.end();
          }
        }
      });

      server.on('upgrade', (req, socket, head) => {
        const worker = workers.selectWorker();
        if (worker) {
          const proxy = worker.proxy;
          proxy.ws(req, socket, head);

          proxy.on('error', (err, req, socket) => {
            // TODO: Migrate to another server
            console.error(err, "WebSocket error occurred");
            socket.end();
          });
        } else {
          console.error("Unable to create websocket proxy: No workers connected...");
          if (socket) {
            socket.end();
          }
        }
      });

      server.listen(8000);
    }
    
  };
  
  module.exports = function setup(options, imports, register) {
    register(null, {
      'shady-balancer': new Balancer(imports['shady-workers'])
    });
  };
  
}).call(this);