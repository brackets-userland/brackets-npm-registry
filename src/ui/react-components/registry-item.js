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
          <button className="btn btn-mini btn-remove" onClick={this.handleRemove}>{Strings.REMOVE}</button>
        );
      } else {
        buttons.push(
          <button className="btn btn-mini btn-reinstall" onClick={this.handleInstall}>{Strings.REINSTALL}</button>,
          <button className="btn btn-mini btn-remove" onClick={this.handleRemove}>{Strings.REMOVE}</button>
        );
      }

      return <div className="row-fluid registry-item">
        <div className="span10">
          <h1>
            <a onClick={this.handleShowNpm} href="#">
              {registryInfo.name}
            </a>
          </h1>
          <h2>{registryInfo.description}</h2>
          <div>
            {Strings.AUTHOR}: <a onClick={this.handleShowAuthor} href="#">{registryInfo.author.name}</a>
          </div>
          <div>
            {Strings.LATEST}: {latestVersion} - {latestVersionDate}
          </div>
        </div>
        <div className="span2">
          {buttons}
        </div>
      </div>;
    },

    handleInstall: function () {
      registryUtils.install(this.props.registryInfo.name);
    },

    handleRemove: function () {
      registryUtils.remove(this.props.registryInfo.name);
    },

    handleShowNpm: function () {
      NativeApp.openURLInDefaultBrowser(`https://www.npmjs.com/package/${this.props.registryInfo.name}`);
    },

    handleShowAuthor: function () {
      NativeApp.openURLInDefaultBrowser(this.props.registryInfo.author.url);
    }

  });

});
