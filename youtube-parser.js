(function() {
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
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("youtube-parser", function() {
    var $, createIframe, drews, exports, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    exports = {};
    exports.exampleEmbed = '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>';
    createIframe = function(yt) {
      return "<iframe class=\"video-iframe\" width=\"" + __lookup(yt, "width") + "\" height=\"" + __lookup(yt, "height") + "\" src=\"http://www.youtube.com/embed/" + __lookup(yt, "id") + "?autoplay=1\"></iframe>";
    };
    exports.createIframe = createIframe;
    exports.init = function(youtubeEmbed) {
      var heightMatches, matches, widthMatches, yt;
      yt = {};
      yt.embed = youtubeEmbed;
      matches = null;
      if (matches = __lookup(__lookup(yt, "embed"), "match")(/embed\/([^\"\?]*)(\"|\?)/)) {
        yt.id = __lookup(matches, 1);
        widthMatches = __lookup(__lookup(yt, "embed"), "match")(/width="(\d+)"/);
        heightMatches = __lookup(__lookup(yt, "embed"), "match")(/height="(\d+)"/);
        if (widthMatches) {
          yt.width = __lookup(widthMatches, 1);
        }
        if (heightMatches) {
          yt.height = __lookup(heightMatches, 1);
        }
        return yt.embed = createIframe(yt);
      } else if (matches = __lookup(__lookup(yt, "embed"), "match")(/v=([^\&]*)\&/)) {
        yt.id = __lookup(matches, 1);
        yt.link = __lookup(yt, "embed");
        yt.width = 425;
        yt.height = 349;
        return yt.embed = createIframe(yt);
      } else if (matches = __lookup(__lookup(yt, "embed"), "match")(/\/([^\/]*)$/)) {
        yt.id = __lookup(matches, 1);
        yt.link = __lookup(yt, "embed");
        yt.width = 425;
        yt.height = 349;
        return yt.embed = createIframe(yt);
      }
    };
    exports.getLittleImage = __bind(function(numb) {
      if (!__lookup(yt, "id")) {
        return null;
      }
      if (!__lookup(_, "isNumber")(numb)) {
        numb = 1;
      }
      return "http://img.youtube.com/vi/" + __lookup(yt, "id") + "/" + numb + ".jpg";
    }, this);
    return exports.getBigImage = __bind(function() {
      if (!__lookup(yt, "id")) {
        return null;
      }
      return "http://img.youtube.com/vi/" + __lookup(yt, "id") + "/0.jpg";
    }, this);
  });
}).call(this);
