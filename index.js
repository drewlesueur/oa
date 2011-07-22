(function() {
  var $, drews, log, nimble, severus, _, __useLookup__;
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
  severus = require("severus");
  severus.db = "officeatlas_dev";
  drews.bind = __lookup(drews, "on");
  log = __lookup(drews, "log");
  define("map-page-presenter", function() {
    var Listing, ListingView, MapPagePresenter, MapPageView;
    MapPageView = require("map-page-view");
    Listing = require("listing");
    ListingView = require("listing-view");
    return MapPagePresenter = {
      init: function() {
        var map, self;
        self = {
          _type: MapPagePresenter
        };
        self.map = __lookup(MapPageView, "init")();
        map = __lookup(self, "map");
        __lookup(drews, "on")(map, "submit", __lookup(self, "handleSubmit"));
        __lookup($(__lookup(document, "body")), "append")(__lookup(__lookup(self, "map"), "getDiv")());
        __lookup(Listing, "find")(function(error, listings) {
          return __lookup(_, "each")(listings, function(listing) {
            return __lookup(self, "addListing")(listing, {
              "save": false
            });
          });
        });
        __lookup(drews, "bind")(self, "modelviewvalchanged", function(model, prop, value) {
          alert("model view changed");
          model[prop] = value;
          return __lookup(model, "save")();
        });
        return self;
      },
      name: "MapPagePresenter",
      handleSubmit: function(self, address) {
        return __lookup(__lookup(self, "map"), "lookup")(address, function(err, results) {
          var latlng;
          if (err) {
            return log("ERROR looking up address");
          }
          latlng = __lookup(__lookup(__lookup(results, 0), "geometry"), "location");
          return __lookup(self, "addListing")({
            lat: __lookup(latlng, "lat")(),
            lng: __lookup(latlng, "lng")(),
            address: address
          });
        });
      },
      addListing: function(self, listing, options) {
        var listingView, listingViewInfo;
        listing = __lookup(Listing, "init")({
          lat: __lookup(listing, "lat"),
          lng: __lookup(listing, "lng"),
          address: __lookup(listing, "address")
        });
        listingView = __lookup(ListingView, "init")(listing, {
          triggeree: self
        });
        listing.view = listingView;
        listingViewInfo = __lookup(__lookup(self, "map"), "addListing")(listing);
        if ((options != null ? __lookup(options, "save") : void 0) !== false) {
          return __lookup(listing, "save")();
        }
      }
    };
  });
  define("map-page-view", function() {
    var MapPageView, SearchBarView;
    SearchBarView = require("search-bar-view");
    return MapPageView = {
      init: function(el) {
        var bar, latLng, map, options, self;
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
        self = {
          _type: MapPageView,
          map: map,
          el: el
        };
        bar = __lookup(SearchBarView, "init")({
          triggeree: self
        });
        __lookup(el, "append")(__lookup(bar, "el"));
        self.bar = bar;
        return self;
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
      addListing: __bind(function(self, listing, cb) {
        var bubble, bubbleContent, latlng, marker;
        if (cb == null) {
          cb = function() {};
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
      },
      name: "Listing",
      save: function(self, cb) {
        var self2;
        self2 = __lookup(_, "clone")(self);
        delete self2.view;
        delete self2._type;
        log("to save will be");
        log(self2);
        return __lookup(severus, "save")("listings", self2, cb);
      },
      remove: function(self, cb) {
        return __lookup(severus, "remove")("listings", __lookup(self2, "_id"), cb);
      },
      find: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return __lookup(severus, "find").apply(severus, ["listings"].concat(__slice.call(args)));
      }
    };
  });
  define("listing-view", function() {
    var EditableForm, ListingView;
    EditableForm = require("editable-form");
    return ListingView = {
      init: function(listing, options) {
        var self;
        self = {
          _type: ListingView,
          model: listing
        };
        self.triggeree = (options != null ? __lookup(options, "triggeree") : void 0) || self;
        return self;
      },
      name: "Listing View",
      getBubbleContent: function(self) {
        var form, formHtml, listing, model;
        listing = __lookup(self, "model");
        if (__lookup(self, "bubbleContent")) {
          return __lookup(self, "bubbleContent");
        }
        model = __lookup(self, "model");
        formHtml = require("bubble-view");
        form = __lookup(EditableForm, "init")(formHtml, listing, {
          triggeree: __lookup(self, "triggeree")
        });
        self.form = form;
        __lookup(__lookup(self, "form"), "makeEditable")("address");
        return __lookup(__lookup(form, "el"), 0);
      }
    };
  });
  define("editable-form", function() {
    var EditableForm;
    return EditableForm = {
      init: function(html, model, options) {
        var htmlValues, self;
        self = {
          _type: EditableForm,
          el: $(html),
          model: model
        };
        self.triggeree = (options != null ? __lookup(options, "triggeree") : void 0) || self;
        htmlValues = __lookup(__lookup(self, "el"), "find")("[data-prop]");
        __lookup(drews, "eachArray")(htmlValues, function(el) {
          var key;
          el = $(el);
          key = __lookup(el, "attr")("data-prop");
          return __lookup(el, "text")(__lookup(model, key) || ("[" + key + "]"));
        });
        __lookup(self, "clickToMakeEditable")(__lookup(__lookup(self, "el"), "find")(".editable"));
        return self;
      },
      name: "Editable form",
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
        value = __lookup(el, "text")();
        replacer = $("<input type=\"text\" data-prop=\"" + prop + "\" value=\"" + value + "\">");
        __lookup(replacer, "bind")("keyup", function(e) {
          if (__lookup(e, "keyCode") === 13) {
            __lookup(el, "text")(__lookup(replacer, "val")());
            __lookup(replacer, "replaceWith")(el);
            __lookup(self, "clickToMakeEditable")(el);
            log("triggering change on");
            log(__lookup(self, "triggeree"));
            return __lookup(drews, "trigger")(__lookup(self, "triggeree"), "modelviewvalchanged", __lookup(self, "model"), prop, value);
          }
        });
        __lookup(el, "replaceWith")(replacer);
        __lookup(__lookup(replacer, 0), "focus")();
        return __lookup(__lookup(replacer, 0), "select")();
      }
    };
  });
  define("search-bar-view", function() {
    var SearchBarView;
    return SearchBarView = {
      init: function(options) {
        var bar, triggeree;
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
        if (options != null) {
          __lookup(options, "triggeree") || (options.triggeree = bar);
        }
        triggeree = __lookup(options, "triggeree");
        __lookup(el, "submit")(function(e) {
          __lookup(e, "preventDefault")();
          __lookup(drews, "trigger")(triggeree, "submit", __lookup(__lookup(el, "find")(".search"), "val")());
          return __lookup(__lookup(el, "find")(".search"), "val")("");
        });
        return bar;
      },
      name: "SearchBarView"
    };
  });
}).call(this);
