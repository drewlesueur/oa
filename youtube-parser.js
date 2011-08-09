(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define("youtube-parser", function() {
    var $, createIframe, drews, exports, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    exports = {};
    exports.exampleEmbed = '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>';
    createIframe = function(yt) {
      return "<iframe class=\"video-iframe\" width=\"" + yt.width + "\" height=\"" + yt.height + "\" src=\"http://www.youtube.com/embed/" + yt.id + "?autoplay=1\"></iframe>";
    };
    exports.createIframe = createIframe;
    exports.init = function(youtubeEmbed) {
      var heightMatches, matches, widthMatches, yt;
      yt = {};
      yt.embed = youtubeEmbed;
      matches = null;
      if (matches = yt.embed.match(/embed\/([^\"\?]*)(\"|\?)/)) {
        yt.id = matches[1];
        widthMatches = yt.embed.match(/width="(\d+)"/);
        heightMatches = yt.embed.match(/height="(\d+)"/);
        if (widthMatches) {
          yt.width = widthMatches[1];
        }
        if (heightMatches) {
          yt.height = heightMatches[1];
        }
        return yt.embed = createIframe(yt);
      } else if (matches = yt.embed.match(/v=([^\&]*)\&/)) {
        yt.id = matches[1];
        yt.link = yt.embed;
        yt.width = 425;
        yt.height = 349;
        return yt.embed = createIframe(yt);
      } else if (matches = yt.embed.match(/\/([^\/]*)$/)) {
        yt.id = matches[1];
        yt.link = yt.embed;
        yt.width = 425;
        yt.height = 349;
        return yt.embed = createIframe(yt);
      }
    };
    exports.getLittleImage = __bind(function(numb) {
      if (!yt.id) {
        return null;
      }
      if (!_.isNumber(numb)) {
        numb = 1;
      }
      return "http://img.youtube.com/vi/" + yt.id + "/" + numb + ".jpg";
    }, this);
    return exports.getBigImage = __bind(function() {
      if (!yt.id) {
        return null;
      }
      return "http://img.youtube.com/vi/" + yt.id + "/0.jpg";
    }, this);
  });
}).call(this);
