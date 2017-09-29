/**
 * You will need to copy this file to config.js, and set the appropriate settings to get started.
 *
 */
var config = {};
/**
 * Do you want to poll Telegram, or user the server endpoits.
 * @type {Boolean}
 */
config.serverPort = 3030;
config.serverDomain = 'http://localhost:3030';
config.ssl = {};
/**
 * Path to SSL Files
 */
config.ssl.certificate = '';
config.ssl.privateKey = '';
config.telegram = {};
config.fb = {};
config.digitalBiblePlatform = {};
/**
 * A token to verify we are getting a request from telegram and not a hacker
 */
config.telegram.webHookToken = 'MY-TELEGRAM-WEBHOOK-TOKEN';
config.fb.webHookToken = 'MY-FACEBOOK-WEBHOOK-TOKEN';
config.telegram.botToken = 'MY-TELEGRAM-BOT-TOKEN';
config.fb.botToken = 'MY-FACEBOOK-BOT-TOKEN';
config.digitalBiblePlatform.apiKey = 'MY-DIGITAL-BIBLE-PLATFORM-API-KEY';

module.exports = config;
