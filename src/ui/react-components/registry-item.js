define(function (require, exports, module) {
  'use strict';

  let NativeApp = brackets.getModule('utils/NativeApp');
  let React = require('react');
  let Strings = require('strings');
  let registryUtils = require('../registry-utils');

  let formatDate = function (val) {
    return val.substring(0, 10);
  };

  module.exports = React.createClass({

    handleInstall: function () {
      registryUtils.install(this.props.registryInfo.name);
    },

    showAuthor: function () {
      NativeApp.openURLInDefaultBrowser(this.props.registryInfo.author.url);
    },

    render: function () {
      let registryInfo = this.props.registryInfo;
      let latestVersion = registryInfo.version;
      let latestVersionDate = formatDate(registryInfo.time[registryInfo.version]);

      return <div className="row-fluid registry-item">
        <div className="span5">
          <div>
            <strong>{registryInfo.name}</strong>
          </div>
          <div>
            {Strings.AUTHOR}: <a onClick={this.showAuthor} href="#">{registryInfo.author.name}</a>
          </div>
          <div>
            {Strings.LATEST}: {latestVersion} - {latestVersionDate}
          </div>
        </div>
        <div className="span5">
        </div>
        <div className="span2">
          <button className="btn btn-mini" onClick={this.handleInstall}>{Strings.INSTALL}</button>
        </div>
      </div>;
    }

  });

});
