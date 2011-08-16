(function() {
  define("bubble-view", function() {
    var $, bubbleViewMaker, config, drews, drewsEventMaker, fileBoxMaker, fileDroppable, imageRotatorer, nimble, _;
    $ = require("jquery");
    nimble = require("nimble");
    _ = require("underscore");
    drews = require("drews-mixins");
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    fileBoxMaker = require("filebox");
    fileDroppable = require("file-droppable");
    drewsEventMaker = require("drews-event");
    config = require("config");
    imageRotatorer = require("image-rotator");
    return bubbleViewMaker = function(options) {
      var addImage, addImages, bubbleHtml, deleteImage, el, filebox, handleAddImages, handleDeleteButton, handleSaveImages, imageRotator, model, self, trigger, triggeree;
      triggeree = options.triggeree, model = options.model;
      self = drewsEventMaker({
        options: options
      });
      triggeree = (options != null ? options.triggeree : void 0) || self;
      self.setTriggeree(triggeree);
      trigger = self.trigger;
      filebox = fileBoxMaker();
      filebox.on("uploaded", function(urls) {
        return trigger("addimages", model, urls);
      });
      bubbleHtml = require("bubble-html");
      el = $("<div>\n  <div>\n    " + bubbleHtml + "\n  </div>\n  <a href=\"#\" class=\"delete\">Delete Listing</a>\n  <div class=\"file-upload\">\n  </div>\n  <div class=\"add-image-area\" >\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n  <div class=\"image-area\" style=\"position:relative;\">\n  </div>\n  <div style=\"bottom: -10px; position: absolute;\">\n    <a href=\"#\" style=\"font-size: 10px;\" class=\"delete-image\">delete image</a>\n  </div>\n</div>");
      imageRotator = imageRotatorer();
      el.find(".image-area").append(imageRotator.el);
      el.find(".delete-image").bind("click", function() {
        console.log(imageRotator);
        return trigger("deleteimage", model, imageRotator.getCurrentUrl());
      });
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
      deleteImage = self.deleteImage = function(url) {
        return imageRotator.deleteImage(url);
      };
      addImages = function(urls) {
        return _.each(urls, function(url) {
          return addImage(url);
        });
      };
      self.addImages = addImages;
      addImage = function(url) {
        return imageRotator.addImage(url, config.width);
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
