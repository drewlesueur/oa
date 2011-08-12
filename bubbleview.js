(function() {
  define("bubble-view", function() {
    var $, bubbleViewMaker, config, drews, drewsEventMaker, fileBoxMaker, fileDroppable, nimble, _;
    $ = require("jquery");
    nimble = require("nimble");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    _ = require("underscore");
    drews = require("drews-mixins");
    fileBoxMaker = require("filebox");
    fileDroppable = require("file-droppable");
    drewsEventMaker = require("drews-event");
    config = require("config");
    return bubbleViewMaker = function(options) {
      var addImage, addImages, el, filebox, handleAddImages, handleDeleteButton, handleSaveImages, model, self, trigger, triggeree;
      triggeree = options.triggeree, model = options.model;
      self = drewsEventMaker({
        options: options
      });
      triggeree = (options != null ? options.triggeree : void 0) || self;
      self.setTriggeree(triggeree);
      trigger = self.trigger;
      filebox = fileBoxMaker();
      filebox.on("uploaded", function(urls) {
        console.log("triggeree is");
        console.log(triggeree);
        return trigger("addimages", model, urls);
      });
      el = $("<div>\n  <span class=\"editable\" data-prop=\"address\"></span>\n  <!--<a class=\"add-images\" href=\"#\">Add images</a>-->\n  <div class=\"file-upload\">\n  </div>\n  <div class=\"add-image-area\">\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n  <div class=\"image-area\" style=\"position:relative;\">\n  </div>\n  <div class=\"editable\" data-prop=\"notes\"></div>\n  <a href=\"#\" class=\"delete\">Delete Listing</a>\n</div>");
      fileDroppable(el);
      el.bind("filedroppablefiles", function(e, files) {
        return filebox.uploadFiles(files);
      });
      el.bind("filedroppableurls", function(e, url) {
        return addImage(url);
      });
      el.find(".file-upload").append(filebox.getEl()).append(filebox.getProgressBars());
      el.find(".delete").click(function(e) {
        e.preventDefault();
        return handleDeleteButton();
      });
      handleDeleteButton = function() {
        if (confirm("Are you sure you want to delete?")) {
          return trigger("deletelisting", model);
        }
      };
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
      view(addimages);
      addImages = function(urls) {
        console.log("urls are");
        console.log(urls);
        return _.each(urls, function(url) {
          return addImage(url);
        });
      };
      self.addImages = addImages;
      addImage = function(url) {
        var img;
        console.log("trying to add a single image");
        img = $("<img src=\"" + url + "\" style=\"width: " + config.width + "px; position: absolute; top: 0; left: 0;\"/>");
        console.log(img);
        console.log(el);
        return el.find(".image-area").append(img);
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
      addImages(model.images);
      return self;
    };
  });
}).call(this);
