(function() {
  define("listing-view", function() {
    var $, drews, drewsEventMaker, editableFormMaker, listingViewMaker, nimble, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    editableFormMaker = require("editable-form");
    return listingViewMaker = function(listing, options) {
      var addImages, bind, bubble, bubbleView, closeBubble, getBubbleContent, latlng, marker, model, self, trigger, triggeree;
      bubbleView = null;
      model = listing;
      self = drewsEventMaker({});
      triggeree = options.triggeree || self;
      self.setTriggeree(triggeree);
      self.model = model;
      trigger = self.trigger, bind = self.on;
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
        self.bubbleContent = form.el[0];
        return self.bubbleContent;
      };
      self.getBubbleContent = getBubbleContent;
      closeBubble = function() {};
      addImages = function(urls) {
        return bubbleView != null ? bubbleView.addImages(urls) : void 0;
      };
      self.addImages = addImages;
      latlng = new google.maps.LatLng(listing.lat, listing.lng);
      self.latlng = latlng;
      marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: latlng,
        title: listing.address,
        icon: "http://3office.drewl.us/pinb.png"
      });
      bubble = new google.maps.InfoWindow({
        content: getBubbleContent(),
        position: latlng
      });
      self.marker = marker;
      self.bubble = bubble;
      google.maps.event.addListener(marker, 'click', function() {
        trigger("bubbleopen", listing);
        return bubble.open(listing.presenter.map.map);
      });
      google.maps.event.addListener(bubble, 'closeclick', function() {
        return trigger("bubbleclick", listing);
      });
      return self;
    };
  });
}).call(this);
