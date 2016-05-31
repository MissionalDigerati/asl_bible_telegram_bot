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
 * A class that retrieves data from the Digital Bible Platform
 *
 * @access public
 */
function DigitalBiblePlatformDataSource(apiKey) {
  this.apiKey = apiKey;
}

/**
 * Find the objects in DBP based on the supplied request
 *
 * @param  {String} request A String representing the location of the passage to look up.
 *
 * @return {Array}          An array of passages
 * @access public
 */
DigitalBiblePlatformDataSource.prototype.find = function(request) {
  var deferred = new Deferred();

  console.log(request);

  deferred.resolve([{}]);

  return deferred.promise;
};

module.exports = DigitalBiblePlatformDataSource;
