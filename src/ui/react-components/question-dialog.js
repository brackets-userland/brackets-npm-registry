define(function (require, exports) {
  'use strict';

  const Strings = require('strings');
  const Dialogs = brackets.getModule('widgets/Dialogs');
  const React = brackets.getModule('thirdparty/react');
  let dialog = null;

  let QuestionDialog = React.createClass({

    render: function () {
      return <div id="brackets-npm-registry-question-dialog">
        <div className="modal-header">
          <h1 className="dialog-title">{this.props.title}</h1>
        </div>
        <div className="modal-body">
          <p>{this.props.question}</p>
          <input type="text" defaultValue={this.props.default} />
        </div>
        <div className="modal-footer">
          <button data-button-id="cancel" className="dialog-button btn">{Strings.CANCEL}</button>
          <button data-button-id="ok" className="dialog-button btn primary">{Strings.OK}</button>
        </div>
      </div>;
    }

  });

  function show(title, question, defValue) {
    let template = '<div class="template modal"/>';
    dialog = Dialogs.showModalDialogUsingTemplate(template);
    let $dialog = dialog.getElement();
    React.render(<QuestionDialog title={title} question={question} default={defValue} />, $dialog[0]);

    return new Promise(function (resolve, reject) {
      dialog.done(function (buttonId) {
        let $input = dialog.getElement().find('input');
        let inputValue = $input.val().trim() || null;
        return buttonId === 'ok' ? resolve(inputValue) : reject();
      });
    });
  }

  exports.show = show;
  exports._QuestionDialog = QuestionDialog;

});
