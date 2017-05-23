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
  "../shady-messages",
  "./plugins/balancer",
  "./plugins/workers",
];