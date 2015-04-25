define(function (require, exports) {
  'use strict';

  const Commands = brackets.getModule('command/Commands');
  const CommandManager = brackets.getModule('command/CommandManager');
  const Dialogs = brackets.getModule('widgets/Dialogs');
  const DefaultDialogs = brackets.getModule('widgets/DefaultDialogs');
  const Logger = require('../../utils/logger');
  const React = require('react');
  const Strings = require('strings');
  const BracketsStrings = brackets.getModule('strings');
  const RegistryItem = require('./registry-item');
  const RegistryUtils = require('../registry-utils');

  let restartRequiredAfterClose = false;

  let RegistryDialog = React.createClass({

    getInitialState: function () {
      return {
        registry: [],
        registryLoading: true
      };
    },

    // get the registry after the dialog is opened
    componentDidMount: function () {
      RegistryUtils.getRegistry()
        .then(registry => {
          if (this.isMounted()) {
            this.setState({
              registry,
              registryLoading: false
            });
          }
        })
        .catch(err => {
          Logger.error(err);
          if (this.isMounted()) {
            this.setState({registryLoading: false});
          }
        });

      RegistryUtils.on('change', this.handleRegistryChange);
    },

    componentWillUnmount: function () {
      RegistryUtils.off('change', this.handleRegistryChange);
    },

    handleRegistryChange: function () {
      // extension has been installed/updated/removed
      restartRequiredAfterClose = true;
    },

    render: function () {
      let contents;
      if (this.state.registryLoading) {
        contents = <div className="text-center">
          <span className="spinner inline large spin" />
        </div>;
      } else {
        contents = this.state.registry.map(entry =>
          <RegistryItem registryInfo={entry} />
        );
      }
      return <div id="brackets-npm-registry-dialog">
        <div className="modal-header">
          <h1 className="dialog-title">{Strings.REGISTRY_DIALOG_TITLE}</h1>
        </div>
        <div className="modal-body">
          <div className="dialog-message">
            {contents}
          </div>
        </div>
        <div className="modal-footer">
          <button className="dialog-button btn primary" data-button-id="close">{Strings.CLOSE}</button>
        </div>
      </div>;
    }

  });

  let afterClose = function () {
    // prompt the user to restart Brackets
    if (!restartRequiredAfterClose) {
      return;
    }

    let dialog = Dialogs.showModalDialog(
      DefaultDialogs.DIALOG_ID_CHANGE_EXTENSIONS,
      BracketsStrings.CHANGE_AND_RELOAD_TITLE,
      BracketsStrings.CHANGE_AND_RELOAD_MESSAGE,
      [
        {
          className: Dialogs.DIALOG_BTN_CLASS_NORMAL,
          id: 'cancel',
          text: Strings.CANCEL
        },
        {
          className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
          id: 'reload',
          text: Strings.RELOAD
        }
      ],
      true
    );

    dialog.done(buttonId => {
      if (buttonId === 'reload') {
        CommandManager.execute(Commands.APP_RELOAD);
      }
    });
  };

  let show = function () {
    let template = '<div class="template modal"/>';
    let dialog = Dialogs.showModalDialogUsingTemplate(template);
    let $dialog = dialog.getElement();
    React.render(<RegistryDialog/>, $dialog[0]);
    dialog.done(() => {
      React.unmountComponentAtNode($dialog[0]);
      afterClose();
    });
  };

  exports.show = show;
  exports._RegistryItem = RegistryItem;
  exports._RegistryDialog = RegistryDialog;

});
