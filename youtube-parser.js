(function() {
  var __set = function (obj, prop, val, meta) {
    if (meta === void 0) // if meta is undefined
      meta = true
    var set = __get(obj, "_set");
    if (meta && set && typeof obj == "object") {
      set(prop, val);
    } else {
      obj[prop] = val;  
    }
  }, __get = function (obj, property, dontBindObj, childObj, debug) {
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
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("youtube-parser", function() {
    var $, createIframe, drews, exports, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    exports = {};
    __set(exports, "exampleEmbed", '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
    createIframe = function(yt) {
      return "<iframe class=\"video-iframe\" width=\"" + __get(yt, "width") + "\" height=\"" + __get(yt, "height") + "\" src=\"http://www.youtube.com/embed/" + __get(yt, "id") + "?autoplay=1\"></iframe>";
    };
    __set(exports, "createIframe", createIframe);
    __set(exports, "init", function(youtubeEmbed) {
      var heightMatches, matches, widthMatches, yt;
      yt = {};
      __set(yt, "embed", youtubeEmbed);
      matches = null;
      if (matches = __get(__get(yt, "embed"), "match")(/embed\/([^\"\?]*)(\"|\?)/)) {
        __set(yt, "id", __get(matches, 1));
        widthMatches = __get(__get(yt, "embed"), "match")(/width="(\d+)"/);
        heightMatches = __get(__get(yt, "embed"), "match")(/height="(\d+)"/);
        if (widthMatches) {
          __set(yt, "width", __get(widthMatches, 1));
        }
        if (heightMatches) {
          __set(yt, "height", __get(heightMatches, 1));
        }
        return __set(yt, "embed", createIframe(yt));
      } else if (matches = __get(__get(yt, "embed"), "match")(/v=([^\&]*)\&/)) {
        __set(yt, "id", __get(matches, 1));
        __set(yt, "link", __get(yt, "embed"));
        __set(yt, "width", 425);
        __set(yt, "height", 349);
        return __set(yt, "embed", createIframe(yt));
      } else if (matches = __get(__get(yt, "embed"), "match")(/\/([^\/]*)$/)) {
        __set(yt, "id", __get(matches, 1));
        __set(yt, "link", __get(yt, "embed"));
        __set(yt, "width", 425);
        __set(yt, "height", 349);
        return __set(yt, "embed", createIframe(yt));
      }
    });
    __set(exports, "getLittleImage", __bind(function(numb) {
      if (!__get(yt, "id")) {
        return null;
      }
      if (!__get(_, "isNumber")(numb)) {
        numb = 1;
      }
      return "http://img.youtube.com/vi/" + __get(yt, "id") + "/" + numb + ".jpg";
    }, this));
    return __set(exports, "getBigImage", __bind(function() {
      if (!__get(yt, "id")) {
        return null;
      }
      return "http://img.youtube.com/vi/" + __get(yt, "id") + "/0.jpg";
    }, this));
  });
}).call(this);
