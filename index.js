'use strict';
/**
 * Get the Configuration settings
 *
 * @type {Object}
 */
var config = require('./config');
/**
 * Setup our Telegram bot
 *
 * @type {Object}
 */
var TelegramBot = require('./lib/telegram-bot.js');
var telegramBot = new TelegramBot(config.telegram.botToken);
/**
 * Are we currently polling?
 *
 * @type {Boolean}
 */
var polling = false;
/**
 * Start polling the bot server
 */
setInterval(function(){
   if(!polling){
     polling = true;
     telegramBot.update().then(function() {
       polling = false;
     });
   }
}, 5000);
