/* jshint esversion: 6 */
/* global __dirname */
(() => {
  'use strict';
  
  const uuid = require('uuid4');
  const http = require('http');
  const proxy = require('http-proxy');
  const Logger = require(__dirname + '/logger');
  const Workers = require(__dirname + '/workers');

  const workers = new Workers();
  const loggger = new Logger();
  
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
    
      proxy.on('error', function(err, req, socket) {
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
  
})();