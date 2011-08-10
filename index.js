(function() {
  var $, config, drews, drewsEventMaker, log, nimble, severus, _;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = require("jquery");
  _ = require("underscore");
  drews = require("drews-mixins");
  nimble = require("nimble");
  severus = require("severus");
  severus.db = "officeatlas_dev";
  drews.bind = drews.on;
  define("drews-event", function() {
    var drewsEventMaker;
    return drewsEventMaker = function(obj) {
      var triggeree;
      triggeree = obj;
      obj.setTriggeree = function(_trig) {
        return triggeree = _trig;
      };
      obj.on = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return drews.on.apply(drews, [obj].concat(__slice.call(args)));
      };
      obj.trigger = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return drews.trigger.apply(drews, [triggeree].concat(__slice.call(args)));
      };
      return obj;
    };
  });
  drewsEventMaker = require("drews-event");
  log = drews.log;
  define("bubble-view", function() {
    var bubbleViewMaker, fileBoxMaker, fileDroppable;
    _ = require("underscore");
    drews = require("drews-mixins");
    fileBoxMaker = require("filebox");
    fileDroppable = require("file-droppable");
    drewsEventMaker = require("drews-event");
    return bubbleViewMaker = function(options) {
      var addImage, addImages, el, filebox, handleAddImages, handleSaveImages, model, self, trigger, triggeree;
      triggeree = options.triggeree, model = options.model;
      self = drewsEventMaker({
        options: options
      });
      self.setTriggeree((options != null ? options.triggeree : void 0) || self);
      trigger = self.trigger;
      filebox = fileBoxMaker();
      filebox.on("uploaded", function(urls) {
        log("triggering add images with");
        log(urls);
        return trigger("addimages", model, urls);
      });
      el = $("<div>\n  <span class=\"editable\" data-prop=\"address\"></span>\n  <div class=\"editable\" data-prop=\"notes\"></div>\n  <!--<a class=\"add-images\" href=\"#\">Add images</a>-->\n  <div class=\"file-upload\">\n  </div>\n  <div class=\"add-image-area\">\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n</div>");
      fileDroppable(el);
      el.bind("filedroppablefiles", function(e, files) {
        console.log(files);
        return filebox.uploadFiles(files);
      });
      el.bind("filedroppableurls", function(e, url) {
        console.log(url);
        return addImage(url);
      });
      el.find(".file-upload").append(filebox.getEl()).append(filebox.getProgressBars());
      el.css({
        width: "" + config.width + "px",
        height: "" + config.height + "px"
      });
      el.find(".add-image-area").hide();
      el.find(".add-images").click(function(e) {
        e.preventDefault();
        return self.handleAddImages();
      });
      el.find(".save-images-button").click(function(e) {
        e.preventDefault();
        return self.handleSaveImages();
      });
      self.el = el;
      addImages = function(urls) {
        return _.each(urls, function(url) {
          return addImage(url);
        });
      };
      self.addImages = addImages;
      addImage = function(url) {
        var img;
        img = $("<img src=\"" + url + "\" style=\"width: " + config.width + "px\"/>");
        return el.append(img);
      };
      handleAddImages = function() {
        return self.el.find(".add-image-area").show();
      };
      self.handleAddImages = handleAddImages;
      handleSaveImages = function() {
        var images;
        images = el.find(".images").val().split("\n");
        return drews.trigger(triggeree, "modelviewvalchanged", model, "images", images);
      };
      self.handleSaveImages = handleSaveImages;
      return self;
    };
  });
  define("map-page-presenter", function() {
    var listingMaker, listingViewMaker, mapPagePresenterMaker, mapPageViewMaker;
    mapPageViewMaker = require("map-page-view");
    listingMaker = require("listing");
    listingViewMaker = require("listing-view");
    return mapPagePresenterMaker = function() {
      var addImages, addListing, handleSubmit, listings, map, self;
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
        map.addListing(listing, listing.view.getBubbleContent());
        listing.presenter = self;
        listing.on("addimages", function(urls) {
          return listing.view.addImages(urls);
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
        console.log("presenter add images called");
        console.log(listing);
        console.log(listing.addImages);
        listing.addImages(urls);
        log("done");
        log(listing.addImages);
        return log("done again");
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
      map.on("newmarker", function(listing, marker) {
        return listing.view.marker = marker;
      });
      return self;
    };
  });
  define("map-page-view", function() {
    var mapPageViewMaker, searchBarViewMaker;
    searchBarViewMaker = require("search-bar-view");
    return mapPageViewMaker = function(el) {
      var addListing, bar, bind, getCenter, getDiv, getZoom, latLng, lookup, map, options, self, setLatLng, trigger;
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
      addListing = __bind(function(listing, bubbleContent, cb) {
        var bubble, latlng, marker;
        if (cb == null) {
          cb = function() {};
        }
        latlng = new google.maps.LatLng(listing.lat, listing.lng);
        marker = new google.maps.Marker({
          animation: google.maps.Animation.DROP,
          position: latlng,
          title: listing.address,
          icon: "http://3office.drewl.us/pinb.png"
        });
        marker.setMap(map);
        map.setCenter(latlng);
        bubble = new google.maps.InfoWindow({
          content: bubbleContent,
          position: latlng
        });
        google.maps.event.addListener(marker, 'click', function() {
          trigger("bubbleopen", listing);
          return bubble.open(map);
        });
        google.maps.event.addListener(bubble, 'closeclick', function() {
          return trigger("bubbleclick", listing);
        });
        trigger("newmarker", listing, marker);
        trigger("newbubble", listing, bubble);
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
    var listingMaker;
    listingMaker = function(attrs) {
      var addImages, bind, get, remove, save, self, set, trigger;
      self = drewsEventMaker({});
      trigger = self.trigger, bind = self.on;
      self.attrs = attrs;
      _.extend(self, attrs);
      set = function(prop, value) {
        attrs[prop] = value;
        self[prop] = value;
        return save();
      };
      self.set = set;
      addImages = function(urls) {
        attrs.images || (attrs.images = []);
        attrs.images.concat(urls);
        self.images = attrs.images;
        trigger("addimages", urls);
        return save(function(err) {
          if (err) {
            return trigger("failedimages", urls);
          }
        });
      };
      self.addImages = addImages;
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
    listingMaker.find = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return severus.find.apply(severus, ["listings"].concat(__slice.call(args)));
    };
    listingMaker = drewsEventMaker(listingMaker);
    return listingMaker;
  });
  define("listing-view", function() {
    var editableFormMaker, listingViewMaker;
    editableFormMaker = require("editable-form");
    return listingViewMaker = function(listing, options) {
      var addImages, bubbleView, closeBubble, getBubbleContent, model, self, triggeree;
      bubbleView = null;
      model = listing;
      self = drewsEventMaker({});
      triggeree = options.triggeree || self;
      self.setTriggeree(triggeree);
      self.model = model;
      getBubbleContent = function() {
        var bubbleViewMaker, form;
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
      closeBubble = function() {};
      addImages = function(urls) {
        return bubbleView != null ? bubbleView.addImages(urls) : void 0;
      };
      self.addImages = addImages;
      return self;
    };
  });
  define("editable-form", function() {
    var editableFormMaker;
    return editableFormMaker = function(html, model, options) {
      var clickToMakeEditable, el, htmlValues, makeEditable, self, trigger, triggeree;
      self = {
        el: $(html),
        model: model
      };
      self = drewsEventMaker(self);
      triggeree = (options != null ? options.triggeree : void 0) || self;
      self.setTriggeree(triggeree);
      trigger = self.trigger;
      el = self.el;
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
          return trigger("modelviewvalchanged", model, prop, newValue);
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
      var self, trigger, triggeree;
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
      self = drewsEventMaker(self);
      triggeree = (options != null ? options.triggeree : void 0) || self;
      self.setTriggeree(triggeree);
      trigger = self.trigger;
      el.submit(function(e) {
        e.preventDefault();
        trigger("submit", el.find(".search").val());
        return el.find(".search").val("");
      });
      return self;
    };
  });
  config = {
    width: 320,
    height: 320
  };
  define("file-droppable", function() {
    var fileDroppable;
    return fileDroppable = function(el) {
      el.bind("dragover", function(e) {
        e.preventDefault();
        return e.stopPropagation();
      });
      el.bind("dragenter", function(e) {
        return false;
      });
      return el.bind("drop", function(e) {
        var files;
        e.preventDefault();
        e.stopPropagation();
        e = e.originalEvent;
        files = e.dataTransfer.files;
        if (files.length > 0) {
          return el.trigger("filedroppablefiles", [files]);
        } else {
          return el.trigger("filedroppableurls", e.dataTransfer.getData('text'));
        }
      });
    };
  });
}).call(this);
