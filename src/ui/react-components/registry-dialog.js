define(function (require, exports, module) {
  'use strict';

  let React = require('react');
  let Strings = require('strings');
  let registryUtils = require('../registry-utils');
  let RegistryItem = require('./registry-item');

  module.exports = React.createClass({

    getInitialState: function () {
      return {
        registry: registryUtils.getRegistry()
      };
    },

    render: function () {
      return <div id="brackets-npm-registry-dialog">
        <div className="modal-header">
          <h1 className="dialog-title">{Strings.REGISTRY_DIALOG_TITLE}</h1>
        </div>
        <div className="modal-body">
          <div className="dialog-message">
            {this.state.registry.map(entry =>
              <RegistryItem registryInfo={entry} />
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="dialog-button btn primary" data-button-id="ok">{Strings.CLOSE}</button>
        </div>
      </div>;
    }

  });

});
