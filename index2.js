(function() {
  var $, __useLookup__;
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
    log = _.log, extend = _.extend;
    trigger = drews.trigger, bind = drews["on"], m = drews.meta, p = drews.polymorphic;
    barHeight = 50;
    map = null;
    type = drews.metaMaker("type");
    handleSubmit = function(address) {
      return gmap.lookup(address, function(err, results) {
        var latlng, listing, listingView, listingViewInfo;
        if (err) {
          return log("ERROR looking up address");
        }
        latlng = results[0].geometry.location;
        listing = Listing.init({
          lat: latlng.lat(),
          lng: latlng.lng(),
          address: address
        });
        listingView = ListingView.init(listing);
        return listingViewInfo = gmap.addListing(map, listing);
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
      map = gmap.makeMap();
      bar = barView.init();
      bind(map, "markerclick", handleMarkerClick);
      bind(map, "bubbleclick", handleBubbleClick);
      bind(bar, "submit", handleSubmit);
      log("the map is");
      log(map);
      $(document.body).append(gmap.getDiv(map));
      $(document.body).append(bar.el);
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
    return officePresenter.init();
  });
}).call(this);
