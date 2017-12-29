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
 * Setup our FaceBook Messenger bot
 *
 * @type {Object}
 */
var FBMessengerBot = require('./lib/fb-messenger-bot.js');
var fbMessengerBot = new FBMessengerBot(dbpDataSource, config.fb.botToken);
/**
 * Setup our WebAPI
 *
 * @type {Object}
 */
var WebAPI = require('./lib/web-api.js');
var webAPI = new WebAPI(dbpDataSource);
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
 * parse the body of the passed parameters
 */
server.use(restify.queryParser({ mapParams: true }));
/**
 * Enable Cors
 */
server.use(restify.CORS(
  {
    origins: ['*'],
    credentials: false,
    headers: []
  }
));
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
server.get('/', restify.serveStatic({
  directory: './static',
  file: 'home.html'
}));
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
/**
 * FB Messenger Bot Web Hooks
 * GET: Register the web hook
 * POST: Receive messages
 */
server.get('/bots/fb', function(req, res) {
  if (req.params.hub.mode === 'subscribe' && req.params.hub.verify_token === config.fb.webHookToken) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(req.params.hub.challenge);
  } else {
    res.send(403, { 'error': 'Forbidden. You are not allowed to access this url.' });
  }
});
server.post('/bots/fb', function(req, res) {
  var data = req.body;
  if (data.object === 'page') {
    fbMessengerBot.webHookUpdate(data.entry);
    res.send(200, '');
  } else {
    res.send(403, { 'error': 'Forbidden. You are passing an unsupported webhook.' });
  }
});
/**
 * Web API Web Hooks
 */
server.get('/api/search', function(req, res) {
  if (req.params.token !== config.api.apiToken) {
    res.send(403, { 'error': 'Forbidden. You are not allowed to access this url.' });
  } else if ((!req.params.query) || (req.params.query === '')) {
    res.send(400, { 'error': 'Bad Request. You are missing the query parameter.' });
  } else {
    webAPI.search(req.params.query).then(function(data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/javascript');
      res.end(JSON.stringify({results: data}));
    });
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
  // telegramBot.registerWebHook('');
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
