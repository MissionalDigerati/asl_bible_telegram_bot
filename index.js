'use strict';
/**
 * This file is part of ASL Bible Telegram bot, A bot designed to provide Bible
 * passages in American Sign Language.
 *
 * ASL Bible Telegram bot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ASL Bible Telegram bot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see
 * <http://www.gnu.org/licenses/>.
 *
 * @author Johnathan Pulos <johnathan@missionaldigerati.org>
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */
/**
 * Get the Configuration settings
 *
 * @type {Object}
 */
var config = require('./config');
/**
 * The Restify library for API development
 *
 * @type {Object}
 */
var restify = require('restify');
/**
 * The File System
 *
 * @type {Object}
 */
var fs = require('fs');
/**
 * The Restify Server
 *
 * @type {Object}
 */
if (process.env.NODE_ENV === 'production') {
  var server = restify.createServer({
    certificate: fs.readFileSync(config.ssl.certificate),
    key: fs.readFileSync(config.ssl.privateKey)
  });
} else {
  var server = restify.createServer();
}
/**
 * Setup our Digital Bible Platform Data Source
 *
 * @type {Object}
 */
var DigitalBiblePlatformDataSource = require('./lib/digital-bible-platform-data-source.js');
var dbpDataSource = new DigitalBiblePlatformDataSource(config.digitalBiblePlatform.apiKey, 'ASESLVO2DV', 'ASESLVN2DV');
/**
 * Setup our Telegram bot
 *
 * @type {Object}
 */
var TelegramBot = require('./lib/telegram-bot.js');
var telegramBot = new TelegramBot(dbpDataSource, config.telegram.botToken);
/**
 * Are we currently polling?
 *
 * @type {Boolean}
 */
var polling = false;
/**
 * Server Settings
 */
/**
 * parse the body of the passed parameters
 */
server.use(restify.bodyParser({ mapParams: true }));
/**
 * Handle the default errors
 * http://stackoverflow.com/a/26252941
 */
server.on('uncaughtException', function (req, res) {
  res.send(500, {"code":"InternalServerError", "message":"The server encountered an unexpected condition."});
});

/**
 * Routes
 */
/**
 * The Home Page
 */
server.get('/', function(req, res) {
  res.end('<html><body>Home</body></html>');
});
/**
 * Display the requested video
 */
server.get('/videos/:bookId/:chapterId/:verseId', function(req, res) {
  var url = config.serverDomain + '/videos/' + req.params.bookId + '/' + req.params.chapterId + '/' + req.params.verseId;
  dbpDataSource.findByIds(req.params.bookId, req.params.chapterId, req.params.verseId).then(function(results) {
    if (results.videos.length > 0) {
      var video = results.videos[0];
      var title = dbpDataSource.getVideoTitle(video, true);
      fs.readFile('./templates/video.html', 'utf8', function (err, data) {
        data = data.replace(/\{\{pageTitle\}\}/g, title);
        data = data.replace(/\{\{pageUrl\}\}/g, url);
        data = data.replace(/\{\{videoUrl\}\}/g, video.path);
        res.end(data);
      });
    } else {
      fs.readFile('./templates/video-not-found.html', 'utf8', function (err, data) {
        data = data.replace(/\{\{pageUrl\}\}/g, url);
        data = data.replace(/\{\{pageDescription\}\}/g, 'ASLBibleBot provides an easy way to retrieve Bible passages in American Sing Language.  Currently we support the Telegram app.');
        res.end(data);
      });
    }
  }, function() {
    fs.readFile('./templates/video-not-found.html', 'utf8', function (err, data) {
      data = data.replace(/\{\{pageUrl\}\}/g, url);
      data = data.replace(/\{\{pageDescription\}\}/g, 'ASLBibleBot provides an easy way to retrieve Bible passages in American Sing Language.  Currently we support the Telegram app.');
      res.end(data);
    });
  });
});
/**
 * Telegram Bot Web Hook
 */
server.post('/bots/telegram/:token', function(req, res) {
  if (req.params.token === config.telegram.webHookToken) {
    telegramBot.webHookUpdate(req.params);
    res.send(200, 'true');
  } else {
    res.send(403, { 'error': 'Forbidden. You are not allowed to access this url.' });
  }
});

server.listen(config.serverPort, function () {
  console.log('%s listening at %s', server.name, server.url);
});
/**
 * Start polling the bot servers
 */
if (process.env.NODE_ENV === 'production') {
  /**
   * Register webhooks
   */
  telegramBot.registerWebHook(config.serverDomain + '/bots/telegram/' + config.telegram.webHookToken);
} else {
  /**
   * Deregister webhooks
   */
  telegramBot.registerWebHook('');
  // setInterval(function(){
  //    if(!polling){
  //      polling = true;
  //      telegramBot.pollingUpdate().then(function() {
  //        console.log('Telegram Updated!');
  //        polling = false;
  //      });
  //    }
  // }, 3000);
}
