(function() {
  var $;
  define("office-atlas", function() {
    var $, Listing, barHeight, barView, bind, drews, gmap, handleSubmit, init, log, m, map, nimble, trigger, view, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    gmap = require("gmap");
    barView = require("barview");
    Listing = require("listing");
    log = _.log;
    trigger = drews.trigger, bind = drews["on"], m = drews.meta;
    barHeight = 50;
    map = null;
    view = function(obj) {
      return (m(obj)).view || ((m(obj)).view = {});
    };
    handleSubmit = function(address) {
      return gmap.lookup(address, function(err, results) {
        var latlng, listing, listingViewInfo;
        if (err) {
          return log("ERROR looking up address");
        }
        latlng = results[0].geometry.location;
        log(latlng);
        listing = {
          lat: latlng.lat(),
          lng: latlng.lng(),
          address: address
        };
        listing = Listing.init(listing);
        view(listing);
        listingViewInfo = gmap.addListing(map, listing);
        return extend(view(listing), listingViewInfo);
      });
    };
    init = function() {
      var bar;
      map = gmap.makeMap();
      bar = barView.init();
      bind(bar, "submit", handleSubmit);
      $(document.body).append(gmap.getDiv(map));
      $(document.body).append(bar.el);
      return log(bar.el);
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
