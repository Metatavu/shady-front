(function() {
  'use strict';

  var util = require('util');
  var ShadyMessages = require('shady-messages');
     
  var Logger = class {
    
    constructor() {
      this._shadyMessages = new ShadyMessages(); 
      
      this._shadyMessages.on("cluster:worker-disconnected", this._onWorkerDisconnected.bind(this));
      this._shadyMessages.on("cluster:worker-connected", this._onWorkerConnected.bind(this));
    }
    
    _log (text) {
      console.log(util.format("%s: %s", new Date(), text));
    }
    
    _onWorkerDisconnected (event, data) {
      this._log(util.format("Worker (%s) at %s:%d disconnected", data.workerId, data.host, data.port));
    }
    
    _onWorkerConnected (event, data) {
      this._log(util.format("Worker (%s) from %s:%d connected", data.workerId, data.host, data.port));
    }
  }
  
  module.exports = Logger;

}).call(this);