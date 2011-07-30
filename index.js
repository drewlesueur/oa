(function() {
  var $, drews, log, nimble, severus, _, __useGetSet__;
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
  }, __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __set = function (obj, prop, val, meta) {
    if (meta === void 0) // if meta is undefined
      meta = true
    var set = __get(obj, "_set");
    if (meta && set && typeof obj == "object") {
      set(prop, val);
    } else {
      obj[prop] = val;  
    }
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  __useGetSet__ = true;
  $ = require("jquery");
  _ = require("underscore");
  drews = require("drews-mixins");
  nimble = require("nimble");
  severus = require("severus");
  __set(severus, "db", "officeatlas_dev");
  __set(drews, "bind", __get(drews, "on"));
  log = __get(drews, "log");
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
        __set(self, "map", __get(MapPageView, "init")());
        map = __get(self, "map");
        __get(drews, "on")(map, "submit", __get(self, "handleSubmit"));
        __get($(__get(document, "body")), "append")(__get(__get(self, "map"), "getDiv")());
        __get(Listing, "find")(function(error, listings) {
          return __get(_, "each")(listings, function(listing) {
            return __get(self, "addListing")(listing, {
              "save": false
            });
          });
        });
        __get(drews, "bind")(self, "modelviewvalchanged", function(model, prop, value) {
          return __set(model, prop, value);
        });
        return self;
      },
      name: "MapPagePresenter",
      handleSubmit: function(self, address) {
        return __get(__get(self, "map"), "lookup")(address, function(err, results) {
          var latlng;
          if (err) {
            return log("ERROR looking up address");
          }
          latlng = __get(__get(__get(results, 0), "geometry"), "location");
          return __get(self, "addListing")({
            lat: __get(latlng, "lat")(),
            lng: __get(latlng, "lng")(),
            address: address
          }, {
            editAddress: true
          });
        });
      },
      addListing: function(self, listing, options) {
        var listingView, listingViewInfo;
        log("adding pre listing");
        log(listing);
        listing = __get(Listing, "init")(listing);
        listingView = __get(ListingView, "init")(listing, {
          triggeree: self,
          editAddress: options != null ? __get(options, "editAddress") : void 0
        });
        __set(listing, "view", listingView);
        listingViewInfo = __get(__get(self, "map"), "addListing")(listing);
        if ((options != null ? __get(options, "save") : void 0) !== false) {
          return __get(listing, "save")();
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
        __get(el, "css")({
          width: "" + (__get($(window), "width")()) + "px",
          height: "" + (__get($(window), "height")()) + "px",
          position: 'absolute'
        });
        latLng = new google.maps.LatLng(33.4222685, -111.8226402);
        options = {
          zoom: 11,
          center: latLng,
          mapTypeId: __get(__get(__get(google, "maps"), "MapTypeId"), "ROADMAP")
        };
        map = new google.maps.Map(__get(el, 0), options);
        self = {
          _type: MapPageView,
          map: map,
          el: el
        };
        bar = __get(SearchBarView, "init")({
          triggeree: self
        });
        __get(el, "append")(__get(bar, "el"));
        __set(self, "bar", bar);
        return self;
      },
      getDiv: function(self) {
        return __get(__get(self, "map"), "getDiv")();
      },
      getCenter: function(self) {
        return __get(__get(self, "map"), "getCenter")();
      },
      getZoom: function(self) {
        return __get(__get(self, "map"), "getZoom")();
      },
      setLatLng: __bind(function(self, lat, lng) {
        return __get(__get(self, "map"), "setCenter")(new google.maps.LatLng(lat, lng));
      }, this),
      lookup: __bind(function(self, address, done) {
        var geocoder;
        geocoder = new google.maps.Geocoder();
        return __get(geocoder, "geocode")({
          address: address
        }, __bind(function(results, status) {
          if (status === __get(__get(__get(google, "maps"), "GeocoderStatus"), "OK")) {
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
        latlng = new google.maps.LatLng(__get(listing, "lat"), __get(listing, "lng"));
        marker = new google.maps.Marker({
          animation: __get(__get(__get(google, "maps"), "Animation"), "DROP"),
          position: latlng,
          title: __get(listing, "address"),
          icon: "http://office.the.tl/pin.png"
        });
        __get(marker, "setMap")(__get(self, "map"));
        __get(__get(self, "map"), "setCenter")(latlng);
        bubbleContent = __get(__get(listing, "view"), "getBubbleContent")();
        bubble = new google.maps.InfoWindow({
          content: bubbleContent,
          position: latlng
        });
        __get(__get(__get(google, "maps"), "event"), "addListener")(marker, 'click', function() {
          return __get(bubble, "open")(__get(self, "map"));
        });
        __get(__get(__get(google, "maps"), "event"), "addListener")(bubble, 'closeclick', function() {
          return __get(drews, "trigger")(__get(self, "map"), "bubbleclick", listing);
        });
        __set(__get(listing, "view"), "marker", marker);
        __set(__get(listing, "view"), "bubble", bubble);
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
      init: function(attrs) {
        var listing;
        if (__get(attrs, "_type") === Listing) {
          listing = attrs;
          return listing;
        } else {
          listing = {
            _type: Listing,
            attrs: attrs,
            nonAttrs: {}
          };
          return listing;
        }
      },
      name: "Listing",
      notInAttrs: ["view"],
      _set: function(self, prop, value) {
        if (__indexOf.call(__get(self, "notInAttrs"), prop) >= 0) {
          __set(self, prop, value, false);
          return log(self);
        } else {
          __set(__get(self, "attrs"), prop, value);
          return __get(self, "save")();
        }
      },
      _get: function(self, prop) {
        return __get(__get(self, "attrs"), prop);
      },
      save: function(self, cb) {
        return __get(severus, "save")("listings", __get(self, "attrs"), function(error, _listing) {
          __get(_, "extend")(listing, _listing);
          return cb(error, listing);
        });
      },
      remove: function(self, cb) {
        return __get(severus, "remove")("listings", __get(self2, "_id"), cb);
      },
      find: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return __get(severus, "find").apply(severus, ["listings"].concat(__slice.call(args)));
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
        __set(self, "triggeree", (options != null ? __get(options, "triggeree") : void 0) || self);
        return self;
      },
      name: "Listing View",
      getBubbleContent: function(self) {
        var form, formHtml, listing, model;
        listing = __get(self, "model");
        if (__get(self, "bubbleContent")) {
          return __get(self, "bubbleContent");
        }
        model = __get(self, "model");
        formHtml = require("bubble-view");
        form = __get(EditableForm, "init")(formHtml, listing, {
          triggeree: __get(self, "triggeree")
        });
        __set(self, "form", form);
        if (typeof options !== "undefined" && options !== null ? __get(options, "editAddress") : void 0) {
          __get(__get(self, "form"), "makeEditable")("address");
        }
        return __get(__get(form, "el"), 0);
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
        __set(self, "triggeree", (options != null ? __get(options, "triggeree") : void 0) || self);
        htmlValues = __get(__get(self, "el"), "find")("[data-prop]");
        __get(drews, "eachArray")(htmlValues, function(el) {
          var key;
          el = $(el);
          key = __get(el, "attr")("data-prop");
          return __get(el, "text")(__get(model, key) || ("[" + key + "]"));
        });
        __get(self, "clickToMakeEditable")(__get(__get(self, "el"), "find")(".editable"));
        return self;
      },
      name: "Editable form",
      clickToMakeEditable: function(self, els) {
        return __get(els, "bind")("click", function(e) {
          var prop;
          prop = __get($(this), "attr")("data-prop");
          return __get(self, "makeEditable")(prop);
        });
      },
      makeEditable: function(self, prop) {
        var el, replacer, saveIt, value;
        if (__get(self, "editing")) {
          return;
        }
        el = __get(__get(self, "el"), "find")("[data-prop='" + prop + "']");
        value = __get(el, "text")();
        replacer = $("<input type=\"text\" data-prop=\"" + prop + "\" value=\"" + value + "\">");
        saveIt = function() {
          var newValue;
          __set(self, "editing", false);
          newValue = __get(replacer, "val")();
          __get(el, "html")("");
          __get(el, "text")(newValue);
          return __get(drews, "trigger")(__get(self, "triggeree"), "modelviewvalchanged", __get(self, "model"), prop, newValue);
        };
        __get(replacer, "bind")("keyup", function(e) {
          if (__get(e, "keyCode") === 13) {
            return saveIt();
          }
        });
        __get(replacer, "bind")("blur", function(e) {
          return saveIt();
        });
        __get(el, "html")(replacer);
        __set(self, "editing", true);
        __get(__get(replacer, 0), "focus")();
        return __get(__get(replacer, 0), "select")();
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
        __get(el, "css")({
          position: "absolute",
          "z-index": 600,
          left: "300px"
        });
        bar = {
          _type: SearchBarView,
          el: el
        };
        if (options != null) {
          __get(options, "triggeree") || (__set(options, "triggeree", bar));
        }
        triggeree = __get(options, "triggeree");
        __get(el, "submit")(function(e) {
          __get(e, "preventDefault")();
          __get(drews, "trigger")(triggeree, "submit", __get(__get(el, "find")(".search"), "val")());
          return __get(__get(el, "find")(".search"), "val")("");
        });
        return bar;
      },
      name: "SearchBarView"
    };
  });
}).call(this);
