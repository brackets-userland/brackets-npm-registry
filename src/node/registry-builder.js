/*eslint strict:0*/
'use strict';

const npm = require('npm');
const Promise = require('bluebird');
const request = require('request');

function buildRegistry() {

  let npmLoad = Promise.promisify(npm.load, npm);
  return npmLoad()
    .then(() => {

      // get all entries tagged 'brackets-extension'
      let npmSearch = Promise.promisify(npm.commands.search, npm.commands);
      return npmSearch(['brackets-extension'], true);

    })
    .then(searchResults => {

      // call view for all potential extensions
      let npmView = Promise.promisify(npm.commands.view, npm.commands);
      return Promise.all(Object.keys(searchResults).map(
        extensionId =>
          npmView([extensionId + '@latest'], true).then(result =>
            result[Object.keys(result)[0]]
          )
      ));

    })
    .then(viewResults => {

      // filter out those, which doesn't have brackets engine specified
      return viewResults.filter(result => result.engines && result.engines.brackets);

    })
    .then(extensionInfos => {

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
    });

}

if (process.argv[1] === __filename) {
  buildRegistry(...process.argv.slice(2));
} else {
  module.exports = buildRegistry;
}

