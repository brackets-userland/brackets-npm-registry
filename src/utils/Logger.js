define(function (require, exports, module) {
  'use strict';

  let packageInfo = JSON.parse(require('text!../../package.json'));

  class Logger {

    constructor() {
      this.prefix = `[${packageInfo.name}] `;
    }

    log(...args) {
      console.log(this.prefix + args.join(' '));
    }

    error(...args) {
      console.error(this.prefix + args.join(' '));
    }

  }

  module.exports = new Logger();

});
