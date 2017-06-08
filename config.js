 const config = require('nconf');
 
 module.exports = [
  {
    "packagePath": "architect-logger",
    "exitOnError": false,
    "transports": {
      "console": {
        "colorize": true,
        "level": "verbose"
      }
    }
  },
  {
    "packagePath": "shady-messages",
    "amqpUrl": config.get('amqp:url')
  },
  "./plugins/balancer",
  "./plugins/workers",
];