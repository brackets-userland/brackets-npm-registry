define(function (require, exports) {
  'use strict';

  const Dialogs = brackets.getModule('widgets/Dialogs');
  const Logger = require('../../utils/logger');
  const React = require('react');
  const Strings = require('strings');
  const RegistryItem = require('./registry-item');
  const RegistryUtils = require('../registry-utils');

  let RegistryDialog = React.createClass({

    getInitialState: function () {
      return {
        registry: []
      };
    },

    // get the registry after the dialog is opened
    componentDidMount: function () {
      RegistryUtils.getRegistry()
        .then(registry => {
          if (this.isMounted()) {
            this.setState({
              registry
            });
          }
        })
        .catch(err => Logger.error(err));
      // TODO: hook on events from RegistryUtils to refresh the dialog when needed
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

  let show = function () {
    let template = '<div class="template modal"/>';
    let dialog = Dialogs.showModalDialogUsingTemplate(template);
    let $dialog = dialog.getElement();
    React.render(<RegistryDialog/>, $dialog[0]);
  };

  exports.show = show;

});
