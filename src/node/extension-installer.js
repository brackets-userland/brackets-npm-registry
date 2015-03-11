(function () {
  'use strict';

  let npm = require('npm');
  let Promise = require('bluebird');
  let all = Promise.all;
  let fromNode = Promise.fromNode;
  let fs = require('fs-extra');
  let path = require('path');

  exports.install = function (targetPath, name) {

    let npmInstallFolder = path.resolve(targetPath, 'node_modules', name);
    let finalInstallFolder = path.resolve(targetPath, name);

    return fromNode(npm.load.bind(npm))
      .then(() => {
        // npm is loaded, we can start the installation
        return fromNode(npm.commands.install.bind(npm.commands, targetPath, name));
      })
      .then(() => {
        // installation successful, we can create the target directory
        return fromNode(fs.ensureDir.bind(fs, finalInstallFolder));
      })
      .then(() => {
        // final directory is there, read its contents
        return fromNode(fs.readdir.bind(fs, finalInstallFolder));
      })
      .then(dirContents => {
        // delete everything except .git
        return all(dirContents.map(entry => {
          if (entry === '.git') { return null; }
          return fromNode(fs.remove.bind(fs, path.resolve(finalInstallFolder, entry)));
        }).filter(x => !!x));
      })
      .then(() => {
        // read contents of installed directory
        return fromNode(fs.readdir.bind(fs, npmInstallFolder));
      })
      .then(dirContents => {
        // move everything to the final folder
        return all(dirContents.map(entry => {
          return fromNode(fs.move.bind(fs,
                                       path.resolve(npmInstallFolder, entry),
                                       path.resolve(finalInstallFolder, entry)));
        }));
      })
      .finally(() => {
        // all done, now just remove the node_modules temp directory
        return fromNode(fs.remove.bind(fs, path.resolve(targetPath, 'node_modules')));
      });

  };

}());
