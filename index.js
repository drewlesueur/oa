(function() {
  var $, drews, log, nimble, severus, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  $ = require("jquery");
  _ = require("underscore");
  drews = require("drews-mixins");
  nimble = require("nimble");
  severus = require("severus");
  severus.db = "officeatlas_dev";
  drews.bind = drews.on;
  log = drews.log;
  define("map-page-presenter", function() {
    var listingMaker, listingViewMaker, mapPagePresenterMaker, mapPageViewMaker;
    mapPageViewMaker = require("map-page-view");
    listingMaker = require("listing");
    listingViewMaker = require("listing-view");
    return mapPagePresenterMaker = function() {
      var addListing, handleSubmit, map, self;
      self = {};
      map = mapPageViewMaker();
      self.map = map;
      drews.on(map, "submit", self.handleSubmit);
      $(document.body).append(self.map.getDiv());
      handleSubmit = function(address) {
        return map.lookup(address, function(err, results) {
          var latlng;
          if (err) {
            return log("ERROR looking up address");
          }
          latlng = results[0].geometry.location;
          return addListing({
            lat: latlng.lat(),
            lng: latlng.lng(),
            address: address
          }, {
            editAddress: true
          });
        });
      };
      self.handleSubmit = handleSubmit;
      addListing = function(listing, options) {
        var listingView, listingViewInfo;
        log("adding pre listing");
        log(listing);
        listing = listingMaker(listing);
        log("just created the listing and it's");
        log(listing);
        listingView = listingViewMaker(listing, {
          triggeree: self,
          editAddress: options != null ? options.editAddress : void 0
        });
        listing.view = listingView;
        listingViewInfo = map.addListing(listing);
        if ((options != null ? options.save : void 0) !== false) {
          return listing.save();
        }
      };
      self.addListing = addListing;
      listingMaker.find(function(error, listings) {
        return _.each(listings, function(listing) {
          return self.addListing(listing, {
            "save": false
          });
        });
      });
      drews.bind(self, "modelviewvalchanged", function(model, prop, value) {
        return model.set(prop, value);
      });
      return self;
    };
  });
  define("map-page-view", function() {
    var mapPageViewMaker, searchBarViewMaker;
    searchBarViewMaker = require("search-bar-view");
    return mapPageViewMaker = function(el) {
      var addListing, bar, getCenter, getDiv, getZoom, latLng, lookup, map, options, self, setLatLng;
      if (el == null) {
        el = $("<div class=\"map\"></div>", options);
      }
      options || (options = {
        barView: "search-bar-view"
      });
      el.css({
        width: "" + ($(window).width()) + "px",
        height: "" + ($(window).height()) + "px",
        position: 'absolute'
      });
      latLng = new google.maps.LatLng(33.4222685, -111.8226402);
      options = {
        zoom: 11,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(el[0], options);
      self = {
        map: map,
        el: el
      };
      bar = searchBarViewMaker({
        triggeree: self
      });
      el.append(bar.el);
      self.bar = bar;
      getDiv = function() {
        return map.getDiv();
      };
      self.getDiv = getDiv;
      getCenter = function() {
        return map.getCenter();
      };
      self.getCenter = getCenter;
      getZoom = function() {
        return map.getZoom();
      };
      self.getZoom = getZoom;
      setLatLng = __bind(function(lat, lng) {
        return map.setCenter(new google.maps.LatLng(lat, lng));
      }, this);
      self.setLatLng = setLatLng;
      lookup = __bind(function(address, done) {
        var geocoder;
        geocoder = new google.maps.Geocoder();
        return geocoder.geocode({
          address: address
        }, __bind(function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            return done(null, results);
          } else {
            return done(status);
          }
        }, this));
      }, this);
      self.lookup = lookup;
      addListing = __bind(function(listing, cb) {
        var bubble, bubbleContent, latlng, marker;
        if (cb == null) {
          cb = function() {};
        }
        latlng = new google.maps.LatLng(listing.lat, listing.lng);
        marker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          position: latlng,
          title: listing.address,
          icon: "http://office.the.tl/pin.png"
        });
        marker.setMap(map);
        map.setCenter(latlng);
        bubbleContent = listing.view.getBubbleContent();
        bubble = new google.maps.InfoWindow({
          content: bubbleContent,
          position: latlng
        });
        google.maps.event.addListener(marker, 'click', function() {
          return bubble.open(map);
        });
        google.maps.event.addListener(bubble, 'closeclick', function() {
          return drews.trigger(map, "bubbleclick", listing);
        });
        listing.view.marker = marker;
        listing.view.bubble = bubble;
        return {
          bubble: bubble,
          marker: marker
        };
      }, this);
      self.addListing = addListing;
      return self;
    };
  });
  define("listing", function() {
    var find, listingMaker;
    find = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return severus.find.apply(severus, ["listings"].concat(__slice.call(args)));
    };
    listingMaker = function(attrs) {
      var get, remove, save, self, set;
      self = {};
      self.attrs = attrs;
      _.extend(self, attrs);
      set = function(prop, value) {
        console.log("setting: " + prop + " to " + value);
        attrs[prop] = value;
        self[prop] = value;
        return save();
      };
      self.set = set;
      get = function(self, prop, value) {
        return self.attrs[prop];
      };
      save = function(cb) {
        if (cb == null) {
          cb = function() {};
        }
        log("saving");
        log(attrs);
        return severus.save("listings", attrs, function(error, _listing) {
          _.extend(attrs, _listing);
          return cb(error, self);
        });
      };
      self.save = save;
      remove = function(cb) {
        return severus.remove("listings", attrs._id, cb);
      };
      self.remove = remove;
      return self;
    };
    listingMaker.find = find;
    return listingMaker;
  });
  define("listing-view", function() {
    var editableFormMaker, listingViewMaker;
    editableFormMaker = require("editable-form");
    return listingViewMaker = function(listing, options) {
      var getBubbleContent, model, self, triggeree;
      model = listing;
      self = {};
      self.model = model;
      triggeree = self.triggeree = (options != null ? options.triggeree : void 0) || self;
      getBubbleContent = function() {
        var bubbleView, bubbleViewMaker, form;
        listing = model;
        if (self.bubbleContent) {
          return self.bubbleContent;
        }
        bubbleViewMaker = require("bubble-view");
        bubbleView = bubbleViewMaker({
          model: model,
          triggeree: triggeree
        });
        form = editableFormMaker(bubbleView.el, listing, {
          triggeree: triggeree
        });
        self.form = form;
        if (options != null ? options.editAddress : void 0) {
          form.makeEditable("address");
        }
        return form.el[0];
      };
      self.getBubbleContent = getBubbleContent;
      return self;
    };
  });
  define("editable-form", function() {
    var editableFormMaker;
    return editableFormMaker = function(html, model, options) {
      var clickToMakeEditable, el, htmlValues, makeEditable, self, triggeree;
      console.log("the html is");
      console.log(html);
      self = {
        el: $(html),
        model: model
      };
      el = self.el;
      self.triggeree = (options != null ? options.triggeree : void 0) || self;
      triggeree = self.triggeree;
      htmlValues = el.find("[data-prop]");
      drews.eachArray(htmlValues, function(_el) {
        var key;
        _el = $(_el);
        key = _el.attr("data-prop");
        return _el.text(model[key] || ("[" + key + "]"));
      });
      clickToMakeEditable = function(els) {
        return els.bind("click", function(e) {
          var prop;
          prop = $(this).attr("data-prop");
          return self.makeEditable(prop);
        });
      };
      self.clickToMakeEditable = clickToMakeEditable;
      clickToMakeEditable(el.find(".editable"));
      makeEditable = function(prop) {
        var replacer, saveIt, value, _el;
        if (self.editing) {
          return;
        }
        _el = el.find("[data-prop='" + prop + "']");
        value = _el.text();
        replacer = $("<input type=\"text\" data-prop=\"" + prop + "\" value=\"" + value + "\">");
        saveIt = function() {
          var newValue;
          self.editing = false;
          newValue = replacer.val();
          _el.html("");
          _el.text(newValue);
          console.log("triggering a save of " + prop + ", " + newValue + ".");
          console.log("the model is");
          console.log(model);
          return drews.trigger(triggeree, "modelviewvalchanged", model, prop, newValue);
        };
        replacer.bind("keyup", function(e) {
          if (e.keyCode === 13) {
            return saveIt();
          }
        });
        replacer.bind("blur", function(e) {
          return saveIt();
        });
        _el.html(replacer);
        self.editing = true;
        replacer[0].focus();
        return replacer[0].select();
      };
      self.makeEditable = makeEditable;
      return self;
    };
  });
  define("search-bar-view", function() {
    var searchBarViewMaker;
    return searchBarViewMaker = function(options) {
      var self, triggeree;
      if (typeof el === "undefined" || el === null) {
        el = $("<div class=\"search-bar-view\">\n  <form class=\"search-form\">\n    <input class=\"search\" placeholder=\"\" />\n  </form>\n</div>");
      }
      el.css({
        position: "absolute",
        "z-index": 600,
        left: "300px"
      });
      self = {
        el: el
      };
      if (options != null) {
        options.triggeree || (options.triggeree = self);
      }
      triggeree = options.triggeree;
      el.submit(function(e) {
        e.preventDefault();
        drews.trigger(triggeree, "submit", el.find(".search").val());
        return el.find(".search").val("");
      });
      return self;
    };
  });
}).call(this);
