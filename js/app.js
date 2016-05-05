/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );


/**
 * smoothState.js is a jQuery plugin to stop page load jank.
 *
 * This jQuery plugin progressively enhances page loads to 
 * behave more like a single-page application.
 *
 * @author  Miguel Ángel Pérez   reachme@miguel-perez.com
 * @see     https://github.com/miguel-perez/jquery.smoothState.js
 * 
 */
;(function ( $, window, document, undefined ) {
    "use strict";

    var
        /** Used later to scroll page to the top */
        $body       = $('html, body'),
        
        /** Used in development mode to console out useful warnings */
        consl       = (window.console || false),
        
        /** Plugin default options */
        defaults    = {

            /** jquery element string to specify which anchors smoothstate should bind to */
            anchors : "a",

            /** If set to true, smoothState will prefetch a link's contents on hover */
            prefetch : false,
            
            /** A selecor that deinfes with links should be ignored by smoothState */
            blacklist : ".no-smoothstate, [target]",
            
            /** If set to true, smoothState will log useful debug information instead of aborting */
            development : false,
            
            /** The number of pages smoothState will try to store in memory and not request again */
            pageCacheSize : 0,
            
            /** A function that can be used to alter urls before they are used to request content */
            alterRequestUrl : function (url) {
                return url;
            },
            
            /** Run when a link has been activated */
            onStart : {
                duration: 0,
                render: function (url, $container) {
                    $body.scrollTop(0);
                }
            },

            /** Run if the page request is still pending and onStart has finished animating */
            onProgress : {
                duration: 0,
                render: function (url, $container) {
                    $body.css('cursor', 'wait');
                    $body.find('a').css('cursor', 'wait');
                }
            },

            /** Run when requested content is ready to be injected into the page  */
            onEnd : {
                duration: 0,
                render: function (url, $container, $content) {
                    $body.css('cursor', 'auto');
                    $body.find('a').css('cursor', 'auto');
                    $container.html($content);
                }
            },

            /** Run when content has been injected and all animations are complete  */
            callback : function(url, $container, $content) {

            }
        },
        
        /** Utility functions that are decoupled from SmoothState */
        utility     = {

            /**
             * Checks to see if the url is external
             * @param   {string}    url - url being evaluated
             * @see     http://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
             * 
             */
            isExternal: function (url) {
                var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
                if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
                    return true;
                }
                if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":(" + {"http:": 80, "https:": 443}[location.protocol] + ")?$"), "") !== location.host) {
                    return true;
                }
                return false;
            },

            /**
             * Checks to see if the url is an internal hash
             * @param   {string}    url - url being evaluated
             * 
             */
            isHash: function (url) {
                var hasPathname = (url.indexOf(window.location.pathname) > 0) ? true : false,
                    hasHash = (url.indexOf("#") > 0) ? true : false;
                return (hasPathname && hasHash) ? true : false;
            },

            /**
             * Checks to see if we should be loading this URL
             * @param   {string}    url - url being evaluated
             * @param   {string}    blacklist - jquery selector
             * 
             */
            shouldLoad: function ($anchor, blacklist) {
                var url = $anchor.prop("href");
                // URL will only be loaded if it's not an external link, hash, or blacklisted
                return (!utility.isExternal(url) && !utility.isHash(url) && !$anchor.is(blacklist));
            },

            /**
             * Prevents jQuery from stripping elements from $(html)
             * @param   {string}    url - url being evaluated
             * @author  Ben Alman   http://benalman.com/
             * @see     https://gist.github.com/cowboy/742952
             * 
             */
            htmlDoc: function (html) {
                var parent,
                    elems       = $(),
                    matchTag    = /<(\/?)(html|head|body|title|base|meta)(\s+[^>]*)?>/ig,
                    prefix      = 'ss' + Math.round(Math.random() * 100000),
                    htmlParsed  = html.replace(matchTag, function(tag, slash, name, attrs) {
                        var obj = {};
                        if (!slash) {
                            elems = elems.add('<' + name + '/>');
                            if (attrs) {
                                $.each($('<div' + attrs + '/>')[0].attributes, function(i, attr) {
                                obj[attr.name] = attr.value;
                                });
                            }
                            elems.eq(-1).attr(obj);
                        }
                        return '<' + slash + 'div' + (slash ? '' : ' id="' + prefix + (elems.length - 1) + '"') + '>';
                    });

                // If no placeholder elements were necessary, just return normal
                // jQuery-parsed HTML.
                if (!elems.length) {
                    return $(html);
                }
                // Create parent node if it hasn't been created yet.
                if (!parent) {
                    parent = $('<div/>');
                }
                // Create the parent node and append the parsed, place-held HTML.
                parent.html(htmlParsed);
                
                // Replace each placeholder element with its intended element.
                $.each(elems, function(i) {
                    var elem = parent.find('#' + prefix + i).before(elems[i]);
                    elems.eq(i).html(elem.contents());
                    elem.remove();
                });

                return parent.children().unwrap();
            },

            /**
             * Resets an object if it has too many properties
             *
             * This is used to clear the 'cache' object that stores
             * all of the html. This would prevent the client from
             * running out of memory and allow the user to hit the 
             * server for a fresh copy of the content.
             *
             * @param   {object}    obj
             * @param   {number}    cap
             * 
             */
            clearIfOverCapacity: function (obj, cap) {
                // Polyfill Object.keys if it doesn't exist
                if (!Object.keys) {
                    Object.keys = function (obj) {
                        var keys = [],
                            k;
                        for (k in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                                keys.push(k);
                            }
                        }
                        return keys;
                    };
                }

                if (Object.keys(obj).length > cap) {
                    obj = {};
                }

                return obj;
            },

            /**
             * Finds the inner content of an element, by an ID, from a jQuery object
             * @param   {string}    id
             * @param   {object}    $html
             * 
             */
            getContentById: function (id, $html) {
                $html = ($html instanceof jQuery) ? $html : utility.htmlDoc($html);
                var $insideElem         = $html.find(id),
                    updatedContainer    = ($insideElem.length) ? $.trim($insideElem.html()) : $html.filter(id).html(),
                    newContent          = (updatedContainer.length) ? $(updatedContainer) : null;
                return newContent;
            },

            /**
             * Stores html content as jquery object in given object
             * @param   {object}    object - object contents will be stored into
             * @param   {string}    url - url to be used as the prop
             * @param   {jquery}    html - contents to store
             * 
             */
            storePageIn: function (object, url, $html) {
                $html = ($html instanceof jQuery) ? $html : utility.htmlDoc($html);
                object[url] = { // Content is indexed by the url
                    status: "loaded",
                    title: $html.find("title").text(), // Stores the title of the page
                    html: $html // Stores the contents of the page
                };
                return object;
            },

            /**
             * Triggers an "allanimationend" event when all animations are complete
             * @param   {object}    $element - jQuery object that should trigger event
             * @param   {string}    resetOn - which other events to trigger allanimationend on
             * 
             */
             triggerAllAnimationEndEvent: function ($element, resetOn) {

                resetOn = " " + resetOn || "";

                var animationCount      = 0,
                    animationstart      = "animationstart webkitAnimationStart oanimationstart MSAnimationStart",
                    animationend        = "animationend webkitAnimationEnd oanimationend MSAnimationEnd",
                    eventname           = "allanimationend",
                    onAnimationStart    = function (e) {
                        if ($(e.delegateTarget).is($element)) {
                            e.stopPropagation();
                            animationCount ++;
                        }
                    },
                    onAnimationEnd      = function (e) {
                        if ($(e.delegateTarget).is($element)) {
                            e.stopPropagation();
                            animationCount --;
                            if(animationCount === 0) {
                                $element.trigger(eventname);
                            }
                        }
                    };

                $element.on(animationstart, onAnimationStart);
                $element.on(animationend, onAnimationEnd);

                $element.on("allanimationend" + resetOn, function(e){
                    animationCount = 0;
                    utility.redraw($element);
                });
            },

            /** Forces browser to redraw elements */
            redraw: function ($element) {
                $element.hide(0, function() {
                    $(this).show();
                });
            }
        },

        /** Handles the popstate event, like when the user hits 'back' */
        onPopState = function ( e ) {
            if(e.state !== null) {
                var url     = window.location.href,
                    $page   = $('#' + e.state.id),
                    page    = $page.data('smoothState');
                
                if(page.href !== url && !utility.isHash(url)) {
                    page.load(url, true);
                }
            }
        },

        /** Constructor function */
        SmoothState = function ( element, options ) {
            var
                /** Container element smoothState is run on */
                $container  = $(element),
                
                /** Variable that stores pages after they are requested */
                cache       = {},
                
                /** Url of the content that is currently displayed */
                currentHref = window.location.href,

                /**
                 * Loads the contents of a url into our container 
                 *
                 * @param   {string}    url
                 * @param   {bool}      isPopped - used to determine if whe should
                 *                      add a new item into the history object
                 * 
                 */
                load = function (url, isPopped) {
                    
                    /** Makes this an optional variable by setting a default */
                    isPopped = isPopped || false;

                    var
                        /** Used to check if the onProgress function has been run */
                        hasRunCallback  = false,

                        callbBackEnded  = false,
                        
                        /** List of responses for the states of the page request */
                        responses       = {

                            /** Page is ready, update the content */
                            loaded: function() {
                                var eventName = hasRunCallback ? "ss.onProgressEnd" : "ss.onStartEnd";

                                if(!callbBackEnded || !hasRunCallback) {
                                    $container.one(eventName, function(){
                                        updateContent(url);
                                    });
                                } else if(callbBackEnded) {
                                    updateContent(url);
                                }

                                if(!isPopped) {
                                    history.pushState({ id: $container.prop('id') }, cache[url].title, url);
                                }
                            },

                            /** Loading, wait 10 ms and check again */
                            fetching: function() {
                                
                                if(!hasRunCallback) {
                                    
                                    hasRunCallback = true;
                                    
                                    // Run the onProgress callback and set trigger
                                    $container.one("ss.onStartEnd", function(){
                                        options.onProgress.render(url, $container, null);
                                        
                                        setTimeout(function(){
                                            $container.trigger("ss.onProgressEnd");
                                            callbBackEnded = true;
                                        }, options.onStart.duration);
                                    
                                    });
                                }
                                
                                setTimeout(function () {
                                    // Might of been canceled, better check!
                                    if(cache.hasOwnProperty(url)){
                                        responses[cache[url].status]();
                                    }
                                }, 10);
                            },

                            /** Error, abort and redirect */
                            error: function(){
                                window.location = url;
                            }
                        };
                    
                    if (!cache.hasOwnProperty(url)) {
                        fetch(url);
                    }
                    
                    // Run the onStart callback and set trigger
                    options.onStart.render(url, $container, null);
                    setTimeout(function(){
                        $container.trigger("ss.onStartEnd");
                    }, options.onStart.duration);

                    // Start checking for the status of content
                    responses[cache[url].status]();

                },

                /** Updates the contents from cache[url] */
                updateContent = function (url) {
                    // If the content has been requested and is done:
                    var containerId = '#' + $container.prop('id'),
                        $content    = utility.getContentById(containerId, cache[url].html);


                    if($content) {
                        document.title = cache[url].title;
                        $container.data('smoothState').href = url;
                        
                        // Call the onEnd callback and set trigger
                        options.onEnd.render(url, $container, $content);

                        $container.one("ss.onEndEnd", function(){
                            options.callback(url, $container, $content);
                        });

                        setTimeout(function(){
                            $container.trigger("ss.onEndEnd");
                        }, options.onEnd.duration);

                    } else if (!$content && options.development && consl) {
                        // Throw warning to help debug in development mode
                        consl.warn("No element with an id of " + containerId + "' in response from " + url + " in " + object);
                    } else {
                        // No content availble to update with, aborting...
                        window.location = url;
                    }
                },

                /**
                 * Fetches the contents of a url and stores it in the 'cache' varible
                 * @param   {string}    url
                 * 
                 */
                fetch = function (url) {

                    // Don't fetch we have the content already
                    if(cache.hasOwnProperty(url)) return;

                    cache = utility.clearIfOverCapacity(cache, options.pageCacheSize);
                    
                    cache[url] = { status: "fetching" };

                    var requestUrl  = options.alterRequestUrl(url) || url,
                        request     = $.ajax(requestUrl);

                    // Store contents in cache variable if successful
                    request.success(function (html) {
                        // Clear cache varible if it's getting too big
                        utility.storePageIn(cache, url, html);
                        $container.data('smoothState').cache = cache;
                    });

                    // Mark as error
                    request.error(function () {
                        cache[url].status = "error";
                    });
                },
                /**
                 * Binds to the hover event of a link, used for prefetching content
                 *
                 * @param   {object}    event
                 * 
                 */
                hoverAnchor = function (event) {
                    var $anchor = $(event.currentTarget),
                        url     = $anchor.prop("href");
                    if (utility.shouldLoad($anchor, options.blacklist)) {
                        event.stopPropagation();
                        fetch(url);
                    }
                },

                /**
                 * Binds to the click event of a link, used to show the content
                 *
                 * @param   {object}    event
                 * 
                 */
                clickAnchor = function (event) {
                    var $anchor     = $(event.currentTarget),
                        url         = $anchor.prop("href"),
                        $container  = $(event.delegateTarget);

                    if (utility.shouldLoad($anchor, options.blacklist)) {
                        // stopPropagation so that event doesn't fire on parent containers.
                        event.stopPropagation();
                        event.preventDefault();
                        load(url);
                    }
                },

                /**
                 * Binds all events and inits functionality
                 *
                 * @param   {object}    event
                 * 
                 */
                bindEventHandlers = function ($element) {
                    //@todo: Handle form submissions
                    $element.on("click", options.anchors, clickAnchor);

                    if (options.prefetch) {
                        $element.on("mouseover touchstart", options.anchors, hoverAnchor);
                    }

                },

                /** Used to restart css animations with a class */
                toggleAnimationClass = function (classname) {
                    var classes = $container.addClass(classname).prop('class');
                    
                    $container.removeClass(classes);
                    
                    setTimeout(function(){
                        $container.addClass(classes);
                    },0);

                    $container.one("ss.onStartEnd ss.onProgressEnd ss.onEndEnd", function(){
                        $container.removeClass(classname);
                    });
                    
                };

            /** Override defaults with options passed in */
            options = $.extend(defaults, options);

            /** Sets a default state */
            if(history.state === null) {
                history.replaceState({ id: $container.prop('id') }, document.title, currentHref);
            }

            /** Stores the current page in cache variable */
            utility.storePageIn(cache, currentHref, document.documentElement.outerHTML);

            /** Bind all of the event handlers on the container, not anchors */
            utility.triggerAllAnimationEndEvent($container, "ss.onStartEnd ss.onProgressEnd ss.onEndEnd");

            /** Bind all of the event handlers on the container, not anchors */
            bindEventHandlers($container);

            /** Public methods */
            return {
                href: currentHref,
                cache: cache,
                load: load,
                fetch: fetch,
                toggleAnimationClass: toggleAnimationClass
            };
        },

        /** Returns elements with SmoothState attached to it */
        declareSmoothState = function ( options ) {
            return this.each(function () {
                // Checks to make sure the smoothState element has an id and isn't already bound
                if(this.id && !$.data(this, 'smoothState')) {
                    // Makes public methods available via $('element').data('smoothState');
                    $.data(this, 'smoothState', new SmoothState(this, options));
                } else if (!this.id && consl) {
                    // Throw warning if in development mode
                    consl.warn("Every smoothState container needs an id but the following one does not have one:", this);
                }
            });
        };

    /** Sets the popstate function */
    window.onpopstate = onPopState;

    /** Makes utility functions public for unit tests */
    $.smoothStateUtility = utility;

    /** Defines the smoothState plugin */
    $.fn.smoothState = declareSmoothState;

})(jQuery, window, document);

  ;(function ($) {
    'use strict';
    var $body    = $('html, body'), // Define jQuery collection 
        content  = $('#page').smoothState({
          onStart : {
            duration: 250,
            render: function () {
              content.toggleAnimationClass('is-exiting');
              
              // Scroll user to the top
              $body.animate({ 'scrollTop': 0 });

            }
          }
        }).data('smoothState');
  })(jQuery);

  /*! http://mths.be/placeholder v2.0.8 by @mathias */
