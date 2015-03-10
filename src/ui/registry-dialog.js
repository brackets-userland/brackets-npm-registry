define(function (require, exports) {
  'use strict';

  let React = require('react');
  let Logger = require('../utils/Logger');

  let Dialog = React.createClass({

    render: function () {
      return <div>
          hello world!
      </div>;
    }

  });

  let show = function () {
    Logger.log('TODO: show dialog');
  };

  exports.show = show;

});
