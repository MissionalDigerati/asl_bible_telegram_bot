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
 * Get the underscore utility
 *
 * @type {Object}
 */
var _ = require('underscore');
/**
 * Library for handling promises
 *
 * @type {Object}
 */
var promise = require('promised-io/promise');
var Deferred = promise.Deferred;
/**
 * The Regex to capture the request data (ex. Genesis 1:1-2)
 *
 * @param  {[RegEx}
 * @access public
 */
var findRegEx = /(\d*)\s*([a-z\s]*)\s*(\d*)\s*\:*\s*(\d*)\s*\-*\s*(\d*)/i;

/**
 * A class that retrieves data from the Digital Bible Platform
 *
 * @param   {String}  apiKey              The Digital Bible Platform API key
 * @param   {String}  oldTestamentDamId   The Digital Asset Management ID for the Old Testament you want to use.
 * @param   {String}  newTestamentDamId   The Digital Asset Management ID for the New Testament you want to use.
 * @access public
 */
function DigitalBiblePlatformDataSource(apiKey, oldTestamentDamId, newTestamentDamId) {
  this.apiKey = apiKey;
  this.url = 'http://dbt.io/';
  this.videoUrl = 'http://video.dbt.io/';
  this.bookData = this.getBookData();
  this.oldTestamentDamId = oldTestamentDamId;
  this.newTestamentDamId = newTestamentDamId;
}

/**
 * Find the video objects in DBP based on the supplied request.
 *
 * @param  {String} request A String representing the location of the passage to look up.
 *
 * @return {Array}          An array of passages
 * @access public
 */
DigitalBiblePlatformDataSource.prototype.findVideos = function(data) {
  var deferred = new Deferred();
  var matches = data.match(findRegEx);
  var self = this;
  if (matches) {
    var params = {
      key: this.apiKey,
      encoding: 'mp4',
      v: 2
    };
    var book = matches[2].toLowerCase().trim();
    if (matches[1]) {
      book = matches[1].trim() + ' ' + book;
    }
    var bookDetails = _.find(
      this.bookData,
      function(b) {
        return _.indexOf(b.possibilities, book) !== -1;
      }
    );
    if (!bookDetails) {
      console.log('No Book Details found.');
      deferred.reject([]);
    } else {
      params.book_id = bookDetails.code;
      params.dam_id = bookDetails.testament == 'old' ? this.oldTestamentDamId : this.newTestamentDamId;
      var chapter = parseInt(matches[3].trim(), 10);
      if (chapter) {
        params.chapter_id = chapter;
      }
      var firstVerse = parseInt(matches[4].trim(), 10);
      if (firstVerse) {
        params.verse_id = firstVerse;
      }
      this.getRequest('video/videopath', params).then(function(results) {
        var videos = _.map(results, function(item) {
          item.book = bookDetails.title;
          item.path = self.videoUrl + item.path;
          return item;
        });
        deferred.resolve(videos);
      });
    }
  } else {
    deferred.reject([{}]);
  }

  return deferred.promise;
};
/**
 * Send a GET request to Digital Bible Platform
 *
 * @param  {Object} path    The path to request
 * @param  {Object} params  Parameters to pass to the request
 * @return {Object}         The returned JSON object
 * @access public
 */
