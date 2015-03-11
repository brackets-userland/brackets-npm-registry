define(function (require, exports) {
  'use strict';

  let Dialogs = brackets.getModule('widgets/Dialogs');
  let React = require('react');
  let Strings = require('strings');
  let registryUtils = require('./registry-utils');

  let Dialog = React.createClass({

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
            {this.state.registry.map(entry => {
              return <h2>{entry.name}</h2>;
            })}
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
    React.render(<Dialog/>, $dialog[0]);
  };

  exports.show = show;

});
