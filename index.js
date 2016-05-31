/**
 * Get the Configuration settings
 *
 * @type {Object}
 */
var config = require('./config');
/**
 * Use the HTTP client for making requests
 *
 * @type {Object}
 */
var request = require('request');
/**
 * Library for handling promises
 *
 * @type {Object}
 */
var promise = require('promised-io/promise');
var Deferred = promise.Deferred;
/**
 * The Telegram API URL
 *
 * @type {String}
 */
var telegramURL = 'https://api.telegram.org/bot' + config.telegram.botToken;
/**
 * Are we currently polling?
 *
 * @type {Boolean}
 */
var polling = false;
/**
 * An array of update_ids that have been handled by our bot
 *
 * @type {Array}
 */
var handledUpdates = [];
/**
 * A welcome message to our bot
 *
 * @type {String}
 */
var welcomeMessage = 'Hello <b>{username}</b>,' +
'It is good to meet you!  I can help you find Bible passages in American Sign Language.  Are you ready to start?';
/**
 * Start polling the bot server
 */

setInterval(function(){
   if(!polling){
       polling = true;
       getUpdates().then(function(result) {
         polling = false;
       });
   }
}, 5000);
/**
 * Ask Telegram for an update
 *
 * @return {Void}
 * @access public
 */
function getUpdates() {
  return sendTelegramRequest('/getUpdates').then(function(content) {
    var promises = [];
    var updates = content.result;
    for (var i = 0; i < updates.length; i++) {
      var update = updates[i];
      var updateId = update.update_id;
      if ((update) && (handledUpdates.indexOf(updateId) == -1)) {
        var updatePromise = handleUpdate(update).then(function() {
          handledUpdates.push(updateId);
        });
        promises.push(updatePromise);
      }
    }
    return promise.all(promises);
  });
};
/**
 * Handle the update
 *
 * @param  {Object} update The JSON Object for the update
 * @return {Boolean}       Was it successful?
 * @access public
 */
function handleUpdate(update) {
  var deferred = new Deferred();
  var updateId = update.update_id;
  var message = update.message;
  if (message.text.match(/\/start/)) {
    /**
     * Send the welcome message
     */
    var options = {
      chat_id: message.chat.id,
      text: welcomeMessage.replace('{username}', message.from.username),
      parse_mode: 'HTML'
    };
    sendTelegramRequest('/sendMessage', options).then(function() {
      deferred.resolve(true);
    });
  } else {
    deferred.resolve(true);
  }
  return deferred.promise;
};
/**
 * Send a request to Telegram
 * @param  {String} method The method to send the request to
 * @param  {Object} params Parameters to pass to the request
 * @return {Object}        The returned JSON object
 * @access public
 */
function sendTelegramRequest(method, params) {
  params = (typeof params !== 'undefined') ? params : {};
  var deferred = new Deferred();
  request(
    {
      url: telegramURL+method,
      method: 'POST',
      json: true,
      headers: {
          'content-type': 'application/json',
      },
      body: params
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        deferred.resolve(body);
      } else {
        deferred.reject({});
      }
    }
  );
  return deferred.promise;
};
