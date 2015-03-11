define(function (require, exports) {
  'use strict';

  let Dialogs = brackets.getModule('widgets/Dialogs');
  let React = require('react');
  let RegistryDialog = require('./react-components/registry-dialog');

  let show = function () {
    let template = '<div class="template modal"/>';
    let dialog = Dialogs.showModalDialogUsingTemplate(template);
    let $dialog = dialog.getElement();
    React.render(<RegistryDialog/>, $dialog[0]);
  };

  exports.show = show;

});
