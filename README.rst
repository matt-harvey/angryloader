AngryLoader
===========

Similar to Turbolinks and PJAX, AngryLoader enables fast navigation within your
site.  But AngryLoader is impatient, and unsophisticated. Want to force a bunch
of preemptive GET requests on your users for pages they might not visit, just
so that, on the off chance they *do* visit them, they'll get to them really
fast? Then AngryLoader is for you!

Tell AngryLoader the list of URLs you want to be fast, like so::

  AngryLoader.initialize({
    urls: ['/', '/blog/', '/mega/']
  });

When someone first visits your site, once the initially visited page has been
requested normally and the document is "ready", AngryLoader caches the ``<body>``
content of the current page in memory (provided its URL is among those you've
listed), and then AJAX-requests HTML from each of the other URLs you've given
it, and caches their ``<body>`` content as well. It also looks in each page's
HTML for a ``<title>`` tag, and caches the content of that as well, if found.
When the user clicks on any link that has one of the exact listed URLs as its
``href`` attribute, the browser will grab the cached ``<body>`` content for
that page, swap out the current ``<body>`` content with the cached content, and
set the page title accordingly, without any further HTTP request being made.
Any links to URLs that not in the whitelist, however, will be handled normally.

If you want, you can tell AngryLoader to swap out some other element than the
``<body>``. But take care. For certain reasons, AngryLoader does not properly
parse the HTML it retrieves, so as well as giving it a jQuery selector for the
element you want to replace, you've got to tell it strings to look for when
pulling out what it needs from the preloaded HTML::

  AngryLoader.initialize({
    urls: ['/', '/blog/', '/mega/'],
    selector: '.main-content',  // default: 'body'
    replaceWithin: ['<!-- START_REPLACE -->', '<!-- END_REPLACE -->']  // default: ['<body>', '</body'>]
  });

It will pull out everything within, but not including, these "bookend" strings,
and populate the element given by ``jQuery(selector)`` with this content.

AngryLoader uses the HTML5 history API to manage browser history so that, for
the user, it's just like they're navigating to a different page (but fast),
with browser back and forward buttons working as per usual. If HTML5 history is
not supported by the browser, however, AngryLoader will degrade gracefully and
do nothing at all, the links then just acting like links normally would.

*Both* when a new page is loaded from the cache, *and* on ordinary
``$(document).ready``, the event ``angryLoader:load`` will be triggered by the
``document`` element. If the current page content has just been cached, this
event is triggered just after it is cached, but before the AJAX requests are
made for the other pages. If you're using AngryLoader, the code you would
normally run on ``$(document).ready`` should generally be run on this event
instead, i.e.::

  $(document).on('angryLoader:load', function() {

    // Set up your click handlers and whatnot...

  });

Note that if you add new links to a page after it has been loaded
(whether normally loaded or "angry-loaded"), these links will need to be "manually"
initialized if you want them to act as fast links. You can do this as follows::

  AngryLoader.initializeLinks();

AngryLoader uses a marker class (``js-angry-loader-initialized``) to keep track
of links it has already initialized, so you don't have to worry about it
attaching behaviour to the same link twice.

AngryLoader is probably best suited to sites with only a few pages that aren't
too big. It is probably a bad idea to make your users GET a tonne of data which
they'll probably never see.

Oh yeah, you need jQuery. Include it somewhere before ``angry-loader.js``.
