(function() {
  var $, drews, log, nimble, _, __useLookup__;
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
  $ = require("jquery");
  _ = require("underscore");
  drews = require("drews-mixins");
  nimble = require("nimble");
  log = __lookup(drews, "log");
  define("map-page-presenter", function() {
    var Listing, ListingView, MapPagePresenter, MapPageView;
    MapPageView = require("map-page-view");
    Listing = require("listing");
    ListingView = require("listing-view");
    return MapPagePresenter = {
      init: function() {
        var map, presenter;
        presenter = {
          _type: MapPagePresenter
        };
        presenter.map = __lookup(MapPageView, "init")();
        map = __lookup(presenter, "map");
        __lookup(drews, "on")(map, "submit", __lookup(presenter, "handleSubmit"));
        __lookup($(__lookup(document, "body")), "append")(__lookup(__lookup(presenter, "map"), "getDiv")());
        return presenter;
      },
      handleSubmit: function(presenter, address) {
        return __lookup(__lookup(presenter, "map"), "lookup")(address, function(err, results) {
          var latlng;
          if (err) {
            return log("ERROR looking up address");
          }
          latlng = __lookup(__lookup(__lookup(results, 0), "geometry"), "location");
          return __lookup(presenter, "addListing")({
            lat: __lookup(latlng, "lat")(),
            lng: __lookup(latlng, "lng")(),
            address: address
          });
        });
      },
      addListing: function(presenter, listing) {
        var listingView, listingViewInfo;
        listing = __lookup(Listing, "init")({
          lat: __lookup(listing, "lat"),
          lng: __lookup(listing, "lng"),
          address: __lookup(listing, "address")
        });
        listingView = __lookup(ListingView, "init")(listing);
        listing.view = listingView;
        return listingViewInfo = __lookup(__lookup(presenter, "map"), "addListing")(listing);
      }
    };
  });
  define("map-page-view", function() {
    var MapPageView, SearchBarView;
    SearchBarView = require("search-bar-view");
    return MapPageView = {
      init: function(el) {
        var bar, latLng, map, mapPageView, options;
        if (el == null) {
          el = $("<div class=\"map\"></div>", options);
        }
        options || (options = {
          barView: "search-bar-view"
        });
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
        map = new google.maps.Map(__lookup(el, 0), options);
        mapPageView = {
          _type: MapPageView,
          map: map,
          el: el
        };
        bar = __lookup(SearchBarView, "init")({
          triggerer: mapPageView
        });
        __lookup(el, "append")(__lookup(bar, "el"));
        mapPageView.bar = bar;
        return mapPageView;
      },
      getDiv: function(self) {
        return __lookup(__lookup(self, "map"), "getDiv")();
      },
      getCenter: function(self) {
        return __lookup(__lookup(self, "map"), "getCenter")();
      },
      getZoom: function(self) {
        return __lookup(__lookup(self, "map"), "getZoom")();
      },
      setLatLng: __bind(function(self, lat, lng) {
        return __lookup(__lookup(self, "map"), "setCenter")(new google.maps.LatLng(lat, lng));
      }, this),
      lookup: __bind(function(self, address, done) {
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
      }, this),
      addListing: __bind(function(self, listing, d) {
        var bubble, bubbleContent, latlng, marker;
        if (d == null) {
          d = function() {};
        }
        latlng = new google.maps.LatLng(__lookup(listing, "lat"), __lookup(listing, "lng"));
        marker = new google.maps.Marker({
          animation: __lookup(__lookup(__lookup(google, "maps"), "Animation"), "DROP"),
          position: latlng,
          title: __lookup(listing, "address"),
          icon: "http://office.the.tl/pin.png"
        });
        __lookup(marker, "setMap")(__lookup(self, "map"));
        __lookup(__lookup(self, "map"), "setCenter")(latlng);
        bubbleContent = __lookup(__lookup(listing, "view"), "getBubbleContent")();
        bubble = new google.maps.InfoWindow({
          content: bubbleContent,
          position: latlng
        });
        __lookup(__lookup(__lookup(google, "maps"), "event"), "addListener")(marker, 'click', function() {
          return __lookup(bubble, "open")(__lookup(self, "map"));
        });
        __lookup(__lookup(__lookup(google, "maps"), "event"), "addListener")(bubble, 'closeclick', function() {
          return __lookup(drews, "trigger")(__lookup(self, "map"), "bubbleclick", listing);
        });
        listing.view.marker = marker;
        listing.view.bubble = bubble;
        return {
          bubble: bubble,
          marker: marker
        };
      }, this)
    };
  });
  define("listing", function() {
    var Listing;
    return Listing = {
      init: function(listing) {
        listing._type = Listing;
        return listing;
      }
    };
  });
  define("listing-view", function() {
    var EditableForm, ListingView;
    EditableForm = require("editable-form");
    return ListingView = {
      init: function(listing) {
        var self;
        return self = {
          _type: ListingView,
          model: listing
        };
      },
      getBubbleContent: function(self) {
        var form, formHtml, listing, model;
        listing = __lookup(self, "model");
        if (__lookup(self, "bubbleContent")) {
          return __lookup(self, "bubbleContent");
        }
        model = __lookup(self, "model");
        formHtml = require("bubble-view");
        form = __lookup(EditableForm, "init")(formHtml, listing);
        self.form = form;
        __lookup(__lookup(self, "form"), "makeEditable")("address");
        return __lookup(__lookup(form, "el"), 0);
      }
    };
  });
  define("editable-form", function() {
    var EditableForm;
    return EditableForm = {
      init: function(html, values) {
        var htmlValues, self;
        self = {
          _type: EditableForm,
          el: $(html),
          _: "Editable form"
        };
        htmlValues = __lookup(__lookup(self, "el"), "find")("[data-prop]");
        log("the values are");
        log(htmlValues);
        __lookup(drews, "eachArray")(htmlValues, function(el) {
          var key;
          log(el);
          el = $(el);
          key = __lookup(el, "attr")("data-prop");
          return __lookup(el, "text")(__lookup(values, key) || ("[" + key + "]"));
        });
        __lookup(self, "clickToMakeEditable")(__lookup(__lookup(self, "el"), "find")(".editable"));
        return self;
      },
      clickToMakeEditable: function(self, els) {
        return __lookup(els, "bind")("click", function(e) {
          var prop;
          prop = __lookup($(this), "attr")("data-prop");
          return __lookup(self, "makeEditable")(prop);
        });
      },
      makeEditable: function(self, prop) {
        var el, replacer, value;
        el = __lookup(__lookup(self, "el"), "find")("[data-prop='" + prop + "']");
        log(el);
        value = __lookup(el, "text")();
        log("the value is " + value + ".");
        replacer = $("<input type=\"text\" data-prop=\"" + prop + "\" value=\"" + value + "\">");
        __lookup(replacer, "bind")("keyup", function(e) {
          if (__lookup(e, "keyCode") === 13) {
            __lookup(el, "text")(__lookup(replacer, "val")());
            __lookup(replacer, "replaceWith")(el);
            return __lookup(self, "clickToMakeEditable")(el);
          }
        });
        log(replacer);
        return __lookup(el, "replaceWith")(replacer);
      }
    };
  });
  define("search-bar-view", function() {
    var SearchBarView;
    return SearchBarView = {
      init: function(options) {
        var bar, triggerer;
        if (typeof el === "undefined" || el === null) {
          el = $("<div class=\"search-bar-view\">\n  <form class=\"search-form\">\n    <input class=\"search\" placeholder=\"\" />\n  </form>\n</div>");
        }
        __lookup(el, "css")({
          position: "absolute",
          "z-index": 600,
          left: "300px"
        });
        bar = {
          _type: SearchBarView,
          el: el
        };
        __lookup(options, "triggerer") || (options.triggerer = bar);
        triggerer = __lookup(options, "triggerer");
        __lookup(el, "submit")(function(e) {
          __lookup(e, "preventDefault")();
          __lookup(drews, "trigger")(triggerer, "submit", __lookup(__lookup(el, "find")(".search"), "val")());
          return __lookup(__lookup(el, "find")(".search"), "val")("");
        });
        return bar;
      }
    };
  });
}).call(this);
