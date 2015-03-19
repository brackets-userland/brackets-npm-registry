(function () {
  'use strict';

  function fixEOL(str) {
    if (str[str.length - 1] === '\n') {
      str = str.slice(0, -1);
    }
    return str;
  }

  // helper for ChildProcess.spawn
  exports.join = function (arr) {
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
    let result, index = 0, length;
    length = arr.reduce(function (l, b) {
      return l + b.length;
    }, 0);
    result = new Buffer(length);
    arr.forEach(function (b) {
      b.copy(result, index);
      index += b.length;
    });
    return fixEOL(result.toString('utf8'));
  };

}());
