define(function (require, exports) {
  'use strict';

  exports.errToString = function (err) {
    return err.name && err.message ?
      `${err.name}: ${err.message}` :
      `ERROR: ${JSON.stringify(err)}`;
  };

});
