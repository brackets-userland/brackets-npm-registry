/*eslint strict:0*/
'use strict';

const npm = require('npm');
const Promise = require('bluebird');
const { all, fromNode, promisify, promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs'));
const request = require('request');
const { log } = console;

function buildRegistry(targetFile) {

  log('loading npm');
  return fromNode(npm.load.bind(npm))
    .then(() => {
      // npm is loaded, we can start the search
      // get all entries tagged 'brackets-extension'
      log(`executing npm search brackets-extension`);
      return fromNode(npm.commands.search.bind(npm.commands, ['brackets-extension']));
    })
    .then(searchResults => {
      // call view for all potential extensions
      log(`executing npm view to get detailed info about the extensions`);
      let npmView = promisify(npm.commands.view, npm.commands);
      return all(Object.keys(searchResults).map(
        extensionId =>
          npmView([extensionId + '@latest'], true).then(result =>
            result[Object.keys(result)[0]]
          )
      ));
    })
    .then(viewResults => {
      log(`got all view results`);
      // filter out those, which doesn't have brackets engine specified
      return viewResults.filter(result => result.engines && result.engines.brackets);
    })
    .then(extensionInfos => {
      log(`getting download info counts for the extensions`);
      // get download counts for the extensions
      let extensionIds = extensionInfos.map(i => i.name);
      let from = '2015-01-01';
      let to = new Date().toISOString().substring(0, 10);
      return new Promise((resolve, reject) => {
        request(`https://api.npmjs.org/downloads/range/${from}:${to}/${extensionIds.join(',')}`,
        (error, response, body) => {

          if (error) {
            return reject(error);
          }

          if (response.statusCode !== 200) {
            return reject(body);
          }

          if (typeof body === 'string') {
            try {
              body = JSON.parse(body);
            } catch (err) {
              return reject(err);
            }
          }

          if (extensionIds.length === 1) {
            extensionInfos[0].downloads = body.downloads;
          } else {
            extensionInfos.forEach(extensionInfo => {
              let info = body[extensionInfo.name];
              if (info && info.downloads) {
                extensionInfo.downloads = info.downloads;
              }
            });
          }

          resolve(extensionInfos);

        });
      });
    })
    .then(extensionInfos => {
      log(`all done`);
      if (targetFile) {
        log(`writing the results to file:\n`, targetFile);
        return fs.writeFileAsync(targetFile, JSON.stringify(extensionInfos, null, 2))
          .then(() => extensionInfos);
      }
      return extensionInfos;
    });

}

if (process.argv[1] === __filename) {
  buildRegistry(...process.argv.slice(2));
} else {
  module.exports = buildRegistry;
}

