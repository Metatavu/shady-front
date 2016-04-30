(function() {
  'use strict';
  
  var uuid = require('uuid4');
  var http = require('http');
  var proxy = require('http-proxy');
  var ShadyMessages = require('shady-messages');
  var Logger = require(__dirname + '/logger');
  var Workers = require(__dirname + '/workers');

  var workers = new Workers();
  var loggger = new Logger();
  
  var server = http.createServer(function(req, res) {
    var worker = workers.selectWorker();
    var proxy = worker.proxy;
    proxy.web(req, res);
    
    proxy.on('error', function (err, req, res) {
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
  });

  server.on('upgrade', function(req, socket, head) {
    var worker = workers.selectWorker();
    console.log(worker.port + ':' + worker.cpu);
    
    var proxy = worker.proxy;
    proxy.ws(req, socket, head);
    
    proxy.on('error', function(err, req, socket) {
      // TODO: Migrate to another server
      console.error(err, "WebSocket error occurred");
      socket.end();
    });
  });

  server.listen(8000);
  
}).call(this);