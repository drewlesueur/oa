(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("map-page-view", function() {
    var $, drews, drewsEventMaker, mapPageViewMaker, nimble, searchBarViewMaker, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    searchBarViewMaker = require("search-bar-view");
    return mapPageViewMaker = function(el) {
      var addListing, bar, bind, getCenter, getDiv, getZoom, latLng, lookup, map, options, removeListing, self, setLatLng, trigger;
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
      self = drewsEventMaker(self);
      trigger = self.trigger, bind = self.on;
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
      removeListing = function(listing) {
        listing.view.marker.setMap(null);
        return listing.view.bubble.close();
      };
      self.removeListing = removeListing;
      addListing = __bind(function(listing, cb) {
        if (cb == null) {
          cb = function() {};
        }
        listing.view.marker.setMap(map);
        return map.setCenter(listing.view.latlng);
      }, this);
      self.addListing = addListing;
      return self;
    };
  });
}).call(this);
