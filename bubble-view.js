(function() {
  var config;
  config = {
    width: 320,
    height: 320
  };
  define("file-droppable", function() {
    var fileDroppable;
    return fileDroppable = function(el) {};
  });
  define("bubble-view", function() {
    var bubbleViewMaker, drews, fileBoxMaker, _;
    window[1];
    _ = require("underscore");
    drews = require("drews-mixins");
    fileBoxMaker = require("filebox");
    return bubbleViewMaker = function(options) {
      var addImage, addImages, el, filebox, handleAddImages, handleSaveImages, self, triggeree;
      triggeree = options.triggeree;
      filebox = fileBoxMaker();
      filebox.on("uploaded", function(urls) {
        return addImages(urls);
      });
      self = {
        options: options
      };
      el = $("<div>\n  <span class=\"editable\" data-prop=\"address\"></span>\n  <div class=\"editable\" data-prop=\"notes\"></div>\n  <!--<a class=\"add-images\" href=\"#\">Add images</a>-->\n  <div class=\"file-upload\">\n  </div>\n  <div class=\"add-image-area\">\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n</div>");
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
        console.log("the options are");
        console.log(self.options);
        return drews.trigger(self.options.triggeree, "modelviewvalchanged", self.options.model, "images", images);
      };
      self.handleSaveImages = handleSaveImages;
      return self;
    };
  });
}).call(this);
