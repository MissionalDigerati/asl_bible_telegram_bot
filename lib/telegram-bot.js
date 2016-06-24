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
 * This Regex helps find Bible Passages in a verse.
 * Thanks to ESV cross ref script for the Regex. (http://www.esv.org/resources/esv-crossref/)
 *
 */
var matchBibleReferenceRegex = /\b((?:(?:(?:Second|First|Scnd|Frst|Sec|Fst|2nd|1st|Se|Sc|II|I|2|1) ?(?:Thessalonions|Thessalonians|Corinthians|Corinthian|Chronicles|Chronicle|Corinthi|Chronicl|Timothy|Thessal|Corinth|Chronic|Timoth|Samuel|Chroni|Thess|Peter|Kings|Cortn|Corth|Corin|Chron|Thes|Petr|Pete|King|John|Cori|Chrs|Chro|Tim|Sam|Ptr|Pet|Kgs|Joh|Jhn|Cor|Chs|Chr|Tm|Ti|Th|Sm|Sa|Pt|Pe|Ks|Kn|Ki|Kg|Jo|Jn|Jn|Co|Ch|P|K|J))|(?:(?:Second|First|Scnd|Frst|Sec|Fst|2nd|1st|Se|Sc|II|I|2|1)(?:S))|(?:(?:Third|Thir|Thi|III|3rd|Th|3) ?(?:John|Joh|Jhn|Jo|Jn|Jn|J))|Canticle of Canticles|The Song of Solomon|The Song of Sol|Song of Solomon|The Revelation|Thessalonions|Thessalonians|Song of Songs|Phillippians|Lamentations|Ecclesiastes|Song of Sol|Revelations|Phillipians|Philippians|Lamentation|Eclesiastes|Ecclesiaste|Dueteronomy|Deuteronomy|Corinthians|Zecharaiah|Revelation|Philipians|Corinthian|Colossians|Chronicles|Zephaniah|Zechariah|Zachariah|Phillemon|Leviticus|Habbakkuk|Galations|Galatians|Ephesians|Colossian|Colosians|Chronicle|Canticles|Qoheleth|Proverbs|Philemon|Obadaiah|Nehemiah|Jeremiah|Jeremaih|Habbakuk|Habakkuk|Galatian|Ephesian|Corinthi|Chronicl|Timothy|Thessal|Song of|Solomon|Proverb|Philipp|Obadiah|Obadaih|Numbers|Matthew|Malachi|Hebrews|Habakuk|Genesis|Ezekiel|Corinth|Chronic|Timoth|Samuel|Romans|Psalms|Philip|Philem|Number|Mathew|Judges|Joshua|Isaiah|Hebrew|Haggia|Haggai|Exodus|Esther|Eccles|Daniel|Chroni|Titus|Thess|Roman|Psalm|Prvbs|Phile|Peter|Nahum|Micah|Kings|Juges|Judgs|Jonah|James|Hosea|Hagai|Galat|Ephes|Cortn|Corth|Corin|Chron|Zeph|Zech|Thes|Song|Ruth|Pslm|Prov|Phil|Petr|Pete|Obad|Numb|Mica|Matt|Mark|Luke|Levi|King|Judg|Jude|Josh|John|John|Joel|Jere|Jdgs|Jame|Isai|Isah|Hagg|Ezra|Ezek|Exod|Esth|Ephs|Ephe|Ecll|Eccl|Deut|Cori|Chrs|Chro|Amos|Acts|Zep|Zec|Tit|Tim|Son|Sng|Sam|SOS|Rth|Rom|Rev|Qoh|Ptr|Pss|Psm|Psa|Prv|Pro|Php|Phm|Phl|Phi|Pet|Obd|Oba|Num|Neh|Nah|Mrk|Mic|Mat|Mar|Mal|Luk|Lev|Lam|Kgs|Jud|Jsh|Jos|Jon|Joh|Joh|Joe|Job|Jnh|Jms|Jhn|Jhn|Jer|Jdg|Jas|Jam|Isa|Hos|Heb|Hbk|Hag|Hab|Gen|Gal|Ezr|Ezk|Eze|Exo|Exd|Est|Eph|Ecl|Ecc|Deu|Dan|Cor|Col|Col|Chs|Chr|Ams|Amo|Act|Zp|Zc|Tt|Tm|Ti|Th|So|Sm|Sg|Sa|SS|Rv|Ru|Rt|Ro|Rm|Rh|Re|Qo|Pt|Ps|Pr|Pp|Pm|Ph|Pe|Ob|Nu|Nm|Ne|Nb|Na|Mt|Mr|Ml|Mk|Mi|Ma|Lv|Lu|Lm|Lk|Le|La|Ks|Kn|Ki|Kg|Ju|Js|Jr|Jo|Jn|Jn|Jn|Jn|Jm|Jl|Jg|Je|Jd|Jb|Ja|Is|Hs|Ho|Hk|Hg|He|Hb|Gn|Gl|Ge|Ga|Ez|Ex|Es|Ep|Ec|Du|Dt|Dn|De|Da|Cs|Co|Co|Cl|Ch|Am|Ac|Q|P|K|J|J)\.? ?(?:(?:\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b(?:[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)?)|\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)(?:[,;]? ?(?:(?:\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b(?:[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)?)|\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b))*(?:[-\u2010\u2011\u2012\u2013\u2014\u2015] ?(?:(?:(?:(?:Second|First|Scnd|Frst|Sec|Fst|2nd|1st|Se|Sc|II|I|2|1) ?(?:Thessalonions|Thessalonians|Corinthians|Corinthian|Chronicles|Chronicle|Corinthi|Chronicl|Timothy|Thessal|Corinth|Chronic|Timoth|Samuel|Chroni|Thess|Peter|Kings|Cortn|Corth|Corin|Chron|Thes|Petr|Pete|King|John|Cori|Chrs|Chro|Tim|Sam|Ptr|Pet|Kgs|Joh|Jhn|Cor|Chs|Chr|Tm|Ti|Th|Sm|Sa|Pt|Pe|Ks|Kn|Ki|Kg|Jo|Jn|Jn|Co|Ch|P|K|J))|(?:(?:Second|First|Scnd|Frst|Sec|Fst|2nd|1st|Se|Sc|II|I|2|1)(?:S))|(?:(?:Third|Thir|Thi|III|3rd|Th|3) ?(?:John|Joh|Jhn|Jo|Jn|Jn|J))|Canticle of Canticles|The Song of Solomon|The Song of Sol|Song of Solomon|The Revelation|Thessalonions|Thessalonians|Song of Songs|Phillippians|Lamentations|Ecclesiastes|Song of Sol|Revelations|Phillipians|Philippians|Lamentation|Eclesiastes|Ecclesiaste|Dueteronomy|Deuteronomy|Corinthians|Zecharaiah|Revelation|Philipians|Corinthian|Colossians|Chronicles|Zephaniah|Zechariah|Zachariah|Phillemon|Leviticus|Habbakkuk|Galations|Galatians|Ephesians|Colossian|Colosians|Chronicle|Canticles|Qoheleth|Proverbs|Philemon|Obadaiah|Nehemiah|Jeremiah|Jeremaih|Habbakuk|Habakkuk|Galatian|Ephesian|Corinthi|Chronicl|Timothy|Thessal|Song of|Solomon|Proverb|Philipp|Obadiah|Obadaih|Numbers|Matthew|Malachi|Hebrews|Habakuk|Genesis|Ezekiel|Corinth|Chronic|Timoth|Samuel|Romans|Psalms|Philip|Philem|Number|Mathew|Judges|Joshua|Isaiah|Hebrew|Haggia|Haggai|Exodus|Esther|Eccles|Daniel|Chroni|Titus|Thess|Roman|Psalm|Prvbs|Phile|Peter|Nahum|Micah|Kings|Juges|Judgs|Jonah|James|Hosea|Hagai|Galat|Ephes|Cortn|Corth|Corin|Chron|Zeph|Zech|Thes|Song|Ruth|Pslm|Prov|Phil|Petr|Pete|Obad|Numb|Mica|Matt|Mark|Luke|Levi|King|Judg|Jude|Josh|John|John|Joel|Jere|Jdgs|Jame|Isai|Isah|Hagg|Ezra|Ezek|Exod|Esth|Ephs|Ephe|Ecll|Eccl|Deut|Cori|Chrs|Chro|Amos|Acts|Zep|Zec|Tit|Tim|Son|Sng|Sam|SOS|Rth|Rom|Rev|Qoh|Ptr|Pss|Psm|Psa|Prv|Pro|Php|Phm|Phl|Phi|Pet|Obd|Oba|Num|Neh|Nah|Mrk|Mic|Mat|Mar|Mal|Luk|Lev|Lam|Kgs|Jud|Jsh|Jos|Jon|Joh|Joh|Joe|Job|Jnh|Jms|Jhn|Jhn|Jer|Jdg|Jas|Jam|Isa|Hos|Heb|Hbk|Hag|Hab|Gen|Gal|Ezr|Ezk|Eze|Exo|Exd|Est|Eph|Ecl|Ecc|Deu|Dan|Cor|Col|Col|Chs|Chr|Ams|Amo|Act|Zp|Zc|Tt|Tm|Ti|Th|So|Sm|Sg|Sa|SS|Rv|Ru|Rt|Ro|Rm|Rh|Re|Qo|Pt|Ps|Pr|Pp|Pm|Ph|Pe|Ob|Nu|Nm|Ne|Nb|Na|Mt|Mr|Ml|Mk|Mi|Ma|Lv|Lu|Lm|Lk|Le|La|Ks|Kn|Ki|Kg|Ju|Js|Jr|Jo|Jn|Jn|Jn|Jn|Jm|Jl|Jg|Je|Jd|Jb|Ja|Is|Hs|Ho|Hk|Hg|He|Hb|Gn|Gl|Ge|Ga|Ez|Ex|Es|Ep|Ec|Du|Dt|Dn|De|Da|Cs|Co|Co|Cl|Ch|Am|Ac|Q|P|K|J|J)\.? ?)(?:(?:\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b(?:[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)?)|\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)(?:[,;]? ?(?:(?:\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b(?:[:\.]\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b)?)|\b(?:\b\d{1,3}\b(?:[-\u2010\u2011\u2012\u2013\u2014\u2015]\b\d{1,3}\b)?(?![-\u2010\u2011\u2012\u2013\u2014\u2015]\d)){1,3}\b))*)*)\b(?![^<]*<\/a>)/i
/**
 * A bot that interacts with Telegram
 *
 * @access public
 */
function TelegramBot(dataSource, botToken) {
  this.dataSource = dataSource;
  this.url = 'https://api.telegram.org/bot' + botToken;
  this.lastUpdated = Math.round((new Date()).getTime() / 1000);
  this.lastInlineQueriesHandled = [];
}
/**
 * Register a web hook to receive updates
 *
 * @param  {String} url      The URL that will be used for the web hook (Must be HTTPS)
 * @param  {String} certPath Absolute path to your public key certificate
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.registerWebHook = function (url) {
  return this.sendRequest('/setWebhook', {url: url});
};
/**
 * send a Web Hook update to process
 *
 * @param  {Object} update The update to process
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.webHookUpdate = function(update) {
  return this.processUpdates([update]);
};
/**
 * Ask Telegram for an update (Call when your polling the server)
 *
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.pollingUpdate = function () {
  var self = this;
  return this.sendRequest('/getUpdates').then(
    function(content) {
      return self.processUpdates(content.result);
    }
  );
};
/**
 * Process all the incoming updates
 *
 * @param  {Array}  updates An array of updates sent by telegram
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.processUpdates = function(updates) {
  var deferred = new Deferred();
  var self = this;
  var updateTimestamps = [];
  var promises = [];
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    if (update) {
      if ((_.has(update, 'message')) && (update.message.date > this.lastUpdated)) {
        updateTimestamps.push(update.message.date);
        promises.push(this.handleCommands(update.message));

      } else if ((_.has(update, 'inline_query')) && (_.indexOf(this.lastInlineQueriesHandled, update.inline_query.id) === -1)) {
        promises.push(this.handleQuery(update.inline_query));
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
 * Handle the update
 *
 * @param  {Object} update The JSON Object for the update
 * @return {Boolean}       Was it successful?
 * @access public
 */
TelegramBot.prototype.handleCommands = function(update) {
  console.log('Handling a Command.');
  var deferred = new Deferred();
  if ((!_.has(update, 'text')) || (update.text === '')) {
    deferred.resolve(true);
  } else {
    var scriptureMatch = update.text.match(matchBibleReferenceRegex);
    if (update.text.match(/\/start/)) {
      this.runCommandStart(update).then(function() {
        deferred.resolve(true);
      });
    } else if (update.text.match(/\/get/)) {
      var requestedBook = update.text.replace(/(\/get\s*)/, '');
      this.runCommandGet(update, requestedBook).then(function() {
        deferred.resolve(true);
      });
    } else if (update.text.match(/\/help/)) {
      this.runCommandHelp(update).then(function() {
        deferred.resolve(true);
      });
    } else if (scriptureMatch) {
      this.runCommandGet(update, scriptureMatch[0]).then(function() {
        deferred.resolve(true);
      });
    } else {
      deferred.resolve(true);
    }
  }
  return deferred.promise;
};
/**
 * Handle inline queries
 *
 * @param  {Object} update The update passed from Telegram
 * @return {Boolean}       Was it succesful?
 * @access public
 */
TelegramBot.prototype.handleQuery = function(update) {
  console.log('Handling a Inline Query.');
  var deferred = new Deferred();
  if (update.text === '') {
    update.query = 'Matthew 1';
    this.runPassageSearch(update).then(function() {
      deferred.resolve(true);
    });
  } else {
    var scriptureMatch = update.query.match(matchBibleReferenceRegex);
    if (scriptureMatch) {
      this.runPassageSearch(update).then(function() {
        deferred.resolve(true);
      });
    } else {
      var details = this.dataSource.findBookDetails(update.query.toLowerCase());
      if (!details) {
        update.query = 'Matthew 1';
      } else {
        update.query = details.title + ' 1';
      }
      this.runPassageSearch(update).then(function() {
        deferred.resolve(true);
      });
    }
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
    text: 'Hello <b>' + update.from.username +'</b>!\n\n  It is good to meet you!  ' +
    'I can help you find Bible passages in American Sign Language.  All you have to do is type a verse in this format: <b>Matthew 18:19-20</b>.' +
    'If you need help, simply type /help for some suggestions. \n\nAre you ready to start?'
  };

  return this.sendRequest('/sendMessage', options);
};
/**
 * Handle the /help command
 *
 * @param  {Object} update The update data passed from Telegram
 * @return {Void}
 *
 * @access public
 */
TelegramBot.prototype.runCommandHelp =  function(update) {
  var options = {
    chat_id: update.chat.id,
    parse_mode: 'HTML',
    text: '<b>Help</b>\n\n' +
    'Simply type a Bible verse in the following format <b>Matthew 18:19-20</b>, and I will send you a link to the passage.  Here are some examples:\n' +
    '- John 3:16\n- Psalms 1:1\n- Matthew 28:16-20\n'
  };

  return this.sendRequest('/sendMessage', options);
};
/**
 * Handle the /get command
 *
 * @param  {Object} update The update data passed from Telegram
 * @return {Void}
 *
 * @access public
 */
TelegramBot.prototype.runCommandGet =  function(update, requestedBook) {
  var options = {
    chat_id: update.chat.id,
    parse_mode: 'HTML',
    text: ''
  };
  var self = this;

  return this.dataSource.findVideos(requestedBook).then(function(result) {
    var videos = result.videos;
    if (videos.length == 1) {
      options.text = '<b>' + requestedBook + '</b>\n\n' + '<a href="' + videos[0].path + '">' + videos[0].title + '</a>';
    } else if (videos.length > 1) {
      var keyboardOptions = [];
      for (var i = 0; i < videos.length; i++) {
        var title = self.videoTitle(videos[i], true);
        keyboardOptions.push([title]);
      }
      options.text = 'We have found more than 1 video.  Which video would you like to see?';
      options.reply_markup = {
        keyboard: keyboardOptions,
        one_time_keyboard: true
      };
    } else if (result.available === false) {
      options.text = '<b>' + requestedBook + '</b>' +
        ' has not been translated yet. <a href="https://www.deafbiblesociety.com/projects">Can you help?</a>';
    } else {
      options.text = 'Sorry, no videos were found.  Please try another search.';
    }
    return self.sendRequest('/sendMessage', options);
  }, function() {
    options.text = 'Sorry, no videos were found.  Please try another search.';
    return self.sendRequest('/sendMessage', options);
  });
};
/**
 * Run a search and return to Telegram the results.
 *
 * @param  {Object} inlineQuery The requested inline query
 * @return {Void}
 * @access public
 */
TelegramBot.prototype.runPassageSearch = function(inlineQuery) {
  var self = this;
  var options = {
    inline_query_id: inlineQuery.id
  };
  return this.dataSource.findVideos(inlineQuery.query).then(function(result) {
    var searchResults = [];
    var videos = result.videos;
    if ((videos.length === 0) && (result.available === false)) {
      searchResults.push({
        type: 'article',
        id: 'help-translate',
        title: 'Translation Unavailable',
        description: 'Sorry, the book ' + result.book + ' has not been translated yet.  Do you want to share how the group can help complete it?',
        url: 'https://www.deafbiblesociety.com/projects',
        thumb_url: 'http://www.bible.is/images/icon_deaf_200.png',
        hide_url: false,
        input_message_content: {
          message_text: 'The ASL translation for ' + result.book + ' has yet to be completed?  Find out how you can help at https://www.deafbiblesociety.com/projects!'
        }
      });
    } else {
      for (var i = 0; i < videos.length; i++) {
        var title = self.videoTitle(videos[i], false);
        var video = {
          type: 'video',
          id: videos[i].segment_order,
          video_url: videos[i].path,
          title: title,
          description: videos[i].title,
          mime_type: 'video/mp4',
          thumb_url: 'http://www.bible.is/images/icon_deaf_200.png'
        };
        searchResults.push(video);
      }
    }
    options.results = JSON.stringify(searchResults);
    return self.sendRequest('/answerInlineQuery', options).then(function() {
      self.lastInlineQueriesHandled.push(inlineQuery.id);
    });
  }, function() {
    console.log('No results found.');
    options.results = JSON.stringify([]);
    return self.sendRequest('/answerInlineQuery', options).then(function() {
      self.lastInlineQueriesHandled.push(inlineQuery.id);
    });
  });
};
/**
 * Get the video title
 * @param  {Object}   result      The video result
 * @param  {Boolean}  appendTitle Do you want to append the title
 * @return {String}               The final title
 *
 * @access public
 */
TelegramBot.prototype.videoTitle = function (result, appendTitle) {
  var title = result.book + ' ' + result.chapter_start + ':' + result.verse_start;
  if ((result.chapter_end) && (result.chapter_start != result.chapter_end)) {
    title += '-' + result.chapter_end + ':' + result.verse_end;
  } else {
    title += '-' + result.verse_end;
  }
  if (appendTitle) {
    title += ' - ' + result.title;
  }
  return title;
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
        console.log(body);
        deferred.resolve({});
      }
    }
  );
  return deferred.promise;
};

module.exports = TelegramBot;
