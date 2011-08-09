(function() {
  var __useLookup__;
  __useLookup__ = true;
  define("listing", function() {
    var $, bind, drews, each, exports, log, m, nimble, trigger, type, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = drews.trigger, bind = drews["on"], log = drews.log, m = drews.meta;
    drews;
    each = _.each;
    type = drews.metaMaker("type");
    exports = {};
    exports.init = function(listing) {
      listing._type = exports;
      return listing;
    };
    exports.jsonExclusions = ["view", "__mid"];
    return exports;
  });
  define("listing-view", function() {
    var $, bind, drews, exports, log, nimble, trigger, youtubeParser, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    youtubeParser = require("youtube-parser");
    trigger = drews.trigger, bind = drews["on"], log = drews.log;
    exports = {};
    exports.getBubbleContent = function(listingView) {
      var bigImage, content, height, image, listing, str, width, youtube;
      listing = listingView.model;
      youtube = youtubeParser.init(listing.youtube);
      bigImage = youtube.bigImage;
      width = youtube.width;
      height = youtube.height;
      if (bigImage && width) {
        image = "<img class=\"thumbnail\" src=\"" + bigImage + "\" style=\"width:" + width + "px;\;height:" + height + "px; position: relative\" />";
      } else {
        image = "";
      }
      str = "  <div style=\"position: relative;\" class=\"bubble-wrapper\" data-cid=\"" + "\" data-id=\"" + "\">\n  <div class=\"bubble-position\"></div>\n  " + listing.address + "\n  <div class=\"youtube\">\n   " + image + "\n  </div>\n  <br />\n  <div class=\"notes\">\n    " + listing.notes + "\n  </div>\n  <div class=\"squareFeet\">\n    " + listing.squareFeet + "\n  </div>\n  <div class=\"price\">\n    " + listing.price + "\n  </div>\n</div>";
      content = $(str);
      content.find("img.thumbnail").click(function() {
        return trigger(map, "youtubeimageclick", listing);
      });
      return listingView.bubbleContent = content[0];
    };
    exports.init = function(listing) {
      return listing.view = {
        _type: exports
      };
    };
    return exports;
  });
}).call(this);