DigitalBiblePlatformDataSource.prototype.getRequest = function(path, params) {
  params = (typeof params !== 'undefined') ? params : {};
  var deferred = new Deferred();
  request(
    {
      url: this.url+path,
      method: 'GET',
      qs: params,
      json: true
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
/**
 * Retrieve all the data to determine the current book
 *
 * @return {Array} An array of book information
 * @access public
 */
DigitalBiblePlatformDataSource.prototype.getBookData = function() {
  return [
    {
      'title': 'Genesis',
      'code': 'Gen',
      'testament': 'old',
      'possibilities': [
        'genesis',
        'gen',
        'gen.'
      ]
    },
    {
      'title': 'Exodus',
      'code': 'Exod',
      'testament': 'old',
      'possibilities': [
        'exodus',
        'exo',
        'exo.'
      ]
    },
    {
      'title': 'Leviticus',
      'code': 'Lev',
      'testament': 'old',
      'possibilities': [
        'leviticus',
        'lev',
        'lev.'
      ]
    },
    {
      'title': 'Numbers',
      'code': 'Num',
      'testament': 'old',
      'possibilities': [
        'numbers',
        'num',
        'num.'
      ]
    },
    {
      'title': 'Deuteronomy',
      'code': 'Deut',
      'testament': 'old',
      'possibilities': [
        'deuteronomy',
        'deu',
        'deu.'
      ]
    },
    {
      'title': 'Joshua',
      'code': 'Josh',
      'testament': 'old',
      'possibilities': [
        'joshua',
        'jos',
        'jos.'
      ]
    },
    {
      'title': 'Judges',
      'code': 'Judg',
      'testament': 'old',
      'possibilities': [
        'judges',
        'judge',
        'jdg',
        'jdg.'
      ]
    },
    {
      'title': 'Ruth',
      'code': 'Ruth',
      'testament': 'old',
      'possibilities': [
        'ruth',
        'rut',
        'rut.'
      ]
    },
    {
      'title': '1 Samuel',
      'code': '1Sam',
      'testament': 'old',
      'possibilities': [
        '1 samuel',
        '1samuel',
        '1-samuel',
        '1sa',
        '1sa.'
      ]
    },
    {
      'title': '2 Samuel',
      'code': '2Sam',
      'testament': 'old',
      'possibilities': [
        '2 samuel',
        '2samuel',
        '2-samuel',
        '2sa',
        '2sa.'
      ]
    },
    {
      'title': '1 Kings',
      'code': '1Kgs',
      'testament': 'old',
      'possibilities': [
        '1 kings',
        '1kings',
        '1-kings',
        '1ki',
        '1ki.'
      ]
    },
    {
      'title': '2 Kings',
      'code': '2Kgs',
      'testament': 'old',
      'possibilities': [
        '2 kings',
        '2kings',
        '2-kings',
        '2ki',
        '2ki.'
      ]
    },
    {
      'title': '1 Chronicles',
      'code': '1Chr',
      'testament': 'old',
      'possibilities': [
        '1 chronicles',
        '1chronicles',
        '1-chronicles',
        '1ch',
        '1ch.'
      ]
    },
    {
      'title': '2 Chronicles',
      'code': '2Chr',
      'testament': 'old',
      'possibilities': [
        '2 chronicles',
        '2chronicles',
        '2-chronicles',
        '2ch',
        '2ch.'
      ]
    },
    {
      'title': 'Ezra',
      'code': 'Ezra',
      'testament': 'old',
      'possibilities': [
        'ezra',
        'ezr',
        'ezr.'
      ]
    },
    {
      'title': 'Nehemiah',
      'code': 'Neh',
      'testament': 'old',
      'possibilities': [
        'nehemiah',
        'neh',
        'neh.'
      ]
    },
    {
      'title': 'Esther',
      'code': 'Esth',
      'testament': 'old',
      'possibilities': [
        'esther',
        'est',
        'est.'
      ]
    },
    {
      'title': 'Job',
      'code': 'Job',
      'testament': 'old',
      'possibilities': [
        'job',
        'job',
        'job.'
      ]
    },
    {
      'title': 'Psalms',
      'code': 'Ps',
      'testament': 'old',
      'possibilities': [
        'psalms',
        'psalm',
        'book of psalms',
        'psa',
        'psa.'
      ]
    },
    {
      'title': 'Proverbs',
      'code': 'Prov',
      'testament': 'old',
      'possibilities': [
        'proverbs',
        'proverb',
        'pro',
        'pro.'
      ]
    },
    {
      'title': 'Ecclesiastes',
      'code': 'Eccl',
      'testament': 'old',
      'possibilities': [
        'ecclesiastes',
        'ecclesiaste',
        'ecc',
        'ecc.'
      ]
    },
    {
      'title': 'The Song of Solomon',
      'code': 'Song',
      'testament': 'old',
      'possibilities': [
        'the song of solomon',
        'song of solomon',
        'song of songs',
        'song',
        'solomon',
        'sng.'
      ]
    },
    {
      'title': 'Isaiah',
      'code': 'Isa',
      'testament': 'old',
      'possibilities': [
        'isaiah',
        'isa',
        'isa.'
      ]
    },
    {
      'title': 'Jeremiah',
      'code': 'Jer',
      'testament': 'old',
      'possibilities': [
        'jeremiah',
        'jer',
        'jer.'
      ]
    },
    {
      'title': 'Lamentations',
      'code': 'Lam',
      'testament': 'old',
      'possibilities': [
        'lamentations',
        'lamentation',
        'lam',
        'lam.'
      ]
    },
    {
      'title': 'Ezekiel',
      'code': 'Ezek',
      'testament': 'old',
      'possibilities': [
        'ezekiel',
        'ezk',
        'ezk.'
      ]
    },
    {
      'title': 'Daniel',
      'code': 'Dan',
      'testament': 'old',
      'possibilities': [
        'daniel',
        'dan',
        'dan.'
      ]
    },
    {
      'title': 'Hosea',
      'code': 'Hos',
      'testament': 'old',
      'possibilities': [
        'hosea',
        'hos',
        'hos.'
      ]
    },
    {
      'title': 'Joel',
      'code': 'Joel',
      'testament': 'old',
      'possibilities': [
        'joel',
        'jol',
        'jol.'
      ]
    },
    {
      'title': 'Amos',
      'code': 'Amos',
      'testament': 'old',
      'possibilities': [
        'amos',
        'amo',
        'amo.'
      ]
    },
    {
      'title': 'Obadiah',
      'code': 'Obad',
      'testament': 'old',
      'possibilities': [
        'obadiah',
        'oba',
        'oba.'
      ]
    },
    {
      'title': 'Jonah',
      'code': 'Jonah',
      'testament': 'old',
      'possibilities': [
        'jonah',
        'jon',
        'jon.'
      ]
    },
    {
      'title': 'Micah',
      'code': 'Mic',
      'testament': 'old',
      'possibilities': [
        'micah',
        'mic',
        'mic.'
      ]
    },
    {
      'title': 'Nahum',
      'code': 'Nah',
      'testament': 'old',
      'possibilities': [
        'nahum',
        'nam',
        'nam.'
      ]
    },
    {
      'title': 'Habakkuk',
      'code': 'Hab',
      'testament': 'old',
      'possibilities': [
        'habakkuk',
        'hab',
        'hab.'
      ]
    },
    {
      'title': 'Zephaniah',
      'code': 'Zeph',
      'testament': 'old',
      'possibilities': [
        'zephaniah',
        'zep',
        'zep.'
      ]
    },
    {
      'title': 'Haggai',
      'code': 'Hag',
      'testament': 'old',
      'possibilities': [
        'haggai',
        'hag',
        'hag.'
      ]
    },
    {
      'title': 'Zechariah',
      'code': 'Zech',
      'testament': 'old',
      'possibilities': [
        'zechariah',
        'zec',
        'zec.'
      ]
    },
    {
      'title': 'Malachi',
      'code': 'Mal',
      'testament': 'old',
      'possibilities': [
        'malachi',
        'mal',
        'mal.'
      ]
    },
    {
      'title': 'Matthew',
      'code': 'Matt',
      'testament': 'new',
      'possibilities': [
        'matthew',
        'matt',
        'mat',
        'mat.'
      ]
    },
    {
      'title': 'Mark',
      'code': 'Mark',
      'testament': 'new',
      'possibilities': [
        'mark',
        'mrk',
        'mrk.'
      ]
    },
    {
      'title': 'Luke',
      'code': 'Luke',
      'testament': 'new',
      'possibilities': [
        'luke',
        'luk',
        'luk.'
      ]
    },
    {
      'title': 'John',
      'code': 'John',
      'testament': 'new',
      'possibilities': [
        'john',
        'jhn',
        'jhn.'
      ]
    },
    {
      'title': 'Acts',
      'code': 'Acts',
      'testament': 'new',
      'possibilities': [
        'acts',
        'act',
        'act.'
      ]
    },
    {
      'title': 'Romans',
      'code': 'Rom',
      'testament': 'new',
      'possibilities': [
        'romans',
        'rom',
        'rom.'
      ]
    },
    {
      'title': '1 Corinthians',
      'code': '1Cor',
      'testament': 'new',
      'possibilities': [
        '1 corinthians',
        '1corinthians',
        '1-corinthians',
        '1 corinthian',
        '1corinthian',
        '1-corinthian',
        '1co',
        '1co.'
      ]
    },
    {
      'title': '2 Corinthians',
      'code': '2Cor',
      'testament': 'new',
      'possibilities': [
        '2 corinthians',
        '2corinthians',
        '2-corinthians',
        '2 corinthian',
        '2corinthian',
        '2-corinthian',
        '2co',
        '2co.'
      ]
    },
    {
      'title': 'Galatians',
      'code': 'Gal',
      'testament': 'new',
      'possibilities': [
        'galatians',
        'galatian',
        'gal',
        'gal.'
      ]
    },
    {
      'title': 'Ephesians',
      'code': 'Eph',
      'testament': 'new',
      'possibilities': [
        'ephesians',
        'ephesian',
        'eph',
        'eph.'
      ]
    },
    {
      'title': 'Philippians',
      'code': 'Phil',
      'testament': 'new',
      'possibilities': [
        'philippians',
        'phillipians',
        'phillippians',
        'philippian',
        'phillipian',
        'phillippan',
        'php',
        'php.'
      ]
    },
    {
      'title': 'Colossians',
      'code': 'Col',
      'testament': 'new',
      'possibilities': [
        'colossians',
        'colossian',
        'col',
        'col.'
      ]
    },
    {
      'title': '1 Thessalonians',
      'code': '1Thess',
      'testament': 'new',
      'possibilities': [
        '1 thessalonians',
        '1thessalonians',
        '1-thessalonians',
        '1 thessalonian',
        '1thessalonian',
        '1-thessalonian',
        '1th',
        '1th.'
      ]
    },
    {
      'title': '2 Thessalonians',
      'code': '2Thess',
      'testament': 'new',
      'possibilities': [
        '2 thessalonians',
        '2thessalonians',
        '2-thessalonians',
        '2 thessalonian',
        '2thessalonian',
        '2-thessalonian',
        '2th',
        '2th.'
      ]
    },
    {
      'title': '1 Timothy',
      'code': '1Tim',
      'testament': 'new',
      'possibilities': [
        '1 timothy',
        '1timothy',
        '1-timothy',
        '1ti',
        '1ti.'
      ]
    },
    {
      'title': '2 timothy',
      'code': '2Tim',
      'testament': 'new',
      'possibilities': [
        '2 timothy',
        '2timothy',
        '2-timothy',
        '2ti',
        '2ti.'
      ]
    },
    {
      'title': 'Titus',
      'code': 'Titus',
      'testament': 'new',
      'possibilities': [
        'titus',
        'tit',
        'tit.'
      ]
    },
    {
      'title': 'Philemon',
      'code': 'Phlm',
      'testament': 'new',
      'possibilities': [
        'philemon',
        'phm',
        'phm.'
      ]
    },
    {
      'title': 'Hebrews',
      'code': 'Heb',
      'testament': 'new',
      'possibilities': [
        'hebrews',
        'heb',
        'heb.'
      ]
    },
    {
      'title': 'James',
      'code': 'Jas',
      'testament': 'new',
      'possibilities': [
        'james',
        'jame',
        'jas',
        'jas.'
      ]
    },
    {
      'title': '1 Peter',
      'code': '1Pet',
      'testament': 'new',
      'possibilities': [
        '1 peter',
        '1peter',
        '1-peter',
        '1pe',
        '1pe.'
      ]
    },
    {
      'title': '2 Peter',
      'code': '2Pet',
      'testament': 'new',
      'possibilities': [
        '2 peter',
        '2peter',
        '2-peter',
        '2pe',
        '2pe.'
      ]
    },
    {
      'title': '1 John',
      'code': '1John',
      'testament': 'new',
      'possibilities': [
        '1 john',
        '1john',
        '1-john',
        '1jn',
        '1jn.'
      ]
    },
    {
      'title': '2 John',
      'code': '2John',
      'testament': 'new',
      'possibilities': [
        '2 john',
        '2john',
        '2-john',
        '2jn',
        '2jn.'
      ]
    },
    {
      'title': '3 John',
      'code': '3John',
      'testament': 'new',
      'possibilities': [
        '3 john',
        '3john',
        '3-john',
        '3jn',
        '3jn.'
      ]
    },
    {
      'title': 'Jude',
      'code': 'Jude',
      'testament': 'new',
      'possibilities': [
        'jude',
        'jud',
        'jud.'
      ]
    },
    {
      'title': 'Revelation',
      'code': 'Rev',
      'testament': 'new',
      'possibilities': [
        'revelation',
        'revelations',
        'book of revelation',
        'book of revelations',
        'rev',
        'rev.'
      ]
    }
  ];
};

module.exports = DigitalBiblePlatformDataSource;
