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
  }, __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  __useLookup__ = true;
  define("gmap", function() {
    var $, addListing, bind, drews, extend, getCenter, getDiv, getZoom, google, log, lookup, m, makeMap, map, nimble, p, self, setLatLng, trigger, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    google = require("google");
    self = {};
    map = null;
    log = __lookup(_, "log"), extend = __lookup(_, "extend");
    trigger = __lookup(drews, "trigger"), bind = __lookup(drews, "on"), m = __lookup(drews, "meta"), p = __lookup(drews, "polymorphic");
    makeMap = function(el) {
      var latLng, options;
      if (el == null) {
        el = $("<div id=\"map\"></div>");
      }
      __lookup(el, "css")({
        width: "" + (__lookup($(window), "width")()) + "px",
        height: "" + (__lookup($(window), "height")()) + "px",
        position: 'absolute'
      });
      latLng = new google.maps.LatLng(33.4222685, -111.8226402);
      options = {
        zoom: 11,
        center: latLng,
        mapTypeId: __lookup(__lookup(__lookup(google, "maps"), "MapTypeId"), "ROADMAP")
      };
      log("what");
      map = new google.maps.Map(__lookup(el, 0), options);
      log("what2");
      return map;
    };
    getDiv = function(map) {
      return __lookup(map, "getDiv")();
    };
    getCenter = function(map) {
      return __lookup(map, "getCenter")();
    };
    getZoom = function(map) {
      return __lookup(map, "getZoom")();
    };
    setLatLng = __bind(function(map, lat, lng) {
      return __lookup(map, "setCenter")(new google.maps.LatLng(lat, lng));
    }, this);
    lookup = __bind(function(address, done) {
      var geocoder;
      geocoder = new google.maps.Geocoder();
      return __lookup(geocoder, "geocode")({
        address: address
      }, __bind(function(results, status) {
        if (status === __lookup(__lookup(__lookup(google, "maps"), "GeocoderStatus"), "OK")) {
          return done(null, results);
        } else {
          return done(status);
        }
      }, this));
    }, this);
    addListing = __bind(function(map, listing, d) {
      if (d == null) {
        d = function() {};
      }
      return __lookup(drews, "wait")(10, function() {
        var bubble, latlng, marker;
        latlng = new google.maps.LatLng(__lookup(listing, "lat"), __lookup(listing, "lng"));
        log("the lat lng is");
        log(latlng);
        marker = new google.maps.Marker({
          animation: __lookup(__lookup(__lookup(google, "maps"), "Animation"), "DROP"),
          position: latlng,
          title: __lookup(listing, "address"),
          icon: "http://office.the.tl/pin.png"
        });
        __lookup(marker, "setMap")(map);
        __lookup(map, "setCenter")(latlng);
        bubble = new google.maps.InfoWindow({
          content: __lookup(__lookup(listing, "view"), "getBubbleContent")(),
          zIndex: 999999
        });
        __lookup(__lookup(__lookup(google, "maps"), "event"), "addListener")(marker, 'click', function() {
          return trigger(map, "markerclick", listing);
        });
        __lookup(__lookup(__lookup(google, "maps"), "event"), "addListener")(bubble, 'closeclick', function() {
          return trigger(map, "bubbleclick", listing);
        });
        listing.view.marker = marker;
        listing.view.bubble = bubble;
        return {
          bubble: bubble,
          marker: marker
        };
      });
    }, this);
    return {
      makeMap: makeMap,
      getCenter: getCenter,
      getZoom: getZoom,
      setLatLng: setLatLng,
      getDiv: getDiv,
      addListing: addListing,
      lookup: lookup
    };
  });
}).call(this);
