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
config.digitalBiblePlatform = {};
config.telegram.botToken = 'MY-TELEGRAM-BOT-TOKEN';
config.digitalBiblePlatform.apiKey = 'MY-DIGITAL-BIBLE-PLATFORM-API-KEY';

module.exports = config;
