/* jshint esversion: 6 */
/* global __dirname */
(() => {
  'use strict';
  
  const architect = require('architect');
  const architectConfig = architect.loadConfig(__dirname + '/config.js');
  
  architect.createApp(architectConfig, (err, app) => {
    if(!err) {
      console.log("Shady front started");
    } else {
      console.error(err);
    }
  });
  
})();