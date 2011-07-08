(function() {
  var $;
  define("office-atlas", function() {
    var $, Listing, ListingView, band, barHeight, barView, bind, drews, extend, gmap, handleBubbleClick, handleMarkerClick, handleSubmit, init, log, m, map, nimble, p, stooges, trigger, type, view, _;
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
    view = function(obj) {
      return (m(obj)).view || ((m(obj)).view = {});
    };
    type = drews.metaMaker("type");
    band = {
      name: "aterciopelados"
    };
    band.size = 2;
    _.mixin({
      "test": function(x) {
        return "test" + x;
      }
    });
    log((p("testersony", "s"))(4, -1));
    stooges = [
      {
        name: 'curly',
        age: 25
      }, {
        name: 'moe',
        age: 21
      }, {
        name: 'larry',
        age: 23
      }
    ];
    log((p(stooges))("sortBy")(function(stooge) {
      return stooge.age;
    })(_.map)(function(s) {
      return s.name === "larry";
    })());
    handleSubmit = function(address) {
      return gmap.lookup(address, function(err, results) {
        var latlng, listing, listingView, listingViewInfo;
        if (err) {
          return log("ERROR looking up address");
        }
        latlng = results[0].geometry.location;
        listing = {
          lat: latlng.lat(),
          lng: latlng.lng(),
          address: address
        };
        listing = Listing.init(listing);
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
      $(document.body).append(gmap.getDiv(map));
      return $(document.body).append(bar.el);
    };
    return {
      init: init
    };
  });
  $ = require("jquery");
  $(function() {
    var officePresenter;
    return officePresenter = require("office-atlas");
  });
}).call(this);
