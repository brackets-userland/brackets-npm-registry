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

    render: function () {
      let registryInfo = this.props.registryInfo;
      let latestVersion = registryInfo.version;
      let latestVersionDate = formatDate(registryInfo.time[registryInfo.version]);
      let buttons = [];

      if (!registryInfo._currentlyInstalled) {
        buttons.push(
          <button className="btn btn-mini btn-install" onClick={this.handleInstall}>{Strings.INSTALL}</button>
        );
      } else if (registryInfo._updateAvailable) {
        buttons.push(
          <button className="btn btn-mini btn-update" onClick={this.handleInstall}>{Strings.UPDATE}</button>,
          <button className="btn btn-mini btn-uninstall" onClick={this.handleUninstall}>{Strings.UNINSTALL}</button>
        );
      } else {
        buttons.push(
          <button className="btn btn-mini btn-reinstall" onClick={this.handleInstall}>{Strings.REINSTALL}</button>,
          <button className="btn btn-mini btn-uninstall" onClick={this.handleUninstall}>{Strings.UNINSTALL}</button>
        );
      }

      return <div className="row-fluid registry-item">
        <div className="span5">
          <div>
            <strong>{registryInfo.name}</strong>
          </div>
          <div>
            {Strings.AUTHOR}: <a onClick={this.handleShowAuthor} href="#">{registryInfo.author.name}</a>
          </div>
          <div>
            {Strings.LATEST}: {latestVersion} - {latestVersionDate}
          </div>
        </div>
        <div className="span5">
        </div>
        <div className="span2">
          {buttons}
        </div>
      </div>;
    },

    handleInstall: function () {
      registryUtils.install(this.props.registryInfo.name);
    },

    handleUninstall: function () {
      registryUtils.uninstall(this.props.registryInfo.name);
    },

    handleShowAuthor: function () {
      NativeApp.openURLInDefaultBrowser(this.props.registryInfo.author.url);
    }

  });

});
