(function() {
  define("bubble-view", function() {
    var bubbleViewMaker, drews, _;
    window[1];
    _ = require("underscore");
    drews = require("drews-mixins");
    return bubbleViewMaker = function(options) {
      var el, handleAddImages, handleSaveImages, self;
      self = {
        options: options
      };
      el = $("<div>\n  <span class=\"editable\" data-prop=\"address\"></span>\n  <div class=\"editable\" data-prop=\"notes\"></div>\n  <a class=\"add-images\" href=\"#\">Add images</a>\n  \n  <div class=\"add-image-area\">\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n</div>");
      el.css({
        width: "300px",
        height: "300px"
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
      self;
      handleAddImages = function() {
        return self.el.find(".add-image-area").show();
      };
      return handleSaveImages = function() {
        var images;
        images = el.find(".images").val().split("\n");
        console.log("the options are");
        console.log(self.options);
        return drews.trigger(self.options.triggeree, "modelviewvalchanged", self.options.model, "images", images);
      };
    };
  });
}).call(this);
