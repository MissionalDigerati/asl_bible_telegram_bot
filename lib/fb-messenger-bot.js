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
 * Use the Utilities library from Underscore
 *
 * @type {Object}
 */
var _ = require('underscore');
/**
 * The Bible regex for seeing if a passage was sent.
 *
 * @type {Regex}
 */
var bibleRegex = require('./bible-regex').bibleRegex;
/**
 * A bot that interacts with Facebook Messenger
 *
 * @access public
 */
function FBMessengerBot(dataSource, botToken) {
  this.dataSource = dataSource;
  this.url = 'https://graph.facebook.com/v2.6/me/';
  this.pageAccessToken = botToken;
  // epoch time in milliseconds
  this.lastUpdated = (new Date()).getTime();
  this.lastInlineQueriesHandled = [];
}
/**
 * send a Web Hook update to process
 *
 * @param  {Object} update The updates to process
 * @return {Void}
 * @access public
 */
FBMessengerBot.prototype.webHookUpdate = function(updates) {
  return this.processUpdates(updates);
};
/**
 * Process all the incoming updates
 *
 * @param  {Array}  updates An array of updates sent by telegram
 * @return {Void}
 * @access public
 */
FBMessengerBot.prototype.processUpdates = function(updates) {
  var deferred = new Deferred();
  var self = this;
  var updateTimestamps = [];
  var promises = [];
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    if (update) {
      if ((_.has(update, 'messaging')) && (update.messaging[0].timestamp > this.lastUpdated)) {
        updateTimestamps.push(update.messaging[0].timestamp);
        promises.push(this.handleRequest(update));
      }
    }
  }
  if (promises.length > 0) {
    promise.all(promises).then(function() {
      if (updateTimestamps.length > 0) {
        self.lastUpdated = Math.max.apply(Math, updateTimestamps);
      }
      deferred.resolve(true);
    });
  } else {
    deferred.resolve(true);
  }
  return deferred.promise;
};
/**
 * Handle the update request
 *
 * @param  {Object} update The JSON Object for the update
 * @return {Boolean}       Was it successful?
 * @access public
 */
FBMessengerBot.prototype.handleRequest = function(update) {
  var deferred = new Deferred();
  var self = this;
  if ((!_.has(update, 'messaging')) || (update.messaging === '')) {
    deferred.resolve(true);
  } else {
    var options = {
      recipient: {
        id: update.messaging[0].sender.id
      },
      sender_action: 'typing_on'
    };
    var message = update.messaging[0].message;
    var scriptureMatch = message.text.match(bibleRegex);
    if (scriptureMatch) {
      this.sendRequest('messages', options).then(function() {
        self.runPassageSearch(update.messaging[0], scriptureMatch[0]).then(function() {
          deferred.resolve(true);
        });
      });
    } else {
      deferred.resolve(true);
    }
  }
  return deferred.promise;
};
/**
 * Run a passage search and handle it
 *
 * @param  {Object}   messaging   The JSON Object for the messaging from FB
 * @param  {String}   passage     The passage to search for
 * @return {Boolean}              Was it successful?
 * @access public
 */
FBMessengerBot.prototype.runPassageSearch = function(messaging, passage) {
  var deferred = new Deferred();
  var self = this;
  var options = {
    recipient: {
      id: messaging.sender.id
    }
  };
  this.dataSource.findVideos(passage).then(function(result) {
    var videos = result.videos;
    if (videos.length == 1) {
      var title = self.dataSource.getVideoTitle(videos[0], true);
      var messageOptions = _(options).clone();
      options.message = {
        attachment: {
          type: 'video',
          payload: {
            url: videos[0].path
          }
        }
      };
      messageOptions.message = {
        text: title+'\u000A\u000A"Provided by the Deaf Bible Society, Deaf Missions & Faith Comes by Hearing."'
      }
      self.sendRequest('messages', options).then(function() {
        self.sendRequest('messages', messageOptions);
        deferred.resolve(true);
      });
    }
  });
  return deferred.promise;
};
/**
 * Send a request to Facebook
 *
 * @param  {String} method The method to send the request to
 * @param  {Object} params Parameters to pass to the request
 * @return {Object}        The returned JSON object
 * @access public
 */
FBMessengerBot.prototype.sendRequest = function(method, params) {
  params = (typeof params !== 'undefined') ? params : {};
  var deferred = new Deferred();
  request(
    {
      url: this.url+method+'?access_token='+this.pageAccessToken,
      method: 'POST',
      json: true,
      headers: {
          'content-type': 'application/json',
      },
      body: params
    },
    function (error, response, body) {
      console.log(error);
      if (!error && response.statusCode == 200) {
        deferred.resolve(body);
      } else {
        console.log(body);
        deferred.resolve({});
      }
    }
  );
  return deferred.promise;
};
module.exports = FBMessengerBot;
