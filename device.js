const events = require('events');
const fs = require('fs');
const emitter = new events.EventEmitter();

class Device {
  device = null;
  constructor(options) {
    this.device = options.device;
  }

  start(cb) {
    cb();
  }
}