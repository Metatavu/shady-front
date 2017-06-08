/* jshint esversion: 6 */
/* global __dirname */
(() => {
  'use strict';
  
  const architect = require('architect');
  const config = require('nconf');
  config.file({file: __dirname + '/config.json'});
  
  const architectConfig = architect.loadConfig(__dirname + '/config.js');
  
  architect.createApp(architectConfig, (err, app) => {
    const logger = app.getService('logger');
    if (!err) {
      logger.info("Shady front started");
    } else {
      logger.error(err);
    }
  });
  
})();