(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("gmap", function() {
    var $, addListing, drews, getCenter, getDiv, getZoom, google, lookup, makeMap, map, nimble, self, setLatLng, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    google = require("google");
    self = {};
    map = null;
    makeMap = function(el) {
      var latLng, options;
      if (el == null) {
        el = $("<div id=\"map\"></div>");
      }
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
      return map;
    };
    getDiv = function(map) {
      return map.getDiv();
    };
    getCenter = function(map) {
      return map.getCenter();
    };
    getZoom = function(map) {
      return map.getZoom();
    };
    setLatLng = __bind(function(map, lat, lng) {
      return map.setCenter(new google.maps.LatLng(lat, lng));
    }, this);
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
    addListing = __bind(function(map, listing, d) {
      if (d == null) {
        d = function() {};
      }
      return drews.wait(10, function() {
        var bubble, latlng, marker;
        latlng = new google.maps.LatLng(listing.lat, listing.lng);
        marker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          position: latlng,
          title: listing.address,
          icon: "http://office.the.tl/pin.png"
        });
        marker.setMap(map);
        map.setCenter(latlng);
        bubble = new google.maps.InfoWindow({
          content: listing.view.getBubbleContent(),
          zIndex: 999999
        });
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
