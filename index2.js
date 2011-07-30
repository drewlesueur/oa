(function() {
  var $, __useLookup__;
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
  };
  __useLookup__ = true;
  define("office-atlas", function() {
    var $, Listing, ListingView, barHeight, barView, bind, drews, extend, gmap, handleBubbleClick, handleMarkerClick, handleSubmit, init, log, m, map, nimble, p, trigger, type, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    gmap = require("gmap");
    barView = require("barview");
    Listing = require("listing");
    ListingView = require("listing-view");
    log = __get(_, "log"), extend = __get(_, "extend");
    trigger = __get(drews, "trigger"), bind = __get(drews, "on"), m = __get(drews, "meta"), p = __get(drews, "polymorphic");
    barHeight = 50;
    map = null;
    type = __get(drews, "metaMaker")("type");
    handleSubmit = function(address) {
      return __get(gmap, "lookup")(address, function(err, results) {
        var latlng, listing, listingView, listingViewInfo;
        if (err) {
          return log("ERROR looking up address");
        }
        latlng = __get(__get(__get(results, 0), "geometry"), "location");
        listing = __get(Listing, "init")({
          lat: __get(latlng, "lat")(),
          lng: __get(latlng, "lng")(),
          address: address
        });
        listingView = __get(ListingView, "init")(listing);
        return listingViewInfo = __get(gmap, "addListing")(map, listing);
      });
    };
    handleMarkerClick = function(listing) {
      return alert("listing marker clicked");
    };
    handleBubbleClick = function(listing) {
      return alert("listing bubble clicked");
    };
    init = function() {
      var bar;
      map = __get(gmap, "makeMap")();
      bar = __get(barView, "init")();
      bind(map, "markerclick", handleMarkerClick);
      bind(map, "bubbleclick", handleBubbleClick);
      bind(bar, "submit", handleSubmit);
      log("the map is");
      log(map);
      __get($(__get(document, "body")), "append")(__get(gmap, "getDiv")(map));
      __get($(__get(document, "body")), "append")(__get(bar, "el"));
      return log("yo");
    };
    return {
      init: init
    };
  });
  $ = require("jquery");
  $(function() {
    var officePresenter;
    officePresenter = require("office-atlas");
    return __get(officePresenter, "init")();
  });
}).call(this);
