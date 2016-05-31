'use strict';
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
 * A bot that interacts with Telegram
 *
 * @access public
 */
function TelegramBot(botToken) {
  this.url = 'https://api.telegram.org/bot' + botToken;
  this.lastUpdated = Math.round((new Date()).getTime() / 1000);
}

/**
 * Ask Telegram for an update
 *
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.update = function () {
  var updateTimestamps = [];
  var self = this;
  return this.sendRequest('/getUpdates').then(
    function(content) {
      var promises = [];
      var updates = content.result;
      for (var i = 0; i < updates.length; i++) {
        var update = updates[i].message;
        if ((update) && (update.date > self.lastUpdated)) {
          updateTimestamps.push(update.date);
          promises.push(self.handleUpdate(update));
        }
      }
      return promise.all(promises).then(function() {
        if (updateTimestamps.length > 0) {
          self.lastUpdated = Math.max.apply(Math, updateTimestamps);
        }
      });
    }
  );
};

/**
 * Handle the update
 *
 * @param  {Object} update The JSON Object for the update
 * @return {Boolean}       Was it successful?
 * @access public
 */
TelegramBot.prototype.handleUpdate = function(update) {
  var deferred = new Deferred();
  if (update.text.match(/\/start/)) {
    this.runCommandStart(update).then(function() {
      deferred.resolve(true);
    });
  } else {
    deferred.resolve(true);
  }
  return deferred.promise;
};
/**
 * Handle the /start command
 *
 * @param  {Object} update The update data passed from Telegram
 * @return {Void}
 *
 * @access public
 */
TelegramBot.prototype.runCommandStart =  function(update) {
  var options = {
    chat_id: update.chat.id,
    parse_mode: 'HTML',
    text: 'Hello <b>' + update.from.username +'</b>!  It is good to meet you!  ' +
    'I can help you find Bible passages in American Sign Language.  Are you ready to start?'
  };

  return this.sendRequest('/sendMessage', options);
};
/**
 * Send a request to Telegram
 *
 * @param  {String} method The method to send the request to
 * @param  {Object} params Parameters to pass to the request
 * @return {Object}        The returned JSON object
 * @access public
 */
TelegramBot.prototype.sendRequest = function(method, params) {
  params = (typeof params !== 'undefined') ? params : {};
  var deferred = new Deferred();
  request(
    {
      url: this.url+method,
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

module.exports = TelegramBot;
