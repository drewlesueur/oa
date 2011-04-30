var GoogleMap, Listing, ListingView, Listings, OfficeListController, OfficeListPresenter, isTesting, liteAlert;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
liteAlert = function(message) {
  return console.log(message);
};
isTesting = function() {
  var url;
  url = location.href.toString();
  return url.indexOf("test") !== -1;
};
GoogleMap = (function() {
  __extends(GoogleMap, Backbone.View);
  function GoogleMap(width, height) {
    this.handleDoneReloading = __bind(this.handleDoneReloading, this);;
    this.reloadListings = __bind(this.reloadListings, this);;
    this.removeListing = __bind(this.removeListing, this);;
    this.removeListings = __bind(this.removeListings, this);;
    this.addListings = __bind(this.addListings, this);;
    this.addListing = __bind(this.addListing, this);;    this.el = $(this.make("div"));
    this.el.css({
      width: screen.availWidth - 300 + "px",
      height: window.innerHeight + "px"
    });
    this.latLng = new google.maps.LatLng(-34.397, 150.644);
    this.options = {
      zoom: 8,
      center: this.latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.el[0], this.options);
  }
  GoogleMap.prototype.addListing = function(listing) {
    var bubble, latlng, marker;
    latlng = new google.maps.LatLng(listing.get('lat'), listing.get('lng'));
    marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: latlng,
      title: listing.get('address')
    });
    listing.view.marker = marker;
    marker.setMap(this.map);
    bubble = new google.maps.InfoWindow({
      content: "" + (listing.get('address')) + "\n<br />\n" + (listing.get('notes'))
    });
    listing.view.bubble = bubble;
    return google.maps.event.addListener(marker, 'click', function() {
      return listing.view.handleMarkerClick();
    });
  };
  GoogleMap.prototype.addListings = function(listings) {
    var listing, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = listings.length; _i < _len; _i++) {
      listing = listings[_i];
      _results.push(this.addListing(listing));
    }
    return _results;
  };
  GoogleMap.prototype.removeListings = function(listings) {
    var listing, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = listings.length; _i < _len; _i++) {
      listing = listings[_i];
      _results.push(this.removeListing(listing));
    }
    return _results;
  };
  GoogleMap.prototype.removeListing = function(listing) {
    var _ref, _ref2;
    if ((_ref = listing.view.marker) != null) {
      _ref.setMap(null);
    }
    return (_ref2 = listing.view.bubble) != null ? _ref2.setMap(null) : void 0;
  };
  GoogleMap.prototype.reloadListings = function() {
    return $('#reload-text').text("Reloading...");
  };
  GoogleMap.prototype.handleDoneReloading = function() {
    return $('#reload-text').text("");
  };
  return GoogleMap;
})();
Listing = (function() {
  __extends(Listing, Backbone.Model);
  function Listing() {
    Listing.__super__.constructor.apply(this, arguments);
  }
  return Listing;
})();
ListingView = (function() {
  __extends(ListingView, Backbone.View);
  function ListingView() {
    ListingView.__super__.constructor.apply(this, arguments);
  }
  ListingView.prototype.handleMarkerClick = function() {
    if (this.bubbleState === "open") {
      this.bubble.close();
      return this.bubbleState = "closed";
    } else {
      this.bubble.open(app.map.map, this.marker);
      return this.bubbleState = "open";
    }
  };
  return ListingView;
})();
Listings = (function() {
  __extends(Listings, Backbone.Collection);
  Listings.prototype.url = "/listings";
  Listings.prototype.model = Listing;
  function Listings() {
    Listings.__super__.constructor.apply(this, arguments);
  }
  return Listings;
})();
OfficeListController = (function() {
  __extends(OfficeListController, Backbone.Controller);
  function OfficeListController() {
    this.test = __bind(this.test, this);;    OfficeListController.__super__.constructor.apply(this, arguments);
  }
  OfficeListController.prototype.routes = {
    "test": "test"
  };
  OfficeListController.prototype.test = function() {
    return runTests();
  };
  return OfficeListController;
})();
OfficeListPresenter = (function() {
  OfficeListPresenter.prototype.handleRefreshedListings = function() {
    var listing, _i, _len, _ref, _results;
    _ref = this.listings.models;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listing = _ref[_i];
      _results.push(this.handleRefreshedListing(listing));
    }
    return _results;
  };
  OfficeListPresenter.prototype.handleRefreshedListing = function(listing) {
    listing.view = new ListingView({
      model: listing
    });
    return this.map.addListing(listing);
  };
  OfficeListPresenter.prototype.handleAddedListing = function(listing) {
    return this.handleRefreshedListing(listing);
  };
  OfficeListPresenter.prototype.handleReload = function() {
    this.map.removeListings(this.listings.models);
    this.listings.fetch({
      success: __bind(function() {
        return this.map.handleDoneReloading();
      }, this)
    });
    return this.map.reloadListings();
  };
  OfficeListPresenter.prototype.handleSubmit = function() {
    var geocoder, listing;
    listing = new Listing({
      address: $('#address').val(),
      notes: $('#notes').val()
    });
    console.log($('#address, #notes, #lat, #lng').val(""));
    geocoder = new google.maps.Geocoder();
    return geocoder.geocode({
      address: listing.get('address')
    }, __bind(function(results, status) {
      var latlng;
      if (status === google.maps.GeocoderStatus.OK) {
        latlng = results[0].geometry.location;
        this.map.map.setCenter(latlng);
        this.map.map.setZoom(13);
        listing.set({
          lat: latlng.lat(),
          lng: latlng.lng()
        });
        this.listings.add(listing);
        listing.save(null, {
          success: __bind(function() {
            return liteAlert("saved");
          }, this),
          error: __bind(function() {
            return liteAlert("not saved");
          }, this)
        });
        return listing.view.handleMarkerClick();
      } else {
        return alert("There was a problem loading");
      }
    }, this));
  };
  function OfficeListPresenter() {
    this.handleSubmit = __bind(this.handleSubmit, this);;
    this.handleReload = __bind(this.handleReload, this);;
    this.handleAddedListing = __bind(this.handleAddedListing, this);;
    this.handleRefreshedListing = __bind(this.handleRefreshedListing, this);;
    this.handleRefreshedListings = __bind(this.handleRefreshedListings, this);;    var listing, onLoc, _ref;
    $('#listing-form').submit(__bind(function(e) {
      e.preventDefault();
      return this.handleSubmit();
    }, this));
    $('#reload').click(this.handleReload);
    this.officeListController = new OfficeListController;
    Backbone.history.start();
    this.map = new GoogleMap();
    this.listings = new Listings;
    this.listings.bind("refresh", this.handleRefreshedListings);
    this.listings.bind("add", this.handleAddedListing);
    listing = new Listing({
      address: "test",
      "notes": "test"
    });
    this.listings.fetch();
    $('#map-wrapper').append(this.map.el);
    $('#map-wrapper').css({
      width: (screen.availWidth - 300) + "px",
      height: document.body.clientHeight + "px"
    });
    onLoc = __bind(function(position) {
      var lat, latLng, lng;
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      $('#lat').val(lat);
      $('#lng').val(lng);
      latLng = new google.maps.LatLng(lat, lng);
      return this.map.map.setCenter(latLng);
    }, this);
    if ((_ref = navigator.geolocation) != null) {
      if (typeof _ref.getCurrentPosition == "function") {
        _ref.getCurrentPosition(onLoc);
      }
    }
  }
  return OfficeListPresenter;
})();