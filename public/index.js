var GoogleMap, Listing, ListingView, Listings, OfficeListController, OfficeListPresenter, SignInView, YoutubeParser, liteAlert;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __slice = Array.prototype.slice;
liteAlert = function(message) {
  return console.log(message);
};
YoutubeParser = (function() {
  YoutubeParser.prototype.exampleEmbed = '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>';
  YoutubeParser.prototype.createIframe = function() {
    return "<iframe width=\"" + this.width + "\" height=\"" + this.height + "\" src=\"http://www.youtube.com/embed/" + this.id + "?autoplay=1\"></iframe>";
  };
  function YoutubeParser(youtubeEmbed) {
    this.getBigImage = __bind(this.getBigImage, this);
    this.getLittleImage = __bind(this.getLittleImage, this);    var heightMatches, matches, widthMatches;
    this.embed = youtubeEmbed;
    matches = null;
    if (matches = this.embed.match(/embed\/([^\"\?]*)(\"|\?)/)) {
      this.id = matches[1];
      widthMatches = this.embed.match(/width="(\d+)"/);
      heightMatches = this.embed.match(/height="(\d+)"/);
      if (widthMatches) {
        this.width = widthMatches[1];
      }
      if (heightMatches) {
        this.height = heightMatches[1];
      }
      this.embed = this.createIframe();
    } else if (matches = this.embed.match(/v=([^\&]*)\&/)) {
      this.id = matches[1];
      this.link = this.embed;
      this.width = 425;
      this.height = 349;
      this.embed = this.createIframe();
    } else if (matches = this.embed.match(/\/([^\/]*)$/)) {
      this.id = matches[1];
      this.link = this.embed;
      this.width = 425;
      this.height = 349;
      this.embed = this.createIframe();
    }
  }
  YoutubeParser.prototype.getLittleImage = function(numb) {
    if (!this.id) {
      return null;
    }
    if (!_.isNumber(numb)) {
      numb = 1;
    }
    return "http://img.youtube.com/vi/" + this.id + "/" + numb + ".jpg";
  };
  YoutubeParser.prototype.getBigImage = function() {
    if (!this.id) {
      return null;
    }
    return "http://img.youtube.com/vi/" + this.id + "/0.jpg";
  };
  return YoutubeParser;
})();
_.each(['s'], function(method) {
  return Backbone.Collection.prototype[method] = function() {
    return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
  };
});
GoogleMap = (function() {
  __extends(GoogleMap, Backbone.View);
  function GoogleMap(width, height) {
    this.lookup = __bind(this.lookup, this);
    this.hideReloading = __bind(this.hideReloading, this);
    this.displayReloading = __bind(this.displayReloading, this);
    this.removeListing = __bind(this.removeListing, this);
    this.removeListings = __bind(this.removeListings, this);
    this.addListings = __bind(this.addListings, this);
    this.updateCurrentBubbleNotes = __bind(this.updateCurrentBubbleNotes, this);
    this.addListing = __bind(this.addListing, this);
    this.triggerNotesChange = __bind(this.triggerNotesChange, this);
    this.clearFields = __bind(this.clearFields, this);
    this.triggerAddressChange = __bind(this.triggerAddressChange, this);
    this.triggerYoutubeChange = __bind(this.triggerYoutubeChange, this);
    this.triggerReload = __bind(this.triggerReload, this);
    this.triggerMapCenterChanged = __bind(this.triggerMapCenterChanged, this);    this.el = $(this.make("div"));
    this.el.css({
      width: $(window).width() - 300 + "px",
      height: $(window).height() + "px"
    });
    this.latLng = new google.maps.LatLng(33.4222685, -111.8226402);
    this.options = {
      zoom: 11,
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
    $("#youtube").keyup(__bind(function() {
      return this.triggerYoutubeChange();
    }, this));
    $('#reload').click(__bind(function() {
      return this.triggerReload();
    }, this));
    google.maps.event.addListener(this.map, "center_changed", __bind(function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.triggerMapCenterChanged.apply(this, args);
    }, this));
  }
  GoogleMap.prototype.triggerMapCenterChanged = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.trigger("mapcenterchanged");
  };
  GoogleMap.prototype.triggerReload = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    return this.trigger("reload", cb);
  };
  GoogleMap.prototype.triggerYoutubeChange = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    return this.trigger("youtubechange", $('#youtube').val(), cb);
  };
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
      content: listing.view.getBubbleContent(),
      zIndex: 999999
    });
    listing.view.bubble = bubble;
    google.maps.event.addListener(marker, 'click', function() {
      return listing.view.handleMarkerClick();
    });
    return google.maps.event.addListener(bubble, 'closeclick', function() {
      return listing.view.handleBubbleClose();
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
  GoogleMap.prototype.displayReloading = function() {
    return $('#reload-text').text("Reloading...");
  };
  GoogleMap.prototype.hideReloading = function() {
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
    this.setYoutube = __bind(this.setYoutube, this);
    this.set = __bind(this.set, this);    Listing.__super__.constructor.apply(this, arguments);
  }
  Listing.prototype.set = function() {
    var args, attrs;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    attrs = args[0];
    if ("youtube" in attrs) {
      this.setYoutube(attrs['youtube']);
    }
    return Listing.__super__.set.apply(this, arguments);
  };
  Listing.prototype.setYoutube = function(embed) {
    return this.youtubeParser = new YoutubeParser(embed);
  };
  return Listing;
})();
ListingView = (function() {
  __extends(ListingView, Backbone.View);
  function ListingView() {
    this.handleMarkerClick = __bind(this.handleMarkerClick, this);
    this.handleBubbleClose = __bind(this.handleBubbleClose, this);
    this.getBubbleContent = __bind(this.getBubbleContent, this);
    this.renderBubble = __bind(this.renderBubble, this);
    this.getBubbleDiv = __bind(this.getBubbleDiv, this);
    this.updateNotes = __bind(this.updateNotes, this);
    this.swapImageWithVideo = __bind(this.swapImageWithVideo, this);
    this.removeVideo = __bind(this.removeVideo, this);
    this.triggerYoutubeImageClick = __bind(this.triggerYoutubeImageClick, this);    ListingView.__super__.constructor.apply(this, arguments);
  }
  ListingView.prototype.triggerYoutubeImageClick = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    return this.swapImageWithVideo(cb);
  };
  ListingView.prototype.removeVideo = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    return $('iframe').remove();
  };
  ListingView.prototype.swapImageWithVideo = function(cb) {
    var iframe, img;
    if (cb == null) {
      cb = function() {};
    }
    iframe = $(this.model.youtubeParser.embed);
    img = this.getBubbleDiv().find('img');
    iframe.css({
      display: "none",
      position: "absolute",
      top: 0,
      left: 0
    });
    $(document.body).append(iframe);
    return _.wait(10, function() {
      iframe.css({
        display: "block",
        top: img.offset().top + "px",
        left: img.offset().left + "px"
      });
      return cb();
    });
  };
  ListingView.prototype.updateNotes = function() {
    return this.content.find(".notes").html(this.model.get("notes"));
  };
  ListingView.prototype.getBubbleDiv = function() {
    return $("[data-cid=\"" + this.model.cid + "\"]");
  };
  ListingView.prototype.renderBubble = function() {
    return this.bubble.setContent(this.getBubbleContent());
  };
  ListingView.prototype.getBubbleContent = function() {
    var bigImage, content, height, image, str, width, _ref, _ref2, _ref3;
    bigImage = (_ref = this.model.youtubeParser) != null ? _ref.getBigImage() : void 0;
    width = (_ref2 = this.model.youtubeParser) != null ? _ref2.width : void 0;
    height = (_ref3 = this.model.youtubeParser) != null ? _ref3.height : void 0;
    if (bigImage && width) {
      image = "<img class=\"thumbnail\" src=\"" + bigImage + "\" style=\"width:" + width + "px;\;height:" + height + "px\" />";
    } else {
      image = "";
    }
    str = "<div style=\"position: relative;\" data-cid=\"" + this.model.cid + "\" data-id=\"" + this.model.id + "\">\n  <div class=\"bubble-position\"></div>\n  " + (this.model.get('address')) + "\n  <div class=\"youtube\">\n   " + image + " \n  </div>\n  <br />\n  <div class=\"notes\">\n    " + (this.model.get('notes')) + "\n  </div>\n</div>";
    content = $(str);
    content.find("img.thumbnail").click(__bind(function() {
      return this.triggerYoutubeImageClick();
    }, this));
    this.content = content;
    return this.content[0];
  };
  ListingView.prototype.handleBubbleClose = function() {
    return this.removeVideo();
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
    this.test = __bind(this.test, this);
    this.tests = __bind(this.tests, this);    OfficeListController.__super__.constructor.apply(this, arguments);
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
SignInView = (function() {
  __extends(SignInView, Backbone.View);
  SignInView.prototype.questions = ["What is your fav color?", "What is your dogs maiden name?", "How many pet hampsters do you have?"];
  SignInView.prototype.signUpText = "Just type in an email and choose a question and answer";
  SignInView.prototype.signInText = "Type in your email and choose your question and answer";
  function SignInView() {
    this.getSignInDiv = __bind(this.getSignInDiv, this);
    this.triggerSignInClick = __bind(this.triggerSignInClick, this);    SignInView.__super__.constructor.apply(this, arguments);
    $("#sign-in").click(__bind(function(e) {
      e.preventDefault();
      return this.triggerSignInClick;
    }, this));
  }
  SignInView.prototype.triggerSignInClick = function(done) {
    if (done == null) {
      done = function() {};
    }
    if (!this.SignInDiv) {
      this.SignInDiv || (this.SignInDiv = this.getSignInDiv());
      $("#login-area").append(this.SignInDiv);
      return done();
    } else if (this.SignInDiv.is(":visible")) {
      return this.SignInDiv.hide(done);
    } else {
      return this.SignInDiv.show(done);
    }
  };
  SignInView.prototype.getSignInDiv = function() {
    var question, questions, val;
    questions = (function() {
      var _i, _len, _ref, _results;
      _ref = this.questions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        question = _ref[_i];
        val = question.replace(/[^\w]/g, "_");
        _results.push("<option value=\"" + val + "\">" + question + "</option>");
      }
      return _results;
    }).call(this);
    return $("<div class=\"login\">\n  <div class=\"notes\">" + this.signInText + "</div> \n  <form>\n    <input type=\"text\" id=\"email\" placeholder=\"email\">\n    <br />\n    <select id=\"question\">\n      " + questions + "\n    </select>\n    <br/>\n    <input type=\"text\" id=\"password\" placeholder=\"ansswer\"/>\n    <br />\n    <input type=\"submit\" value=\"Sign In\"/>\n  </form>\n</div>\n");
  };
  return SignInView;
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
  OfficeListPresenter.prototype.handleReload = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    this.map.removeListings(this.listings.models);
    this.listings.fetch({
      success: __bind(function() {
        this.map.hideReloading();
        return cb();
      }, this)
    });
    return this.map.displayReloading();
  };
  OfficeListPresenter.prototype.handleSubmit = function(done) {
    return this.addListing(this.tempListing, done);
  };
  OfficeListPresenter.prototype.addListing = function(listing, done) {
    if (done == null) {
      done = function() {};
    }
    listing || (listing = this.tempListing);
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
      return this.trigger("error", "no temporary listing");
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
      console.log("notes changed");
      return this.handleNotesChange(listing);
    }, this));
    listing.bind("change:youtube", __bind(function() {
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
      return callback(null, listing);
    }, this));
  };
  OfficeListPresenter.prototype.handleNotesChange = function(listing) {
    return listing.view.updateNotes();
  };
  OfficeListPresenter.prototype.handleListingChange = function(listing) {
    return listing.view.renderBubble();
  };
  OfficeListPresenter.prototype.handleAppNotesChange = function(notes, cb) {
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
  OfficeListPresenter.prototype.handleAppYoutubeChange = function(youtube, cb) {
    if (cb == null) {
      cb = function() {};
    }
    if (!this.tempListing) {
      return cb();
    }
    this.tempListing.set({
      youtube: youtube
    });
    return cb();
  };
  OfficeListPresenter.prototype.handleMapCenterChanged = function(cb) {
    if (cb == null) {
      cb = function() {};
    }
    if (this.tempListing) {
      return this.tempListing.view.removeVideo();
    }
  };
  function OfficeListPresenter() {
    this.handleMapCenterChanged = __bind(this.handleMapCenterChanged, this);
    this.handleAppYoutubeChange = __bind(this.handleAppYoutubeChange, this);
    this.handleAppNotesChange = __bind(this.handleAppNotesChange, this);
    this.handleListingChange = __bind(this.handleListingChange, this);
    this.handleNotesChange = __bind(this.handleNotesChange, this);
    this.addTmpListing = __bind(this.addTmpListing, this);
    this.addListing = __bind(this.addListing, this);
    this.handleSubmit = __bind(this.handleSubmit, this);
    this.handleReload = __bind(this.handleReload, this);
    this.handleAddedListing = __bind(this.handleAddedListing, this);
    this.handleRefreshedListing = __bind(this.handleRefreshedListing, this);
    this.handleRefreshedListings = __bind(this.handleRefreshedListings, this);    var onLoc, _ref;
    _.extend(this, Backbone.Events);
    $('#listing-form').submit(__bind(function(e) {
      e.preventDefault();
      return this.handleSubmit();
    }, this));
    this.officeListController = new OfficeListController;
    Backbone.history.start();
    this.map = new GoogleMap();
    this.listings = new Listings;
    this.listings.bind("refresh", this.handleRefreshedListings);
    this.listings.bind("add", this.handleAddedListing);
    this.listings.fetch();
    this.map.bind("addresschange", this.addTmpListing);
    this.map.bind("noteschange", this.handleAppNotesChange);
    this.map.bind("youtubechange", this.handleAppYoutubeChange);
    this.map.bind("reload", this.handleReload);
    this.map.bind("mapcenterchanged", this.handleMapCenterChanged);
    $('#map-wrapper').append(this.map.el);
    $('#map-wrapper').css({
      width: $(window).width() - 300 + "px",
      height: $(window).height() + "px"
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
      if (typeof _ref.getCurrentPosition === "function") {
        _ref.getCurrentPosition(onLoc);
      }
    }
    this.signInView = new SignInView();
  }
  return OfficeListPresenter;
})();