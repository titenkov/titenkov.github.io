// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2015-03-12
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
    classListProp = "classList"
  , protoProp = "prototype"
  , elemCtrProto = view.Element[protoProp]
  , objCtr = Object
  , strTrim = String[protoProp].trim || function () {
    return this.replace(/^\s+|\s+$/g, "");
  }
  , arrIndexOf = Array[protoProp].indexOf || function (item) {
    var
        i = 0
      , len = this.length
    ;
    for (; i < len; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }
    return -1;
  }
  // Vendors: please allow content code to instantiate DOMExceptions
  , DOMEx = function (type, message) {
    this.name = type;
    this.code = DOMException[type];
    this.message = message;
  }
  , checkTokenAndGetIndex = function (classList, token) {
    if (token === "") {
      throw new DOMEx(
          "SYNTAX_ERR"
        , "An invalid or illegal string was specified"
      );
    }
    if (/\s/.test(token)) {
      throw new DOMEx(
          "INVALID_CHARACTER_ERR"
        , "String contains an invalid character"
      );
    }
    return arrIndexOf.call(classList, token);
  }
  , ClassList = function (elem) {
    var
        trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
      , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
      , i = 0
      , len = classes.length
    ;
    for (; i < len; i++) {
      this.push(classes[i]);
    }
    this._updateClassName = function () {
      elem.setAttribute("class", this.toString());
    };
  }
  , classListProto = ClassList[protoProp] = []
  , classListGetter = function () {
    return new ClassList(this);
  }
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
  return this[i] || null;
};
classListProto.contains = function (token) {
  token += "";
  return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
  ;
  do {
    token = tokens[i] + "";
    if (checkTokenAndGetIndex(this, token) === -1) {
      this.push(token);
      updated = true;
    }
  }
  while (++i < l);

  if (updated) {
    this._updateClassName();
  }
};
classListProto.remove = function () {
  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
    , index
  ;
  do {
    token = tokens[i] + "";
    index = checkTokenAndGetIndex(this, token);
    while (index !== -1) {
      this.splice(index, 1);
      updated = true;
      index = checkTokenAndGetIndex(this, token);
    }
  }
  while (++i < l);

  if (updated) {
    this._updateClassName();
  }
};
classListProto.toggle = function (token, force) {
  token += "";

  var
      result = this.contains(token)
    , method = result ?
      force !== true && "remove"
    :
      force !== false && "add"
  ;

  if (method) {
    this[method](token);
  }

  if (force === true || force === false) {
    return force;
  } else {
    return !result;
  }
};
classListProto.toString = function () {
  return this.join(" ");
};

if (objCtr.defineProperty) {
  var classListPropDesc = {
      get: classListGetter
    , enumerable: true
    , configurable: true
  };
  try {
    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
  } catch (ex) { // IE 8 doesn't support enumerable:true
    if (ex.number === -0x7FF5EC54) {
      classListPropDesc.enumerable = false;
      objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
    }
  }
} else if (objCtr[protoProp].__defineGetter__) {
  elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
  "use strict";

  var testElement = document.createElement("_");

  testElement.classList.add("c1", "c2");

  // Polyfill for IE 10/11 and Firefox <26, where classList.add and
  // classList.remove exist but support only one argument at a time.
  if (!testElement.classList.contains("c2")) {
    var createMethod = function(method) {
      var original = DOMTokenList.prototype[method];

      DOMTokenList.prototype[method] = function(token) {
        var i, len = arguments.length;

        for (i = 0; i < len; i++) {
          token = arguments[i];
          original.call(this, token);
        }
      };
    };
    createMethod('add');
    createMethod('remove');
  }

  testElement.classList.toggle("c3", false);

  // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
  // support the second argument.
  if (testElement.classList.contains("c3")) {
    var _toggle = DOMTokenList.prototype.toggle;

    DOMTokenList.prototype.toggle = function(token, force) {
      if (1 in arguments && !this.contains(token) === !force) {
        return force;
      } else {
        return _toggle.call(this, token);
      }
    };

  }

  testElement = null;
}());

}
}


