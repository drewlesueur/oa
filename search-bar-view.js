(function() {
  define("search-bar-view", function() {
    var $, drews, drewsEventMaker, nimble, searchBarViewMaker, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
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
}).call(this);
