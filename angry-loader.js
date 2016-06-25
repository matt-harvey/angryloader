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
    // Regexes lifted from
    // https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
    var title = pageContent.match(/<title[^>]*>([\s\S.]*)<\/title>/i)[0];
    var titleInnerStart = title.match(/<title[^>]*>/)[0].length;
    var titleInner = title.slice(titleInnerStart, -'</title>'.length);
    var body = pageContent.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
    var bodyInnerStart = body.match(/<body[^>]*>/)[0].length;
    var bodyInner = body.slice(bodyInnerStart, -'</body>'.length);
    cache[url] = { title: titleInner, content: bodyInner };
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

