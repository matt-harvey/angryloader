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

  // module-scoped variables

  var doc = $(document);

  var cache = {};

  var opts = {
    urls: [],
    selector: 'body',
    replaceWithin: ['<body>', '</body>']
  };

  // core logic

  function initialize(options) {
    $.extend(opts, options);
    if (historyAPISupported()) {
      $(window).on('popstate', handleBack);
      doc.on('angryLoader:load', initializeLinks);
      doc.ready(populateCache);
    } else {
      doc.ready(notifyLoaded);
    }
  }

  function initializeLinks() {
    $('a').not('.js-angry-loader-initialized').click(function(event) {
      var url = $(this).attr('href');
      if (url in cache) {
        event.preventDefault();
        load(url);
        window.history.pushState({}, undefined, url);
      }
    }).addClass('js-angry-loader-initialized');
  }

  function populateCache() {
    var current = currentUrl();
    if (opts.urls.indexOf(current) !== -1) {
      save(current, '<html>' + $('html').html() + '</html>');
    }
    notifyLoaded();
    $.each(opts.urls, function(index, url) {
      if (url !== current) {
        $.get(url).done(function(data, textStatus/*, jqXHR */) {
          if (textStatus === 'success') {
            save(url, data);
          }
        });
      }
    });
  }

  function save(url, pageContent) {
    cache[url] = {
      content: contentBetween(pageContent, opts.replaceWithin),
      title: contentBetween(pageContent, ['<title>', '</title>'])
    };
  }

  function load(url) {
    var cached = cache[url];
    doc.prop('title', cached.title);
    $(opts.selector).html(cached.content);
    $('html, body').animate({ scrollTop: 0 }, 0);
    notifyLoaded();
  }

  function notifyLoaded() {
    doc.trigger('angryLoader:load');
  }

  function handleBack(/*event*/) {
    var url = currentUrl();
    if (url in cache) {
      load(url);
    }
  }

  function currentUrl() {
    return document.location.pathname;
  }

  // string utilities

  function contentBetween(str, bookends) {
      var startAt = bookends[0];
      var endAt = bookends[1];
      var startPos = (startAt ? str.search(startAt) + startAt.length : 0);
      var endPos = (endAt ? str.search(endAt) : undefined);
      return str.slice(startPos, endPos);
  }

  // feature detection

  function historyAPISupported() {
    return (typeof window.history !== 'undefined' && typeof window.history.pushState === 'function');
  }

  // export public functions

  return {
    initializeLinks: initializeLinks,
    initialize:      initialize
  };

}(jQuery);

