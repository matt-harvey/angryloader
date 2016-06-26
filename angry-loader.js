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
  var opts = { urls: [] };
  var initialized = false;
  var extractTitleContent = innerContentExtractor('title');
  var extractBodyContent = innerContentExtractor('body');

  // core logic

  function initialize(options) {
    if (initialized) {
      throw new Error('AngryLoader has already been initialized.');
    } else {
      $.extend(opts, options);
      if (historyAPISupported()) {
        $(window).on('popstate', handleBack);
        initializeLinks();
        doc.ready(populateCache);
      } else {
        doc.ready(notifyLoaded);
      }
      initialized = true;
    }
  }

  function initializeLinks() {
    doc.on('click', 'a', function(event) {
      var url = $(event.target).attr('href');
      if (url in cache) {
        event.preventDefault();
        load(url);
        window.history.pushState({}, undefined, url);
      }
    });
  }

  function populateCache() {
    var current = currentUrl();
    if (opts.urls.indexOf(current) !== -1) {
      save(current, $('html').html());
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
      title: extractTitleContent(pageContent),
      content: extractBodyContent(pageContent)
    };
  }

  function load(url) {
    var cached = cache[url];
    doc.prop('title', cached.title);
    $('body').html(cached.content);
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

  function innerContentExtractor(tagName) {
    // Regexes adapted from
    // https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
    // Use a closure to avoid regexes being recreated multiple times.
    var openingMatcher = '<' + tagName + '[^>]*>';
    var openingRegExp = new RegExp(openingMatcher, 'i');
    var contentMatcher = '([\\s\\S.]*)';
    var closingMatcher = '</' + tagName + '>';
    var elemRegExp = new RegExp(openingMatcher + contentMatcher + closingMatcher, 'i');

    return function(html) {
      var elem = html.match(elemRegExp)[0];
      var elemInnerStart = elem.match(openingRegExp)[0].length;
      return elem.slice(elemInnerStart, -closingMatcher.length);
    };
  }

  // feature detection

  function historyAPISupported() {
    return (
      typeof window.history !== 'undefined' &&
      typeof window.history.pushState === 'function'
    );
  }

  // export public functions

  return {
    initialize: initialize
  };

}(jQuery);

