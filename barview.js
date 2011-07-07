(function() {
  define("barview", function() {
    var $, bind, drews, init, nimble, trigger, _;
    _ = require("underscore");
    $ = require("jquery");
    drews = require("drews-mixins");
    nimble = require("nimble");
    trigger = drews.trigger, bind = drews["on"];
    init = function() {
      var el, form;
      form = {};
      el = $("<div class=\"bar\">\n  <form class=\"search-form\">\n    <input class=\"search\" placeholder=\"Add address\" />\n  </form>\n</div>");
      form.el = el;
      el.submit(function(e) {
        e.preventDefault();
        return trigger(form, "submit", el.find(".search").val());
      });
      return form;
    };
    return {
      init: init
    };
  });
}).call(this);