;(function(window, document, $) {

  // Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
  var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
  var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
  var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
  var prototype = $.fn;
  var valHooks = $.valHooks;
  var propHooks = $.propHooks;
  var hooks;
  var placeholder;

  if (isInputSupported && isTextareaSupported) {

    placeholder = prototype.placeholder = function() {
      return this;
    };

    placeholder.input = placeholder.textarea = true;

  } else {

    placeholder = prototype.placeholder = function() {
      var $this = this;
      $this
        .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
        .not('.placeholder')
        .bind({
          'focus.placeholder': clearPlaceholder,
          'blur.placeholder': setPlaceholder
        })
        .data('placeholder-enabled', true)
        .trigger('blur.placeholder');
      return $this;
    };

    placeholder.input = isInputSupported;
    placeholder.textarea = isTextareaSupported;

    hooks = {
      'get': function(element) {
        var $element = $(element);

        var $passwordInput = $element.data('placeholder-password');
        if ($passwordInput) {
          return $passwordInput[0].value;
        }

        return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
      },
      'set': function(element, value) {
        var $element = $(element);

        var $passwordInput = $element.data('placeholder-password');
        if ($passwordInput) {
          return $passwordInput[0].value = value;
        }

        if (!$element.data('placeholder-enabled')) {
          return element.value = value;
        }
        if (value == '') {
          element.value = value;
          // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
          if (element != safeActiveElement()) {
            // We can't use `triggerHandler` here because of dummy text/password inputs :(
            setPlaceholder.call(element);
          }
        } else if ($element.hasClass('placeholder')) {
          clearPlaceholder.call(element, true, value) || (element.value = value);
        } else {
          element.value = value;
        }
        // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
        return $element;
      }
    };

    if (!isInputSupported) {
      valHooks.input = hooks;
      propHooks.value = hooks;
    }
    if (!isTextareaSupported) {
      valHooks.textarea = hooks;
      propHooks.value = hooks;
    }

    $(function() {
      // Look for forms
      $(document).delegate('form', 'submit.placeholder', function() {
        // Clear the placeholder values so they don't get submitted
        var $inputs = $('.placeholder', this).each(clearPlaceholder);
        setTimeout(function() {
          $inputs.each(setPlaceholder);
        }, 10);
      });
    });

    // Clear placeholder values upon page reload
    $(window).bind('beforeunload.placeholder', function() {
      $('.placeholder').each(function() {
        this.value = '';
      });
    });

  }

  function args(elem) {
    // Return an object of element attributes
    var newAttrs = {};
    var rinlinejQuery = /^jQuery\d+$/;
    $.each(elem.attributes, function(i, attr) {
      if (attr.specified && !rinlinejQuery.test(attr.name)) {
        newAttrs[attr.name] = attr.value;
      }
    });
    return newAttrs;
  }

  function clearPlaceholder(event, value) {
    var input = this;
    var $input = $(input);
    if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
      if ($input.data('placeholder-password')) {
        $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
        // If `clearPlaceholder` was called from `$.valHooks.input.set`
        if (event === true) {
          return $input[0].value = value;
        }
        $input.focus();
      } else {
        input.value = '';
        $input.removeClass('placeholder');
        input == safeActiveElement() && input.select();
      }
    }
  }

  function setPlaceholder() {
    var $replacement;
    var input = this;
    var $input = $(input);
    var id = this.id;
    if (input.value == '') {
      if (input.type == 'password') {
        if (!$input.data('placeholder-textinput')) {
          try {
            $replacement = $input.clone().attr({ 'type': 'text' });
          } catch(e) {
            $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
          }
          $replacement
            .removeAttr('name')
            .data({
              'placeholder-password': $input,
              'placeholder-id': id
            })
            .bind('focus.placeholder', clearPlaceholder);
          $input
            .data({
              'placeholder-textinput': $replacement,
              'placeholder-id': id
            })
            .before($replacement);
        }
        $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
        // Note: `$input[0] != input` now!
      }
      $input.addClass('placeholder');
      $input[0].value = $input.attr('placeholder');
    } else {
      $input.removeClass('placeholder');
    }
  }

  function safeActiveElement() {
    // Avoid IE9 `document.activeElement` of death
    // https://github.com/mathiasbynens/jquery-placeholder/pull/99
    try {
      return document.activeElement;
    } catch (exception) {}
  }

}(this, document, jQuery));