// Lazy loading
(function(window, factory) {
  var lazySizes = factory(window, window.document);
  window.lazySizes = lazySizes;
  if(typeof module == 'object' && module.exports){
    module.exports = lazySizes;
  } else if (typeof define == 'function' && define.amd) {
    define(lazySizes);
  }
}(window, function(window, document) {
  'use strict';
  /*jshint eqnull:true */
  if(!document.getElementsByClassName){return;}

  var lazySizesConfig;

  var docElem = document.documentElement;

  var addEventListener = window.addEventListener;

  var regPicture = /^picture$/i;

  var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

  var hasClass = function(ele, cls) {
    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    return ele.className.match(reg) && reg;
  };

  var addClass = function(ele, cls) {
    if (!hasClass(ele, cls)){
      ele.className += ' '+cls;
    }
  };

  var removeClass = function(ele, cls) {
    var reg;
    if ((reg = hasClass(ele,cls))) {
      ele.className = ele.className.replace(reg, ' ');
    }
  };

  var addRemoveLoadEvents = function(dom, fn, add){
    var action = add ? 'addEventListener' : 'removeEventListener';
    if(add){
      addRemoveLoadEvents(dom, fn);
    }
    loadEvents.forEach(function(evt){
      dom[action](evt, fn);
    });
  };

  var triggerEvent = function(elem, name, details, noBubbles, noCanceable){
    var event = document.createEvent('Event');

    event.initEvent(name, !noBubbles, !noCanceable);

    event.details = details || {};

    elem.dispatchEvent(event);
    return event;
  };

  var updatePolyfill = function (el, full){
    var polyfill;
    if(!window.HTMLPictureElement){
      if( ( polyfill = (window.picturefill || window.respimage || lazySizesConfig.pf) ) ){
        polyfill({reevaluate: true, reparse: true, elements: [el]});
      } else if(full && full.src){
        el.src = full.src;
      }
    }
  };

  var getCSS = function (elem, style){
    return getComputedStyle(elem, null)[style];
  };

  var getWidth = function(elem, parent){
    var width = elem.offsetWidth;

    while(width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth){
      width =  parent.offsetWidth;
      parent = parent.parentNode;
    }

    return width;
  };

  var throttle = function(fn){
    var run, timer;
    var main = function(){
      if(run){
        run = false;
        fn();
      }
    };
    var handleVisibility = function(){
      clearInterval(timer);
      if(!document.hidden){
        main();
        timer = setInterval(main, 51);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility();

    return function(force){
      run = true;
      if(force === true){
        main();
      }
    };
  };

  var loader = (function(){
    var lazyloadElems, preloadElems, isCompleted, resetPreloadingTimer, loadMode;

    var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

    var defaultExpand, preloadExpand;

    var regImg = /^img$/i;
    var regIframe = /^iframe$/i;

    var supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

    var shrinkExpand = 0;
    var currentExpand = 0;
    var lowRuns = 0;

    var isLoading = 0;

    var checkElementsIndex = 0;

    var resetPreloading = function(e){
      isLoading--;
      if(e && e.target){
        addRemoveLoadEvents(e.target, resetPreloading);
      }

      if(!e || isLoading < 0 || !e.target){
        isLoading = 0;
      }
    };

    var isNestedVisible = function(elem, elemExpand){
      var outerRect;
      var parent = elem;
      var visible = getCSS(elem, 'visibility') != 'hidden';

      eLtop -= elemExpand;
      eLbottom += elemExpand;
      eLleft -= elemExpand;
      eLright += elemExpand;

      while(visible && (parent = parent.offsetParent)){
        visible = (isCompleted && isLoading < 2) || ((getCSS(parent, 'opacity') || 1) > 0);

        if(visible && getCSS(parent, 'overflow') != 'visible'){
          outerRect = parent.getBoundingClientRect();
          visible = eLright > outerRect.left &&
          eLleft < outerRect.right &&
          eLbottom > outerRect.top - 1 &&
          eLtop < outerRect.bottom + 1
          ;
        }
      }
      return visible;
    };

    var checkElements = function() {
      var i, start, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

      var eLlen = lazyloadElems.length;

      if(eLlen && (loadMode = lazySizesConfig.loadMode)){
        start = Date.now();

        i = checkElementsIndex;

        lowRuns++;

        if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 5 && loadMode > 2){
          currentExpand = preloadExpand;
          lowRuns = 0;
        } else if(currentExpand != defaultExpand && loadMode > 1 && lowRuns > 4){
          currentExpand = defaultExpand;
        } else {
          currentExpand = shrinkExpand;
        }

        for(; i < eLlen; i++, checkElementsIndex++){

          if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

          if(!supportScroll){unveilElement(lazyloadElems[i]);continue;}

          if(!(elemExpandVal = lazyloadElems[i].getAttribute('data-expand')) || !(elemExpand = elemExpandVal * 1)){
            elemExpand = currentExpand;
          }

          if(isLoading > 6 && (!elemExpandVal || ('src' in lazyloadElems[i]))){continue;}

          if(elemExpand > shrinkExpand && (loadMode < 2 || isLoading > 3)){
            elemExpand = shrinkExpand;
          }

          if(beforeExpandVal !== elemExpand){
            eLvW = innerWidth + elemExpand;
            elvH = innerHeight + elemExpand;
            elemNegativeExpand = elemExpand * -1;
            beforeExpandVal = elemExpand;
          }

          rect = lazyloadElems[i].getBoundingClientRect();

          if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
            (eLtop = rect.top) <= elvH &&
            (eLright = rect.right) >= elemNegativeExpand &&
            (eLleft = rect.left) <= eLvW &&
            (eLbottom || eLright || eLleft || eLtop) &&
            ((isCompleted && currentExpand < preloadExpand && isLoading < 3 && lowRuns < 4 && !elemExpandVal && loadMode > 2) || isNestedVisible(lazyloadElems[i], elemExpand))){
            checkElementsIndex--;
            start += 2;
            unveilElement(lazyloadElems[i]);
            loadedSomething = true;
          } else  {
            if(Date.now() - start > 3){
              checkElementsIndex++;
              throttledCheckElements();
              return;
            }

            if(!loadedSomething && isCompleted && !autoLoadElem &&
              isLoading < 3 && lowRuns < 4 && loadMode > 2 &&
              (preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
              (preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i].getAttribute(lazySizesConfig.sizesAttr) != 'auto')))){
              autoLoadElem = preloadElems[0] || lazyloadElems[i];
            }
          }
        }

        checkElementsIndex = 0;

        if(autoLoadElem && !loadedSomething){
          unveilElement(autoLoadElem);
        }
      }
    };

    var throttledCheckElements = throttle(checkElements);

    var switchLoadingClass = function(e){
      addClass(e.target, lazySizesConfig.loadedClass);
      removeClass(e.target, lazySizesConfig.loadingClass);
      addRemoveLoadEvents(e.target, switchLoadingClass);
    };

    var changeIframeSrc = function(elem, src){
      try {
        elem.contentWindow.location.replace(src);
      } catch(e){
        elem.setAttribute('src', src);
      }
    };

    var unveilElement = function (elem, force){
      var sources, i, len, sourceSrcset, src, srcset, parent, isPicture, event, firesLoad, customMedia;

      var curSrc = elem.currentSrc || elem.src;
      var isImg = regImg.test(elem.nodeName);

      //allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
      var sizes = elem.getAttribute(lazySizesConfig.sizesAttr) || elem.getAttribute('sizes');
      var isAuto = sizes == 'auto';

      if( (isAuto || !isCompleted) && isImg && curSrc && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass)){return;}

      elem._lazyRace = true;

      if(!(event = triggerEvent(elem, 'lazybeforeunveil', {force: !!force})).defaultPrevented){

        if(sizes){
          if(isAuto){
            autoSizer.updateElem(elem, true);
          } else {
            elem.setAttribute('sizes', sizes);
          }
        }

        srcset = elem.getAttribute(lazySizesConfig.srcsetAttr);
        src = elem.getAttribute(lazySizesConfig.srcAttr);

        if(isImg) {
          parent = elem.parentNode;
          isPicture = regPicture.test(parent.nodeName || '');
        }

        firesLoad = event.details.firesLoad || (('src' in elem) && (srcset || src || isPicture));

        if(firesLoad){
          isLoading++;
          addRemoveLoadEvents(elem, resetPreloading, true);
          clearTimeout(resetPreloadingTimer);
          resetPreloadingTimer = setTimeout(resetPreloading, 3000);
        }

        if(isPicture){
          sources = parent.getElementsByTagName('source');
          for(i = 0, len = sources.length; i < len; i++){
            if( (customMedia = lazySizesConfig.customMedia[sources[i].getAttribute('data-media') || sources[i].getAttribute('media')]) ){
              sources[i].setAttribute('media', customMedia);
            }
            sourceSrcset = sources[i].getAttribute(lazySizesConfig.srcsetAttr);
            if(sourceSrcset){
              sources[i].setAttribute('srcset', sourceSrcset);
            }
          }
        }

        if(srcset){
          elem.setAttribute('srcset', srcset);
        } else if(src){
          if(regIframe.test(elem.nodeName)){
            changeIframeSrc(elem, src);
          } else {
            elem.setAttribute('src', src);
          }
        }

        addClass(elem, lazySizesConfig.loadingClass);
        addRemoveLoadEvents(elem, switchLoadingClass, true);
      }

      setTimeout(function(){
        if(elem._lazyRace){
          delete elem._lazyRace;
        }

        if(sizes == 'auto'){
          addClass(elem, lazySizesConfig.autosizesClass);
        }

        if(srcset || isPicture){
          updatePolyfill(elem, {src: src});
        }

        removeClass(elem, lazySizesConfig.lazyClass);

        //remove curSrc == (elem.currentSrc || elem.src) it's a workaround for FF. see: https://bugzilla.mozilla.org/show_bug.cgi?id=608261
        if( !firesLoad || (elem.complete && curSrc == (elem.currentSrc || elem.src)) ){
          if(firesLoad){
            resetPreloading(event);
          }
          switchLoadingClass(event);
        }
        elem = null;
      });
    };

    var onload = function(){
      var scrollTimer;
      var afterScroll = function(){
        lazySizesConfig.loadMode = 3;
        throttledCheckElements();
      };

      isCompleted = true;
      lowRuns += 8;

      lazySizesConfig.loadMode = 3;
      throttledCheckElements(true);

      addEventListener('scroll', function(){
        if(lazySizesConfig.loadMode == 3){
          lazySizesConfig.loadMode = 2;
        }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(afterScroll, 66);
      }, true);
    };

    return {
      _: function(){

        lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
        preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass + ' ' + lazySizesConfig.preloadClass);

        defaultExpand = lazySizesConfig.expand;
        preloadExpand = defaultExpand * lazySizesConfig.expFactor;

        addEventListener('scroll', throttledCheckElements, true);

        addEventListener('resize', throttledCheckElements, true);

        if(window.MutationObserver){
          new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
        } else {
          docElem.addEventListener('DOMNodeInserted', throttledCheckElements, true);
          docElem.addEventListener('DOMAttrModified', throttledCheckElements, true);
          setInterval(throttledCheckElements, 3000);
        }

        addEventListener('hashchange', throttledCheckElements, true);

        ['transitionstart', 'transitionend', 'load', 'focus', 'mouseover', 'animationend', 'click'].forEach(function(name){
          document.addEventListener(name, throttledCheckElements, true);
        });

        if(!(isCompleted = /d$|^c/.test(document.readyState))){
          addEventListener('load', onload);
          document.addEventListener('DOMContentLoaded', throttledCheckElements);
        } else {
          onload();
        }

        throttledCheckElements(lazyloadElems.length > 0);
      },
      checkElems: throttledCheckElements,
      unveil: unveilElement
    };
  })();


  var autoSizer = (function(){
    var autosizesElems;

    var sizeElement = function (elem, dataAttr){
      var width, sources, i, len, event;
      var parent = elem.parentNode;

      if(parent){
        width = getWidth(elem, parent);
        event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

        if(!event.defaultPrevented){
          width = event.details.width;

          if(width && width !== elem._lazysizesWidth){
            elem._lazysizesWidth = width;
            width += 'px';
            elem.setAttribute('sizes', width);

            if(regPicture.test(parent.nodeName || '')){
              sources = parent.getElementsByTagName('source');
              for(i = 0, len = sources.length; i < len; i++){
                sources[i].setAttribute('sizes', width);
              }
            }

            if(!event.details.dataAttr){
              updatePolyfill(elem, event.details);
            }
          }
        }
      }
    };

    var updateElementsSizes = function(){
      var i;
      var len = autosizesElems.length;
      if(len){
        i = 0;

        for(; i < len; i++){
          sizeElement(autosizesElems[i]);
        }
      }
    };

    var throttledUpdateElementsSizes = throttle(updateElementsSizes);

    return {
      _: function(){
        autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
        addEventListener('resize', throttledUpdateElementsSizes);
      },
      checkElems: throttledUpdateElementsSizes,
      updateElem: sizeElement
    };
  })();

  var init = function(){
    if(!init.i){
      init.i = true;
      autoSizer._();
      loader._();
    }
  };

  (function(){
    var prop;
    var lazySizesDefaults = {
      lazyClass: 'lazyload',
      loadedClass: 'lazyloaded',
      loadingClass: 'lazyloading',
      preloadClass: 'lazypreload',
      errorClass: 'lazyerror',
      autosizesClass: 'lazyautosizes',
      srcAttr: 'data-src',
      srcsetAttr: 'data-srcset',
      sizesAttr: 'data-sizes',
      //preloadAfterLoad: false,
      minSize: 50,
      customMedia: {},
      init: true,
      expFactor: 2,
      expand: 300,
      loadMode: 2
    };

    lazySizesConfig = window.lazySizesConfig || {};

    for(prop in lazySizesDefaults){
      if(!(prop in lazySizesConfig)){
        lazySizesConfig[prop] = lazySizesDefaults[prop];
      }
    }

    window.lazySizesConfig = lazySizesConfig;

    setTimeout(function(){
      if(lazySizesConfig.init){
        init();
      }
    });
  })();

  return {
    cfg: lazySizesConfig,
    autoSizer: autoSizer,
    loader: loader,
    init: init,
    uP: updatePolyfill,
    aC: addClass,
    rC: removeClass,
    hC: hasClass,
    fire: triggerEvent,
    gW: getWidth
  };
}));

