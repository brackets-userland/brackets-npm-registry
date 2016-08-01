define(function (require, exports, module) {
  'use strict';

  let _ = brackets.getModule('thirdparty/lodash');
  let NativeApp = brackets.getModule('utils/NativeApp');
  let React = brackets.getModule('thirdparty/react');
  let Strings = require('strings');
  let registryUtils = require('../registry-utils');

  let formatDate = function (val) {
    return val.substring(0, 10);
  };

  module.exports = React.createClass({

    getInitialState: function () {
      return {
        dependeciesShown: false
      };
    },

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
        <div className="span10 text-left">
          <h1>
            <a className="defaultColor" onClick={this.handleShowNpm.bind(this, this.props.registryInfo.name)} href="#">
              {registryInfo.displayName}
            </a>
          </h1>
          <h2>{registryInfo.description}</h2>
          <div>
            {Strings.AUTHOR}: <a onClick={this.handleShowAuthor} href="#">{registryInfo.author.name}</a>
          </div>
          <div>
            {Strings.LATEST}: {latestVersion} - {latestVersionDate}
            {registryInfo.github ?
              <span>
                <span>; </span>
                <a className="defaultColor" href="" onClick={this.handleShowIssues}>
                  {registryInfo.github.issueCount} {Strings._OPEN_ISSUES}
                </a>
                <span>, </span>
                <a className="defaultColor" href="" onClick={this.handleShowPulls}>
                  {registryInfo.github.pullCount} {Strings._OPEN_PULLS}
                </a>
                {' ' + Strings._ON_GITHUB}
              </span>
            : ''}
          </div>
          <div>
            {this.props.registryInfo.downloadsLastWeek} {Strings._DOWNLOADS} {Strings._LAST_WEEK + ', '}
            {this.props.registryInfo.downloadsTotal} {Strings._DOWNLOADS} {Strings._TOTAL}
          </div>
          <div>
            {this.getDependencies().length} {Strings._DEPENDENCIES}
            {!this.state.dependeciesShown ?
              <span>
                {' '}<a className="defaultColor" href="" onClick={this.handleShowDependencies}>{Strings._SHOW_LINK}</a>
              </span>
            :
              <ul>
                {this.getDependencies().map((obj, i) =>
                  <li key={i}><a className="defaultColor" href="" onClick={this.handleShowNpm.bind(this, obj.name)}>
                    {obj.name}@{obj.version}
                  </a></li>
                )}
              </ul>
            }
          </div>
        </div>
        <div className="span2">
          {buttons}
        </div>
      </div>;
    },

    getDependencies: function () {
      let mapper = (version, name) => { return {name, version}; };
      let dependencies = [].concat(
        _.map(this.props.registryInfo.dependencies, mapper),
        _.map(this.props.registryInfo.devDependencies, mapper)
      );
      return _.sortBy(dependencies, 'name');
    },

    handleShowDependencies: function () {
      this.setState({dependeciesShown: true});
    },

    handleInstall: function () {
      registryUtils.install(this.props.registryInfo.name);
    },

    handleRemove: function () {
      registryUtils.remove(this.props.registryInfo.name);
    },

    handleShowNpm: function (pkg) {
      NativeApp.openURLInDefaultBrowser(`https://www.npmjs.com/package/${pkg}`);
    },

    handleShowAuthor: function () {
      NativeApp.openURLInDefaultBrowser(this.props.registryInfo.author.url);
    },

    handleShowIssues: function () {
      NativeApp.openURLInDefaultBrowser('https://github.com/' + this.props.registryInfo.github.username +
                                        '/' + this.props.registryInfo.github.repository + '/issues');
    },

    handleShowPulls: function () {
      NativeApp.openURLInDefaultBrowser('https://github.com/' + this.props.registryInfo.github.username +
                                        '/' + this.props.registryInfo.github.repository + '/pulls');
    }

  });

});
