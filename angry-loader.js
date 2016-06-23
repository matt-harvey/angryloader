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
          var startAt = opts.replaceWithin[0];
          var endAt = opts.replaceWithin[1];
          var startPos = (startAt ? data.search(startAt) + startAt.length : 0);
          var endPos = (endAt ? data.search(endAt) : undefined);
          cache[url] = data.slice(startPos, endPos);
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
    $(opts.selector).html(cache[url]);
    $('html, body').animate({ scrollTop: 0 }, 0);
    notifyLoaded();
  }

  return {  // export public functions
    initialize: initialize
  };

}(jQuery);

