(function() {
  'use strict';

  var proxy = require('http-proxy');
  var util = require('util');
  var _ = require("underscore");
  var ShadyMessages = require('shady-messages');

  var WORKER_TIMEOUT = 2000;
  
  module.exports = class {
    
    constructor() {
      this._workers = {};
      this._workerQueue = [];
      this._shadyMessages = new ShadyMessages();
      this._shadyMessages.on("cluster:ping", this._onClusterPing.bind(this));
      setInterval(this._workerReaper.bind(this), 1000);
    }
    
    selectWorker () {
      var workerId = this._workerQueue.shift();
      this._workerQueue.push(workerId);
      return this._workers[workerId];
    }
    
    _createProxy (host, port) {
	  return new proxy.createProxyServer({
	    target: {
		  host: host,
		  port: port
		},
	    ws: true,
	    xfwd: true
	  });
    } 
    
    _addWorker (workerId, host, port) {
      this._workers[workerId] = {
        host: host,
        port: port,
        proxy: this._createProxy(host, port)
      };
      
      this._workerQueue.push(workerId);
    
      this._shadyMessages.trigger("cluster:worker-connected", {
        workerId: workerId,
        host: host,
        port: port
      });
    }
    
    _disconnectWorker (workerId) {
      this._workerQueue = _.without(this._workerQueue, workerId);
      var worker = this._workers[workerId];
      delete this._workers[workerId];
      
      this._shadyMessages.trigger("cluster:worker-disconnected", {
        workerId: workerId,
        port: worker.port,
        host: worker.host
      });
    }
    
    _onClusterPing (event, data) {
      var workerId = data.workerId;
      var host = data.host;
      var port = data.port;
      var clients = data.clients;
      var now = new Date().getTime();
      
      if (!this._workers[workerId]) {
        this._addWorker(workerId, host, port);
      }
      
      this._workers[workerId] = _.extend(this._workers[workerId], {
        lastSeen: now,
        cpu: data.cpu,
        memory: data.memory
      });
      
      this._sortWorkerQueue();
    }
    
    _workerReaper () {
      var timeout = new Date().getTime() - WORKER_TIMEOUT;
    
      _.each(this._workers, function(value, key, object) {
        if (value.lastSeen < timeout) {
          this._disconnectWorker(key);
        } 
      }.bind(this));
    }
    
    _sortWorkerQueue () {
      this._workerQueue.sort(function (workerId1, workerId2) {
        var worker1 = this._workers[workerId1];
        var worker2 = this._workers[workerId2];
        
        if (worker1.memory > worker2.memory) {
          // worker 1 uses more memory
          return 1;
        } else if (worker1.memory < worker2.memory) {
          // worker 2 uses more memory
          return -1;
        } else {
          if (worker1.cpu < worker2.cpu) {
            // worker 1 has bigger cpu load
            return 1; 
          } else if (worker1.cpu < worker2.cpu) {
            // worker 2 has bigger cpu load 
            return -1;
          }
        }
         
        return 0;
      }.bind(this));
    }
    
  }
  
}).call(this);