/*jshint
  expr: true,
  sub: true
*/

(function(){




  // ^ Global Vars
  // -------------

  var root              = /firefox|trident/i.test(navigator.userAgent) ? document.documentElement : document.body,
      isMobile          = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent),
      windowHeight      = window.innerHeight,
      $html             = document.querySelector("html"),
      $body             = document.querySelector("body"),
      lazyLoad          = document.getElementsByClassName("js--lazy"),
      stateDomLoaded    = "state--dom-loaded",
      stateWindowLoaded = "state--window-loaded",
      lastScrollTop     = 0,
      scrollDelta       = 5,
      didScroll;





  // ^ preventDefault
  // ----------------

  function preventDefault(event) {
      event = event || window.event;
      event.preventDefault && event.preventDefault();
      event.returnValue = !1;
  }





  // ^ HTML Classes
  // --------------

  function ifHas3d() {
    if (!window.getComputedStyle) {
      return false;
    }

    var el = document.createElement('p'),
        has3d,
        transforms = {
          'webkitTransform':'-webkit-transform',
          'OTransform':'-o-transform',
          'msTransform':'-ms-transform',
          'MozTransform':'-moz-transform',
          'transform':'transform'
        };

    // Add it to the body to get the computed style.
    document.body.insertBefore(el, null);

    for (var t in transforms) {
      if (el.style[t] !== undefined) {
        el.style[t] = "translate3d(1px,1px,1px)";
        has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
      }
    }

    document.body.removeChild(el);

    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
  }





  // ^ DOM Loaded
  // ------------

  // add relevent classes to html depening on device
  // this is useful for applying different styles via css
  if (isMobile) {
    $html.classList.add("browser--handheld");
  } else {
    $html.classList.add("browser--desktop");
  }

  if (ifHas3d) {
    $html.classList.add("csstransforms3d");
  }


  // add a dom loaded class to the body to trigger css animations
  $html.classList.add(stateDomLoaded);
  $html.classList.remove("no-js");
  $html.classList.add("js");





  // ^ Window Load
  // -------------

  window.onLoad = function(event) {
    $html.classList.add(stateWindowLoaded);
  };





  // ^ Scroll
  // --------

  // window.onscroll = function(event) {
  //   didScroll = true;
  // };

  // // Limit the scroll functions to every 250ms
  // setInterval(function() {
  //   if (didScroll) {
  //     fadeElsOnScroll();
  //     didScroll = false;
  //   }
  // }, 250);

  // // Function to call on scroll (in setInterval)
  // function fadeElsOnScroll() {
  //   [].forEach.call(lazyLoad, function($image) {
  //     if ($image.getBoundingClientRect().top < (windowHeight*5)) {
  //       $image.setAttribute("src", $image.dataset.src);
  //     }
  //   });
  // }

  // // Fade in on view
  // fadeElsOnScroll();

  // var lastScrollY     = 0,
  //     ticking         = false;

  // /**
  //  * Callback for our scroll event - just
  //  * keeps track of the last scroll value
  //  */
  // function onScroll() {
  //   lastScrollY = window.scrollY;
  //   requestTick();
  // }

  // /**
  //  * Calls rAF if it's not already
  //  * been done already
  //  */
  // function requestTick() {
  //   if(!ticking) {
  //     requestAnimationFrame(update);
  //     ticking = true;
  //   }
  // }

  // /**
  //  * Our animation callback
  //  */
  // function update() {
  //   var $image   = null,
  //       imageTop = [],
  //       viewPort = windowHeight * 5,
  //       offset   = 0;

  //   // first loop is going to do all
  //   // the reflows (since we use offsetTop)
  //   for(var m = 0; m < lazyLoad.length; m++) {
  //     $image      = lazyLoad[m];
  //     imageTop[m] = $image.offsetTop;
  //   }

  //   // second loop is going to go through
  //   // the lazyLoad and switch the src attr
  //   // to the elements' data-src
  //   for(var m = 0; m < lazyLoad.length; m++) {
  //     $image = lazyLoad[m];
  //     if(lastScrollY > imageTop[m] - viewPort) {
  //       $image.setAttribute("src", $image.dataset.src);
  //     }
  //   }

  //   // allow further rAFs to be called
  //   ticking = false;
  // }

  // // only listen for scroll events
  // window.addEventListener('scroll', onScroll, false);





  // ^ Resize
  // --------

  window.onresize = function(event) {
    windowHeight = window.innerHeight;
  };





  // ^ Featured slider
  // -----------------

  // if the page has the slider, then run the code
  if (document.querySelectorAll('.js--slider').length >= 1) {
    // set up some variables
    var $slides = document.querySelectorAll('.js--slide'),
        $pager  = document.querySelectorAll('.slider-pagination__dot'),
        numOfSlides = $slides.length - 1,
        slideDuration = 4000;

    // start the index at the first slide
    var slideIndex = 0;

    // add active classes to first slide
    $slides[slideIndex].classList.add('slide--active');
    $pager[slideIndex].classList.add('slider-pagination__dot--active');


    // remove and add classes
    function switchSlides() {
      // grab the current active elements
      var $activeSlide = document.querySelector('.slide--active'),
          $activePager = document.querySelector('.slider-pagination__dot--active');

      // increment the current slide index to move to the next slide
      if (slideIndex < numOfSlides) {
        slideIndex = slideIndex + 1;
      }
      // or loop back round to the first slide if the end
      else if (slideIndex >= numOfSlides) {
        slideIndex = 0
      }

      // remove current active classes
      $activeSlide.classList.remove('slide--active');
      $activePager.classList.remove('slider-pagination__dot--active');

      // add them to the next slide
      $slides[slideIndex].classList.add('slide--active');
      $pager[slideIndex].classList.add('slider-pagination__dot--active');
    }


    // set up an interval as a variable to kill it in next step
    var slideTimer = setInterval(function() {
      switchSlides();
    }, slideDuration);


    // loop over each pager dot
    [].forEach.call($pager, function($pagerDot, index) {
      // on each click
      $pagerDot.onclick = function(event) {
        event.preventDefault();

        // kill the current interval
        clearTimeout(slideTimer);

        // set the slideIndex to the clicked pager dot
        slideIndex = index;

        // grab the current active elements
        var $activeSlide = document.querySelector('.slide--active'),
            $activePager = document.querySelector('.slider-pagination__dot--active');

        // remove current active classes
        $activeSlide.classList.remove('slide--active');
        $activePager.classList.remove('slider-pagination__dot--active');

        // add them to the next slide
        $slides[slideIndex].classList.add('slide--active');
        $pager[slideIndex].classList.add('slider-pagination__dot--active');

        // restart the slide interval timer
        slideTimer = setInterval(function() {
          switchSlides();
        }, slideDuration);
      };
    });
  }





  // ^ Instagram Links
  // -----------------

  var $igLinks = document.querySelectorAll('.js--ig-link');

  if (isMobile) {
    console.log("I'm mobile");

    [].forEach.call($igLinks, function($link, index) {
      $link.setAttribute("href", "instagram://user?username=samkingphoto");
    });
  }





  // ^ Lightbox
  // --------------

  // var $media = document.querySelectorAll('.js--media');

  // [].forEach.call($media, function($singleMedia, index) {
  //   $singleMedia.onclick = function(event) {
  //     var currentImageSrc = this.getElementsByTagName("img")[0].dataset.src;

  //     console.log("Current image: " + currentImageSrc);

  //     openLightbox(currentImageSrc, index);
  //   };
  // });


  // function openLightbox(imageSrc, currentIndex) {
  //   var maxLength = $media.length - 1;

  //   var $overlay        = document.createElement('div'),
  //       $overlayContent = document.createElement('div'),
  //       $overlayNav     = document.createElement('div'),
  //       $overlayNavPrev = document.createElement('a'),
  //       $overlayNavNext = document.createElement('a');

  //   setTimeout(function() {
  //     document.body.classList.add('overlay-open');
  //   }, 10);

  //   $overlay.classList.add('overlay');
  //   $overlayContent.classList.add('overlay__content');
  //   $overlayNav.classList.add('overlay__navigation');
  //   $overlayNavPrev.classList.add('overlay__prev');
  //   $overlayNavNext.classList.add('overlay__next');

  //   $overlayNavPrev.href = "#";
  //   $overlayNavNext.href = "#";
  //   $overlayNavPrev.text = "Prev";
  //   $overlayNavNext.text = "Next";

  //   // Create the overlay in the DOM
  //   $overlayNav.appendChild($overlayNavPrev);
  //   $overlayNav.appendChild($overlayNavNext);
  //   $overlay.appendChild($overlayContent);
  //   $overlay.appendChild($overlayNav);
  //   document.body.appendChild($overlay);


  //   // Set the lightbox image to be the one clicked
  //   $overlayContent.setAttribute("style", "background-image: url(" + imageSrc + ")");


  //   function overlayStartEnd() {
  //     if (currentIndex == 0) {
  //       $overlay.classList.add('overlay--start');
  //     } else {
  //       $overlay.classList.remove('overlay--start');
  //     }

  //     if (currentIndex == maxLength) {
  //       $overlay.classList.add('overlay--end');
  //     } else {
  //       $overlay.classList.remove('overlay--end');
  //     }
  //   }

  //   overlayStartEnd();


  //   // Next and previous
  //   function changeImage(direction) {
  //     var canChange = false;

  //     if (direction == 'prev' && currentIndex > 0) {
  //       canChange = true;
  //       currentIndex = currentIndex - 1
  //     } else if (direction == 'next' && currentIndex < maxLength) {
  //       canChange = true;
  //       currentIndex = currentIndex + 1
  //     }

  //     if (canChange) {
  //       changeTo = document.getElementsByClassName("js--media")[currentIndex]
  //       imageSrc = changeTo.getElementsByTagName("img")[0].dataset.src;

  //       overlayStartEnd();

  //       $overlayContent.setAttribute("style", "background-image: url(" + imageSrc + ")");
  //     }
  //   }


  //   // Close the lightbox
  //   $overlay.onclick = function() {
  //     // closeLightbox($overlay);
  //   }

  //   $overlayNavPrev.onclick = function() {
  //     changeImage('prev');
  //   }

  //   $overlayNavNext.onclick = function() {
  //     changeImage('next');
  //   }
  // }

  // function closeLightbox(overlayToClose) {
  //   document.body.classList.add('overlay-closing');
  //   setTimeout(function() {
  //     document.body.classList.remove('overlay-open');
  //     document.body.classList.remove('overlay-closing');
  //     overlayToClose.remove();
  //   }, 300);
  // }





  // ^ Back to top
  // -------------

  var links = document.querySelectorAll("a.js--to-top");
  var i = links.length;

  var easeInOutCubic = function(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b
    return c/2*((t-=2)*t*t + 2) + b
  }

  while (i--) {
    links.item(i).addEventListener("click", function(e) {
      var startTime;
      var startPos = root.scrollTop;
      var endPos = document.getElementById(/[^#]+$/.exec(this.href)[0]).getBoundingClientRect().top;
      var maxScroll = root.scrollHeight - window.innerHeight;
      var scrollEndValue = startPos + endPos < maxScroll ? endPos : maxScroll - startPos;
      var duration = 500;

      var scroll = function(timestamp) {
        startTime = startTime || timestamp;
        var elapsed = timestamp - startTime;
        var progress = easeInOutCubic(elapsed, startPos, scrollEndValue, duration);
        root.scrollTop = progress;
        elapsed < duration && requestAnimationFrame(scroll);
      }

      requestAnimationFrame(scroll);
      e.preventDefault();

    });
  }


  // ^ 3rd Party
  // -----------





})();
