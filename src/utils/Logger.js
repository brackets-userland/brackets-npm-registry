define(function (require, exports, module) {
  'use strict';

  let packageInfo = JSON.parse(require('text!../../package.json'));

  let stringify = function (arr) {
    return arr.map(x => {
      let strValue = x.toString();
      if (strValue === '[object Object]') {
        return JSON.stringify(x, null, 2);
      }
      return strValue;
    }).join(' ');
  };

  class Logger {

    constructor() {
      this.prefix = `[${packageInfo.name}] `;
    }

    log(...args) {
      console.log(this.prefix + stringify(args));
    }

    error(...args) {
      console.error(this.prefix + stringify(args));
    }

  }

  module.exports = new Logger();

});
