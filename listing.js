(function() {
  define("listing", function() {
    var $, bind, drews, exports, m, nimble, trigger, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = drews.trigger, bind = drews["on"];
    m = drews.meta;
    exports = {};
    exports.init = function(listing) {
      m(listing).view = {};
      return listing;
    };
    return exports;
  });
}).call(this);
