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
 * The Restify Server
 *
 * @type {Object}
 */
var server = restify.createServer();
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
 * Telegram Bot Web Hook
 */
server.post('/bots/telegram', function(req, res) {
  console.log(req.params);
  res.end('<html><body>TELEGRAM</body></html>');
});

server.listen(config.serverPort, function () {
  console.log('%s listening at %s', server.name, server.url);
});
/**
 * Start polling the bot servers
 */
if (config.usePolling) {
  setInterval(function(){
     if(!polling){
       polling = true;
       telegramBot.update().then(function() {
         console.log('Telegram Updated!');
         polling = false;
       });
     }
  }, 3000);
} else {
  /**
   * Register webhooks
   */
  // telegramBot.registerWebHook(config.serverDomain + '/bots/telegram');
}
