AngryLoader
===========

Similar to Turbolinks and PJAX, AngryLoader enables fast navigation within your site.
But AngryLoader is impatient, and unsophisticated. Want to force a bunch of preemptive
GET requests on your users for pages they might not visit, just so that, in the off chance they
*do* visit them, they'll get to them really fast? Then AngryLoader is for you!

Tell AngryLoader the list of URLs you want to be fast, like so::

  AngryLoader.initialize({
    urls: ['/', '/blog', '/mega']
  });

When someone first visits your site, AngryLoader AJAX-requests HTML from *all* the URLs you've
given it, and caches their content in memory. When the user clicks on any link that has one of
these *exact* URLs as its ``href`` attribute, the browser will grab the cached page and swap out
the current ``<body>`` content with the ``<body>`` content of the cached page. Any other links will
be handled normally.

If you want, you can tell AngryLoader to swap out some other element than the ``<body>``. But take care.
AngryLoader couldn't be arsed parsing the HTML properly, so as well as giving it a jQuery
selector for the element you want to replace, you've got to tell it strings to look for when
pulling out what it needs from the preloaded HTML::

  AngryLoader.initialize({
    urls: ['/', '/blog', '/mega'],
    selector: '.main-content',  // default: 'body'
    replaceWithin: ['<-- START_REPLACE -->', '<-- END_REPLACE -->']  // default: ['<body>', '</body'>]
  });

It will pull out everything within, but not including, these "bookend" strings, and populate
the element given by ``jQuery(selector)`` with this content.

AngryLoader uses the HTML5 history API to manage browser history so that, for the user, it's just like
they're navigating to a different page (but fast), with browser back and forward buttons working
as per usual. If HTML5 history is not supported by the browser, however, AngryLoader will degrade
gracefully and do nothing at all, the links then just acting like links normally would.

*Both* when a new page is loaded from the cache, *and* on ordinary ``$(document).ready``, the event
``angryLoader:load`` will be triggered by the ``document`` element. If you're using AngryLoader, the
code you would normally run on ``$(document).ready`` should generally be run on this event instead,
i.e.::

  $(document).on('angryLoader:load', function() {

    // Set up your click handlers and whatnot...

  });

AngryLoader would be best suited to sites with only a few pages that aren't too big.
It is probably a bad idea to make your users GET a tonne of data which they'll probably never see.

Oh yeah, you need jQuery. Include it somewhere before ``angry-loader.js``.
