define(function (require, exports, module) {
  'use strict';

  const React = require('react');
  const Strings = require('strings');
  const Logger = require('../../utils/Logger');
  const Preferences = require('../../utils/preferences');
  const QuestionDialog = require('./question-dialog');
  const registryUtils = require('../registry-utils');
  const RegistryItem = require('./registry-item');

  module.exports = React.createClass({

    getInitialState: function () {
      return {
        registry: []
      };
    },

    componentDidMount: function () {
      registryUtils.getRegistry()
        .then(registry => {
          if (this.isMounted()) {
            this.setState({
              registry
            });
          }
        })
        .catch(err => Logger.error(err));
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
          <button className="btn" onClick={this.setNodePath}>{Strings.SET_NODE_PATH}</button>
          <button className="dialog-button btn primary" data-button-id="ok">{Strings.CLOSE}</button>
        </div>
      </div>;
    },

    setNodePath: function () {
      QuestionDialog.show(Strings.SET_NODE_PATH,
                          Strings.SET_NODE_PATH_QUESTION,
                          Preferences.get('nodePath'))
        .then(function (response) {
          Preferences.set('nodePath', response);
        })
        .catch(function (err) {
          // user canceled is rejected with null
          if (err) { throw err; }
        });
    }

  });

});
