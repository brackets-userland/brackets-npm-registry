/*eslint strict:0, no-console:0*/
'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const npm = require('npm');
const Promise = require('bluebird');
const { all, fromNode, promisify, promisifyAll } = require('bluebird');
const fs = promisifyAll(require('fs'));
const request = require('request');
const logOutput = function (...args) { console.log(...args); };
const logProgress = function (...args) { console.error(...args); };

function calculateDownloadMetrics(extensionInfo) {
  let downloadsArray = extensionInfo.downloads;
  // downloadsLastWeek
  let today = new Date();
  today.setDate(today.getDate() - 7);
  let weekAgo = today.toISOString().substring(0, 10);
  extensionInfo.downloadsLastWeek = downloadsArray
    .filter(obj => obj.day >= weekAgo)
    .reduce((sum, obj) => sum + obj.downloads, 0);
  // downloadsTotal
  extensionInfo.downloadsTotal = downloadsArray
    .reduce((sum, obj) => sum + obj.downloads, 0);
}

function buildRegistry(targetFile) {

  logProgress('loading npm');
  return fromNode(npm.load.bind(npm))
    .then(() => {
      // npm is loaded, we can start the search
      // get all entries tagged 'brackets-extension'
      logProgress(`executing npm search brackets-extension`);
      return fromNode(npm.commands.search.bind(npm.commands, ['brackets-extension'], true));
    })
    .then(searchResults => {
      // call view for all potential extensions
      logProgress(`executing npm view to get detailed info about the extensions`);
      let npmView = promisify(npm.commands.view, npm.commands);
      return all(Object.keys(searchResults).map(
        extensionId =>
          npmView([extensionId + '@latest'], true).then(result =>
            result[Object.keys(result)[0]]
          )
      ));
    })
    .then(viewResults => {
      logProgress(`got all view results`);
      // filter out those, which doesn't have brackets engine specified
      return viewResults.filter(result => result.engines && result.engines.brackets);
    })
    .then(extensionInfos => {
      logProgress(`getting download info counts for the extensions`);
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
            calculateDownloadMetrics(extensionInfos[0]);
          } else {
            extensionInfos.forEach(extensionInfo => {
              let info = body[extensionInfo.name];
              if (info && info.downloads) {
                extensionInfo.downloads = info.downloads;
                calculateDownloadMetrics(extensionInfo);
              }
            });
          }

          resolve(extensionInfos);

        });
      });
    })
    .then(extensionInfos => {
      logProgress(`getting issue/pr counts for the extensions`);
      return Promise.all(extensionInfos.map(extensionInfo => {

        const githubRepo = /^(git\+)?https?:\/\/[^\/]*github.com\/([^\/]+)\/([^\/]+)$/;

        let candidates = _.compact([
          extensionInfo.repository ? extensionInfo.repository.url : null,
          extensionInfo.repository,
          extensionInfo.homepage
        ]).filter(x => typeof x === 'string').filter(x => x.match(githubRepo));

        if (candidates.length === 0) {
          return Promise.resolve();
        }

        let m = candidates[0].match(githubRepo);
        let username = m[2];
        let repo = m[3];

        if (repo.match(/\.git$/)) { repo = repo.slice(0, -4); }

        extensionInfo.github = {};
        extensionInfo.github.username = username;
        extensionInfo.github.repository = repo;
        extensionInfo.github.issueCount = -1;
        extensionInfo.github.pullCount = -1;

        let githubIssueCount = NaN;
        let githubPullCount = NaN;

        return new Promise((resolve) => {
          let url = `https://github.com/${username}/${repo}/issues`;
          request({
            url,
            method: `GET`,
            headers: {
              'User-Agent': `brackets-npm-registry`
            }
          }, (error, response, body) => {
            if (error || response.statusCode !== 200) {
              if (response) {
                logProgress(`GET ${url} ERR`, response.statusCode);
              } else {
                logProgress(`GET ${url} ERR`, error);
              }
              return resolve();
            }
            let parsedBody = cheerio.load(body);
            githubIssueCount = parseInt(parsedBody(`a[href="/${username}/${repo}/issues"] .counter`).text(), 10);
            githubPullCount = parseInt(parsedBody(`a[href="/${username}/${repo}/pulls"] .counter`).text(), 10);
            resolve();
          });
        }).then(() => {
          extensionInfo.github.issueCount = isNaN(githubIssueCount) ? -1 : githubIssueCount;
          extensionInfo.github.pullCount = isNaN(githubPullCount) ? -1 : githubPullCount;
        });
      })).then(() => extensionInfos);
    })
    .then(extensionInfos => {
      let strResults = JSON.stringify(extensionInfos, null, 2);
      logProgress(`all done`);
      if (targetFile) {
        logProgress(`writing the results to file:\n`, targetFile);
        return fs.writeFileAsync(targetFile, strResults)
          .then(() => extensionInfos);
      }
      logOutput(strResults);
      return extensionInfos;
    });

}

if (process.argv[1] === __filename) {
  buildRegistry(...process.argv.slice(2));
} else {
  module.exports = buildRegistry;
}

