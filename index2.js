(function() {
  var $, __useLookup__;
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
    log = __lookup(_, "log"), extend = __lookup(_, "extend");
    trigger = __lookup(drews, "trigger"), bind = __lookup(drews, "on"), m = __lookup(drews, "meta"), p = __lookup(drews, "polymorphic");
    barHeight = 50;
    map = null;
    type = __lookup(drews, "metaMaker")("type");
    handleSubmit = function(address) {
      return __lookup(gmap, "lookup")(address, function(err, results) {
        var latlng, listing, listingView, listingViewInfo;
        if (err) {
          return log("ERROR looking up address");
        }
        latlng = __lookup(__lookup(__lookup(results, 0), "geometry"), "location");
        listing = __lookup(Listing, "init")({
          lat: __lookup(latlng, "lat")(),
          lng: __lookup(latlng, "lng")(),
          address: address
        });
        listingView = __lookup(ListingView, "init")(listing);
        return listingViewInfo = __lookup(gmap, "addListing")(map, listing);
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
      map = __lookup(gmap, "makeMap")();
      bar = __lookup(barView, "init")();
      bind(map, "markerclick", handleMarkerClick);
      bind(map, "bubbleclick", handleBubbleClick);
      bind(bar, "submit", handleSubmit);
      log("the map is");
      log(map);
      __lookup($(__lookup(document, "body")), "append")(__lookup(gmap, "getDiv")(map));
      __lookup($(__lookup(document, "body")), "append")(__lookup(bar, "el"));
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
    return __lookup(officePresenter, "init")();
  });
}).call(this);
