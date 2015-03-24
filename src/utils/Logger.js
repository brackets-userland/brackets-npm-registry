/*eslint no-console:0,no-undefined:0*/

define(function (require, exports, module) {
  'use strict';

  let packageInfo = JSON.parse(require('text!../../package.json'));

  let toString = function (obj) {
    if (obj === undefined) { return 'undefined'; }
    if (obj === null) { return 'null'; }
    return obj.toString();
  };

  let stringify = function (arr) {
    return arr.map(x => {
      let strValue = toString(x);
      if (strValue === '[object Object]') {
        return JSON.stringify(x, null, 2);
      }
      return strValue;
    }).join(' ');
  };

  let Logger = class {

    constructor() {
      this.prefix = `[${packageInfo.name}] `;
    }

    log(...args) {
      console.log(this.prefix + stringify(args));
    }

    error(...args) {
      console.error(this.prefix + stringify(args));
    }

  };

  module.exports = new Logger();

});
