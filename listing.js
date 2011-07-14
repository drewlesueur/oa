(function() {
  var __useLookup__;
  var __lookup = function (obj, property, dontBindObj, childObj, debug) {
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
    } else if ("_lookup" in obj) {
      var usedObj = childObj || obj
      var ret = (obj._lookup(usedObj, property))
      if (!isUndefined(ret)) {
        return ret  
      }
    }
    var type = obj._type
    var hasTypeObj = (typeof type === "object") || (typeof type === "function");
    if (hasTypeObj) {
      ret = __lookup(type, property, true, obj);
      if (!dontBindObj && isFunction(ret)) { //is don't bind obj needed here
        var fn = function () {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          args.unshift(obj)
          return ret.apply(obj, args)
        }
        fn.__original = ret
        return fn
      } else {
        return ret;
      }
  
    } else {
      return;
    }
  }, __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;
  __useLookup__ = true;
  define("listing", function() {
    var $, bind, drews, each, exports, log, m, nimble, trigger, type, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = __lookup(drews, "trigger"), bind = __lookup(drews, "on"), log = __lookup(drews, "log"), m = __lookup(drews, "meta");
    drews;
    each = __lookup(_, "each");
    type = __lookup(drews, "metaMaker")("type");
    exports = {};
    exports.init = function(listing) {
      listing._type = exports;
      return listing;
    };
    exports.jsonExclusions = ["view", "__mid"];
    return exports;
  });
  define("listing-view", function() {
    var $, bind, drews, exports, log, nimble, trigger, youtubeParser, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    youtubeParser = require("youtube-parser");
    trigger = __lookup(drews, "trigger"), bind = __lookup(drews, "on"), log = __lookup(drews, "log");
    exports = {};
    exports.getBubbleContent = function(listingView) {
      var bigImage, content, height, image, listing, str, width, youtube;
      listing = __lookup(listingView, "model");
      youtube = __lookup(youtubeParser, "init")(__lookup(listing, "youtube"));
      bigImage = __lookup(youtube, "bigImage");
      width = __lookup(youtube, "width");
      height = __lookup(youtube, "height");
      if (bigImage && width) {
        image = "<img class=\"thumbnail\" src=\"" + bigImage + "\" style=\"width:" + width + "px;\;height:" + height + "px; position: relative\" />";
      } else {
        image = "";
      }
      str = "  <div style=\"position: relative;\" class=\"bubble-wrapper\" data-cid=\"" + "\" data-id=\"" + "\">\n  <div class=\"bubble-position\"></div>\n  " + __lookup(listing, "address") + "\n  <div class=\"youtube\">\n   " + image + "\n  </div>\n  <br />\n  <div class=\"notes\">\n    " + __lookup(listing, "notes") + "\n  </div>\n  <div class=\"squareFeet\">\n    " + __lookup(listing, "squareFeet") + "\n  </div>\n  <div class=\"price\">\n    " + __lookup(listing, "price") + "\n  </div>\n</div>";
      content = $(str);
      __lookup(__lookup(content, "find")("img.thumbnail"), "click")(function() {
        return trigger(map, "youtubeimageclick", listing);
      });
      return listingView.bubbleContent = __lookup(content, 0);
    };
    exports.init = function(listing) {
      return listing.view = {
        _type: exports
      };
    };
    return exports;
  });
}).call(this);
