(function() {
  var __useLookup__;
  var __get = function (obj, property, dontBindObj, childObj, debug) {
    __slice = Array.prototype.slice
    if (property == "call" && "__original" in obj) {
      return function(){
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        thethis = args[0]
        theargs = args.slice(1)
        return obj.__original.apply(thethis, theargs)
      } 
    }
    if (property == "apply" && "__original" in obj) {
      return function(){
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        thethis = args[0]
        theargs = args[1]
        return obj.__original.apply(thethis, theargs)
      } 
    }
    var originalFunction = function(){}
    var isString = function(obj) {
      return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    };
    isUndefined = function(obj) {
      return obj === void 0;
    };
    var isFunction = function(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }; 
    var isRegExp = function(obj) {
      return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false)); 
    }
    var thissedFunction = function () {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      method = obj[property]
      if (method) {
        //todo make this conditional
        return method.apply(obj, args);
      } else {
        return
      }
    }
    if (typeof obj !== "object" && typeof obj !== "function") {
      if (isString(obj) && property === "length") {
        return obj.length;
      } else if (isRegExp(obj) && property === "source") {
        return obj.source
      } else if (typeof obj === "number") {
        return obj[property]
      } else if (obj[property] === void 0) { //might not need this one
        return
      } else {
        //thissedFunction.__original == ????
        return thissedFunction //everyting else is a function
      }
    }
    if (property in obj) {
      var ret = obj[property];  
      if (!dontBindObj && isFunction(ret)) {
        originalFunction = ret
        thissedFunction.__original = ret
        ret = thissedFunction
      }
      return ret
    } else if ("_get" in obj) {
      var usedObj = childObj || obj
      var ret = (obj._get(usedObj, property))
      if (!isUndefined(ret)) {
        return ret  
      }
    }
    var type = obj._type
    var hasTypeObj = (typeof type === "object") || (typeof type === "function");
    if (hasTypeObj) {
      var usedObj = childObj || obj;
      ret = __get(type, property, true, usedObj);
      if (!dontBindObj && isFunction(ret)) { //is don't bind obj needed here
        var fn = function () {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          args.unshift(usedObj)
          return ret.apply(usedObj, args)
        }
        fn.__original = ret
        return fn
      } else {
        return ret;
      }
  
    } else {
      return;
    }
  }, __set = function (obj, prop, val, meta) {
    if (meta === void 0) // if meta is undefined
      meta = true
    var set = __get(obj, "_set");
    if (meta && set && typeof obj == "object") {
      set(prop, val);
    } else {
      obj[prop] = val;  
    }
  };
  __useLookup__ = true;
  define("listing", function() {
    var $, bind, drews, each, exports, log, m, nimble, trigger, type, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = __get(drews, "trigger"), bind = __get(drews, "on"), log = __get(drews, "log"), m = __get(drews, "meta");
    drews;
    each = __get(_, "each");
    type = __get(drews, "metaMaker")("type");
    exports = {};
    __set(exports, "init", function(listing) {
      __set(listing, "_type", exports);
      return listing;
    });
    __set(exports, "jsonExclusions", ["view", "__mid"]);
    return exports;
  });
  define("listing-view", function() {
    var $, bind, drews, exports, log, nimble, trigger, youtubeParser, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    youtubeParser = require("youtube-parser");
    trigger = __get(drews, "trigger"), bind = __get(drews, "on"), log = __get(drews, "log");
    exports = {};
    __set(exports, "getBubbleContent", function(listingView) {
      var bigImage, content, height, image, listing, str, width, youtube;
      listing = __get(listingView, "model");
      youtube = __get(youtubeParser, "init")(__get(listing, "youtube"));
      bigImage = __get(youtube, "bigImage");
      width = __get(youtube, "width");
      height = __get(youtube, "height");
      if (bigImage && width) {
        image = "<img class=\"thumbnail\" src=\"" + bigImage + "\" style=\"width:" + width + "px;\;height:" + height + "px; position: relative\" />";
      } else {
        image = "";
      }
      str = "  <div style=\"position: relative;\" class=\"bubble-wrapper\" data-cid=\"" + "\" data-id=\"" + "\">\n  <div class=\"bubble-position\"></div>\n  " + __get(listing, "address") + "\n  <div class=\"youtube\">\n   " + image + "\n  </div>\n  <br />\n  <div class=\"notes\">\n    " + __get(listing, "notes") + "\n  </div>\n  <div class=\"squareFeet\">\n    " + __get(listing, "squareFeet") + "\n  </div>\n  <div class=\"price\">\n    " + __get(listing, "price") + "\n  </div>\n</div>";
      content = $(str);
      __get(__get(content, "find")("img.thumbnail"), "click")(function() {
        return trigger(map, "youtubeimageclick", listing);
      });
      return __set(listingView, "bubbleContent", __get(content, 0));
    });
    __set(exports, "init", function(listing) {
      return __set(listing, "view", {
        _type: exports
      });
    });
    return exports;
  });
}).call(this);
