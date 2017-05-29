/* jshint esversion: 6 */
/* global __dirname */
(() => {
  'use strict';
  
  const architect = require('architect');
  const architectConfig = architect.loadConfig(__dirname + '/config.js');
  const config = require('nconf');
  
  config.file({file: __dirname + '/config.json'});
  
  architect.createApp(architectConfig, (err, app) => {
    const logger = app.getService('logger');
    if (!err) {
      logger.info("Shady front started");
    } else {
      logger.error(err);
    }
  });
  
})();