/*!
 * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */

!function(a,b){"use strict";function c(a){this.callback=a,this.ticking=!1}function d(b){return b&&"undefined"!=typeof a&&(b===a||b.nodeType)}function e(a){if(arguments.length<=0)throw new Error("Missing arguments in extend function");var b,c,f=a||{};for(c=1;c<arguments.length;c++){var g=arguments[c]||{};for(b in g)f[b]="object"!=typeof f[b]||d(f[b])?f[b]||g[b]:e(f[b],g[b])}return f}function f(a){return a===Object(a)?a:{down:a,up:a}}function g(a,b){b=e(b,g.options),this.lastKnownScrollY=0,this.elem=a,this.debouncer=new c(this.update.bind(this)),this.tolerance=f(b.tolerance),this.classes=b.classes,this.offset=b.offset,this.scroller=b.scroller,this.initialised=!1,this.onPin=b.onPin,this.onUnpin=b.onUnpin,this.onTop=b.onTop,this.onNotTop=b.onNotTop}var h={bind:!!function(){}.bind,classList:"classList"in b.documentElement,rAF:!!(a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame)};a.requestAnimationFrame=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame,c.prototype={constructor:c,update:function(){this.callback&&this.callback(),this.ticking=!1},requestTick:function(){this.ticking||(requestAnimationFrame(this.rafCallback||(this.rafCallback=this.update.bind(this))),this.ticking=!0)},handleEvent:function(){this.requestTick()}},g.prototype={constructor:g,init:function(){return g.cutsTheMustard?(this.elem.classList.add(this.classes.initial),setTimeout(this.attachEvent.bind(this),100),this):void 0},destroy:function(){var a=this.classes;this.initialised=!1,this.elem.classList.remove(a.unpinned,a.pinned,a.top,a.initial),this.scroller.removeEventListener("scroll",this.debouncer,!1)},attachEvent:function(){this.initialised||(this.lastKnownScrollY=this.getScrollY(),this.initialised=!0,this.scroller.addEventListener("scroll",this.debouncer,!1),this.debouncer.handleEvent())},unpin:function(){var a=this.elem.classList,b=this.classes;(a.contains(b.pinned)||!a.contains(b.unpinned))&&(a.add(b.unpinned),a.remove(b.pinned),this.onUnpin&&this.onUnpin.call(this))},pin:function(){var a=this.elem.classList,b=this.classes;a.contains(b.unpinned)&&(a.remove(b.unpinned),a.add(b.pinned),this.onPin&&this.onPin.call(this))},top:function(){var a=this.elem.classList,b=this.classes;a.contains(b.top)||(a.add(b.top),a.remove(b.notTop),this.onTop&&this.onTop.call(this))},notTop:function(){var a=this.elem.classList,b=this.classes;a.contains(b.notTop)||(a.add(b.notTop),a.remove(b.top),this.onNotTop&&this.onNotTop.call(this))},getScrollY:function(){return void 0!==this.scroller.pageYOffset?this.scroller.pageYOffset:void 0!==this.scroller.scrollTop?this.scroller.scrollTop:(b.documentElement||b.body.parentNode||b.body).scrollTop},getViewportHeight:function(){return a.innerHeight||b.documentElement.clientHeight||b.body.clientHeight},getDocumentHeight:function(){var a=b.body,c=b.documentElement;return Math.max(a.scrollHeight,c.scrollHeight,a.offsetHeight,c.offsetHeight,a.clientHeight,c.clientHeight)},getElementHeight:function(a){return Math.max(a.scrollHeight,a.offsetHeight,a.clientHeight)},getScrollerHeight:function(){return this.scroller===a||this.scroller===b.body?this.getDocumentHeight():this.getElementHeight(this.scroller)},isOutOfBounds:function(a){var b=0>a,c=a+this.getViewportHeight()>this.getScrollerHeight();return b||c},toleranceExceeded:function(a,b){return Math.abs(a-this.lastKnownScrollY)>=this.tolerance[b]},shouldUnpin:function(a,b){var c=a>this.lastKnownScrollY,d=a>=this.offset;return c&&d&&b},shouldPin:function(a,b){var c=a<this.lastKnownScrollY,d=a<=this.offset;return c&&b||d},update:function(){var a=this.getScrollY(),b=a>this.lastKnownScrollY?"down":"up",c=this.toleranceExceeded(a,b);this.isOutOfBounds(a)||(a<=this.offset?this.top():this.notTop(),this.shouldUnpin(a,c)?this.unpin():this.shouldPin(a,c)&&this.pin(),this.lastKnownScrollY=a)}},g.options={tolerance:{up:0,down:0},offset:0,scroller:a,classes:{pinned:"headroom--pinned",unpinned:"headroom--unpinned",top:"headroom--top",notTop:"headroom--not-top",initial:"headroom"}},g.cutsTheMustard="undefined"!=typeof h&&h.rAF&&h.bind&&h.classList,a.Headroom=g}(window,document);

// grab an element
var myElement = document.querySelector("header");
// construct an instance of Headroom, passing the element
var headroom  = new Headroom(myElement);
// initialise
headroom.init(); 

var pushHeight = jQuery(".sub-menu").outerHeight();
//console.log(pushHeight);

function contentPush() {
  jQuery( "#menu-main-navigation .menu-item-has-children" )
  .mouseenter(function() {
    jQuery('#page').css({ top: pushHeight });
  })
  .mouseleave(function() {
    jQuery('#page').css({ top: 0 });
  });
}

jQuery(window).scroll(function () {

  if (jQuery(this).scrollTop() != 0) {

    jQuery( "#menu-main-navigation .menu-item-has-children" )
      .mouseenter(function() {
        jQuery('#page').css({ top: 0 });
      })
      .mouseleave(function() {
        jQuery('#page').css({ top: 0 });
      });
    
  } else {

    contentPush();
    
  }

});

jQuery(document).ready(function(){

  jQuery( "#menu-main-navigation a" ).click(function(e) {
    e.preventDefault();
  });
  jQuery(".sub-menu a").unbind('click');
  
  contentPush();

  jQuery("#content").fitVids();

  jQuery('input, textarea').placeholder();

});