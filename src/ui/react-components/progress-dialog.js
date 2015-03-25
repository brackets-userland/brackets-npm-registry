define(function (require, exports) {
  'use strict';

  const Strings = require('strings');
  const Dialogs = brackets.getModule('widgets/Dialogs');
  const React = require('react');
  const Utils = require('../../utils/index');
  let dialog = null;

  let ProgressDialog = React.createClass({

    getInitialState: function () {
      return {
        finished: false,
        lines: []
      };
    },

    componentWillMount: function () {
      this.props.promise
        .progressed(msg => {
          this.setState({
            lines: this.state.lines.concat(msg)
          });
        })
        .then(stdout => {
          this.setState({
            lines: this.state.lines.concat(stdout)
          });
        })
        .catch(err => {
          this.setState({
            lines: this.state.lines.concat(Utils.errToString(err))
          });
        })
        .finally(() => {
          this.setState({
            finished: true
          });
        });
    },

    componentDidUpdate: function () {
      let $textarea = $(this.getDOMNode()).find('textarea');
      $textarea.scrollTop($textarea[0].scrollHeight - $textarea.height());
    },

    render: function () {
      return <div id="brackets-npm-registry-progress-dialog">
        <div className="modal-header">
          <h1 className="dialog-title">{Strings.OPERATION_IN_PROGRESS}</h1>
        </div>
        <div className="modal-body">
          <div className="row-fluid">
            <textarea className="span12" readOnly="readonly" value={this.state.lines.join('\n')}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          {this.state.finished ?
            <button className="dialog-button btn primary" onClick={this.handleClose}>{Strings.CLOSE}</button>
          : ''}
        </div>
      </div>;
    },

    handleClose: function () {
      dialog.close();
    }

  });

  let show = function (promise) {
    let template = '<div class="template modal"/>';
    dialog = Dialogs.showModalDialogUsingTemplate(template, false);
    let $dialog = dialog.getElement();
    React.render(<ProgressDialog promise={promise} />, $dialog[0]);
  };

  exports.show = show;
  exports._ProgressDialog = ProgressDialog;

});
