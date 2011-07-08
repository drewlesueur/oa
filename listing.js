(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("listing", function() {
    var $, bind, drews, exports, log, m, nimble, trigger, type, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = drews.trigger, bind = drews["on"], log = drews.log;
    m = drews.meta;
    type = drews.metaMaker("type");
    exports = {};
    exports.init = function(listing) {
      return (m(listing)).type = exports;
    };
    return exports;
  });
  define("listing-view", function() {
    var $, bind, drews, exports, log, m, nimble, trigger, type, view, youtubeParser, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    youtubeParser = require("youtube-parser");
    trigger = drews.trigger, bind = drews["on"], log = drews.log;
    m = drews.meta;
    type = drews.metaMaker("type");
    exports = {};
    view = function(obj) {
      return (m(obj)).view || ((m(obj)).view = {});
    };
    exports.getBubbleContent = function(listing) {
      return {
        getBubbleContent: __bind(function() {
          var bigImage, content, height, image, str, width, youtube;
          youtube = youtubeParser.init(listing.youtube);
          bigImage = youtube.bigImage;
          width = youtube.width;
          height = youtube.height;
          if (bigImage && width) {
            image = "<img class=\"thumbnail\" src=\"" + bigImage + "\" style=\"width:" + width + "px;\;height:" + height + "px; position: relative\" />";
          } else {
            image = "";
          }
          str = "  <div style=\"position: relative;\" class=\"bubble-wrapper\" data-cid=\"" + this.model.cid + "\" data-id=\"" + this.model.id + "\">\n  <div class=\"bubble-position\"></div>\n  " + listing.address + "\n  <div class=\"youtube\">\n   " + image + "\n  </div>\n  <br />\n  <div class=\"notes\">\n    " + listing.notes + "\n  </div>\n  <div class=\"squareFeet\">\n    " + listing.squareFeet + "\n  </div>\n  <div class=\"price\">\n    " + listing.price + "\n  </div>\n</div>";
          content = $(str);
          content.find("img.thumbnail").click(function() {
            return trigger(map, "youtubeimageclick", listing);
          });
          v.bubbleContent = content[0];
          log(v.bubbleContent);
          return v.bubbleContent;
        }, this)
      };
    };
    exports.view = view;
    exports.init = function(listing) {
      type(view(listing), exports);
      return view(listing);
    };
    return exports;
  });
}).call(this);
