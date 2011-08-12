(function() {
  define("map-page-presenter", function() {
    var $, drews, drewsEventMaker, listingMaker, listingViewMaker, mapPagePresenterMaker, mapPageViewMaker, nimble, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    mapPageViewMaker = require("map-page-view");
    listingMaker = require("listing");
    listingViewMaker = require("listing-view");
    return mapPagePresenterMaker = function() {
      var addImages, addListing, deleteListing, handleSubmit, listings, map, self;
      self = drewsEventMaker({});
      map = mapPageViewMaker();
      self.map = map;
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
      map.on("submit", self.handleSubmit);
      addListing = function(listing, options) {
        var listingView;
        listing = listingMaker(listing);
        listingView = listingViewMaker(listing, {
          triggeree: map,
          editAddress: options != null ? options.editAddress : void 0
        });
        listing.view = listingView;
        map.addListing(listing);
        listing.presenter = self;
        listing.on("addimages", function(urls) {
          return listing.view.addImages(urls);
        });
        listing.on("deleted", function() {
          return map.removeListing(listing);
        });
        if ((options != null ? options.save : void 0) !== false) {
          listing.save();
        }
        return listing;
      };
      self.addListing = addListing;
      listings = [];
      self.listings = listings;
      listingMaker.find(function(error, _listings) {
        listings = _listings;
        return _.each(listings, function(listing, index) {
          return listings[index] = addListing(listing, {
            "save": false
          });
        });
      });
      map.on("modelviewvalchanged", function(model, prop, value) {
        return model.set(prop, value);
      });
      addImages = function(listing, urls) {
        console.log("called the add images function");
        console.log(listing);
        return listing.addImages(urls);
      };
      self.addImages = addImages;
      map.on("addimages", addImages);
      map.on("bubbleopen", function(_listing) {
        return _.each(listings, function(listing) {
          if (listing !== _listing) {
            return listing.view.bubble.close();
          }
        });
      });
      map.on("newbubble", function(listing, bubble) {
        return listing.view.bubble = bubble;
      });
      deleteListing = function(listing) {
        return listing.remove();
      };
      map.on("deletelisting", deleteListing);
      map.on("newmarker", function(listing, marker) {
        return listing.view.marker = marker;
      });
      return self;
    };
  });
}).call(this);
