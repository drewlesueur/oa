var GoogleMap, Listing, ListingView, Listings, OfficeListController, OfficeListPresenter, liteAlert;
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
_.each(['s'], function(method) {
  return Backbone.Collection.prototype[method] = function() {
    return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
  };
});
GoogleMap = (function() {
  __extends(GoogleMap, Backbone.View);
  function GoogleMap(width, height) {
    this.lookup = __bind(this.lookup, this);;
    this.handleDoneReloading = __bind(this.handleDoneReloading, this);;
    this.reloadListings = __bind(this.reloadListings, this);;
    this.removeListing = __bind(this.removeListing, this);;
    this.removeListings = __bind(this.removeListings, this);;
    this.addListings = __bind(this.addListings, this);;
    this.updateCurrentBubbleNotes = __bind(this.updateCurrentBubbleNotes, this);;
    this.addListing = __bind(this.addListing, this);;
    this.triggerNotesChange = __bind(this.triggerNotesChange, this);;
    this.clearFields = __bind(this.clearFields, this);;
    this.triggerAddressChange = __bind(this.triggerAddressChange, this);;    this.el = $(this.make("div"));
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
    $('#address').change(__bind(function() {
      return this.triggerAddressChange();
    }, this));
    $("#notes").keyup(__bind(function() {
      return this.triggerNotesChange();
    }, this));
  }
  GoogleMap.prototype.triggerAddressChange = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    return this.trigger("addresschange", {
      address: $('#address').val(),
      notes: $('#notes').val(),
      youtube: $('#youtube').val()
    }, cb);
  };
  GoogleMap.prototype.clearFields = function() {
    return $("#address, #notes, #lat, #lng").val("");
  };
  GoogleMap.prototype.triggerNotesChange = function() {
    return this.trigger("noteschange", $('#notes').val());
  };
  GoogleMap.prototype.addListing = function(listing) {
    var bubble, latlng, marker;
    latlng = new google.maps.LatLng(listing.get('lat'), listing.get('lng'));
    marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      position: latlng,
      title: listing.get('address'),
      icon: "http://office.the.tl/pin.png"
    });
    listing.view.marker = marker;
    marker.setMap(this.map);
    bubble = new google.maps.InfoWindow({
      content: listing.view.getBubbleContent()
    });
    listing.view.bubble = bubble;
    return google.maps.event.addListener(marker, 'click', function() {
      return listing.view.handleMarkerClick();
    });
  };
  GoogleMap.prototype.updateCurrentBubbleNotes = function(notes, cb) {
    if (cb == null) {
      cb = function() {};
    }
    if (!this.tempListing) {
      return cb();
    }
    return cb();
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
  GoogleMap.prototype.lookup = function(address, done) {
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
    this.getBubbleInnerContent = __bind(this.getBubbleInnerContent, this);;
    this.getBubbleContent = __bind(this.getBubbleContent, this);;
    this.renderBubble = __bind(this.renderBubble, this);;    ListingView.__super__.constructor.apply(this, arguments);
  }
  ListingView.prototype.renderBubble = function() {
    var bubbleDiv;
    bubbleDiv = $("[data-cid=\"" + this.model.cid + "\"]");
    return bubbleDiv.html(this.getBubbleInnerContent());
  };
  ListingView.prototype.getBubbleContent = function() {
    return "<div data-cid=\"" + this.model.cid + "\" data-id=\"" + this.model.id + "\">\n  " + (this.getBubbleInnerContent()) + "\n </div>";
  };
  ListingView.prototype.getBubbleInnerContent = function() {
    return " \n" + (this.model.get('address')) + "\n<br />\n" + (this.model.get('notes'));
  };
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
    this.test = __bind(this.test, this);;
    this.tests = __bind(this.tests, this);;    OfficeListController.__super__.constructor.apply(this, arguments);
  }
  OfficeListController.prototype.routes = {
    "test": "test",
    "tests/:test": "tests"
  };
  OfficeListController.prototype.tests = function(test) {
    return runTest(test);
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
  OfficeListPresenter.prototype.handleSubmit = function(done) {
    return this.addListing(this.tempListing, done);
  };
  OfficeListPresenter.prototype.addListing = function(listing, done) {
    listing || (listing = this.tempListing);
    console.log("-----calling handle submit");
    done || (done = function() {});
    if (listing) {
      if (!listing.collection) {
        this.listings.add(listing);
      }
      this.map.clearFields();
      listing.save(null, {
        success: __bind(function() {
          return liteAlert("saved");
        }, this),
        error: __bind(function(err) {
          return done(err);
        }, this)
      });
      listing.view.handleMarkerClick();
      return done();
    } else {
      console.log("going to trigger address change");
      return app.map.triggerAddressChange(__bind(function() {
        console.log("---handled address change");
        return this.handleSubmit(done);
      }, this));
    }
  };
  OfficeListPresenter.prototype.addTmpListing = function(listing, callback) {
    callback || (callback = function() {});
    if (listing.constructor !== Listing) {
      listing = new Listing(listing);
      listing.view = new ListingView({
        model: listing
      });
    }
    listing.bind("remove", __bind(function(model, collection) {
      return this.map.removeListing(model);
    }, this));
    listing.bind("change:notes", __bind(function() {
      return this.handleListingChange(listing);
    }, this));
    return this.map.lookup(listing.get('address'), __bind(function(err, results) {
      var latlng;
      if (err) {
        liteAlert("Error getting address");
        return callback(err);
      }
      this.listings.remove(this.tempListing);
      this.tempListing = listing;
      latlng = results[0].geometry.location;
      this.map.map.setCenter(latlng);
      this.map.map.setZoom(13);
      listing.set({
        lat: latlng.lat(),
        lng: latlng.lng()
      });
      this.listings.add(listing);
      listing.view.handleMarkerClick();
      return callback();
    }, this));
  };
  OfficeListPresenter.prototype.handleListingChange = function(listing) {
    console.log("listing.view is ");
    console.log(listing);
    console.log(listing.view);
    return listing.view.renderBubble();
  };
  OfficeListPresenter.prototype.handleNotesChange = function(notes, cb) {
    if (cb == null) {
      cb = function() {};
    }
    if (!this.tempListing) {
      return cb();
    }
    this.tempListing.set({
      notes: notes
    });
    return cb();
  };
  function OfficeListPresenter() {
    this.handleNotesChange = __bind(this.handleNotesChange, this);;
    this.handleListingChange = __bind(this.handleListingChange, this);;
    this.addTmpListing = __bind(this.addTmpListing, this);;
    this.addListing = __bind(this.addListing, this);;
    this.handleSubmit = __bind(this.handleSubmit, this);;
    this.handleReload = __bind(this.handleReload, this);;
    this.handleAddedListing = __bind(this.handleAddedListing, this);;
    this.handleRefreshedListing = __bind(this.handleRefreshedListing, this);;
    this.handleRefreshedListings = __bind(this.handleRefreshedListings, this);;    var onLoc, _ref;
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
    this.listings.fetch();
    this.map.bind("addresschange", this.addTmpListing);
    this.map.bind("noteschange", this.handleNotesChange);
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