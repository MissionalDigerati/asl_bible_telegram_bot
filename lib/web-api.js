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
  * Library for handling promises
  *
  * @type {Object}
  */
 var promise = require('promised-io/promise');
 var Deferred = promise.Deferred;
 /**
  * The Bible regex for seeing if a passage was sent.
  *
  * @type {Regex}
  */
 var bibleRegex = require('./bible-regex').bibleRegex;
 /**
  * An API for retrieving data
  *
  * @access public
  */
  function WebAPI(dataSource) {
    this.dataSource = dataSource;
  }
  /**
   * Search for a specific term
   *
   * @param  {String} query   The search query to search for
   * @return {Object}         A JSON object of the found data, with key of whether book is available
   */
  WebAPI.prototype.search = function(query) {
    var deferred = new Deferred();
    var scriptureMatch = query.match(bibleRegex);
    var passageQuery = '';
    if (scriptureMatch) {
      passageQuery = scriptureMatch[0];
    } else {
      var details = this.dataSource.findBookDetails(query.toLowerCase());
      if (details) {
        passageQuery = details.title;
      }
    }
    if (passageQuery !== '') {
      var self = this;
      this.dataSource.findVideos(passageQuery).then(function(results) {
        var videos = [];
        for (var i = 0; i < results.videos.length; i++) {
          var video = results.videos[i];
          var title = self.dataSource.getVideoTitle(video, false);
          videos.push({
            bookId: video.book_id,
            bookName: self.capitalize(video.book),
            chapterStart: video.chapter_start,
            chapterEnd: video.chapter_end,
            verseStart: video.verse_start,
            verseEnd: video.verse_end,
            fullPassage: self.capitalize(title),
            title: self.capitalize(video.title),
            url: video.path
          });
        }
        deferred.resolve({results: videos, available: results.available, validMatch: true});
      });
    } else {
      deferred.resolve({results: [], available: false, validMatch: false});
    }

    return deferred.promise;
  };
  /**
   * Capitalize Words in a string
   *
   * @param  {String} str The sentence to capitalize
   * @return {String}     The capitalized string
   *
   * @link https://stackoverflow.com/a/4878800
   */
  WebAPI.prototype.capitalize = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
  module.exports = WebAPI;
