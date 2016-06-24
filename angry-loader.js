/*!
 * AngryLoader
 * http://github.com/matt-harvey/angryloader/
 *
 * Copyright (c) 2016 Matthew Harvey
 * Released under the MIT license
 * http://github.com/matt-harvey/angryloader/blob/master/LICENSE.txt
 */

var AngryLoader = function($) {

  'use strict';

  var doc = $(document);

  var cache = {};

  var opts = {
    urls: [],
    selector: 'body',
    replaceWithin: ['<body>', '</body>']
  };

  function initialize(options) {
    $.extend(opts, options);
    doc.ready(notifyLoaded);
    if (historyAPISupported()) {
      $(window).on('popstate', handleBack);
      doc.on('angryLoader:load', configureLinks);
      doc.ready(populateCache);
    }
  }

  function contentBetween(str, bookends) {
      var startAt = bookends[0];
      var endAt = bookends[1];
      var startPos = (startAt ? str.search(startAt) + startAt.length : 0);
      var endPos = (endAt ? str.search(endAt) : undefined);
      return str.slice(startPos, endPos);
  }

  function handleBack(/*event*/) {
    var url = document.location.pathname;
    if (url in cache) {
      load(url);
    }
  }

  function notifyLoaded() {
    doc.trigger('angryLoader:load');
  }

  function historyAPISupported() {
    return (typeof window.history !== 'undefined' && typeof window.history.pushState === 'function');
  }

  function populateCache() {
    $.each(opts.urls, function(index, url) {
      $.get(url).done(function(data, textStatus/*, jqXHR */) {
        if (textStatus === 'success') {
          cache[url] = {
            content: contentBetween(data, opts.replaceWithin),
            title: contentBetween(data, ['<title>', '</title>'])
          };
        }
      });
    });
  }

  function configureLinks() {
    $('a').not('.js-angry-loader-initialized').click(function(event) {
      var url = $(this).attr('href');
      if (url in cache) {
        event.preventDefault();
        window.history.pushState({}, undefined, url);
        load(url);
      }
    }).addClass('js-angry-loader-initialized');
  }

  function load(url) {
    var cached = cache[url];
    doc.find('title').html(cached.title);
    $(opts.selector).html(cached.content);
    $('html, body').animate({ scrollTop: 0 }, 0);
    notifyLoaded();
  }

  return {  // export public functions
    initialize: initialize
  };

}(jQuery);

