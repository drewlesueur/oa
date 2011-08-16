(function() {
  define("image-rotator", function() {
    var $, config, drews, drewsEventMaker, imageRotatorer, nimble, severus, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    severus = require("severus");
    config = require("config");
    drewsEventMaker = require("drews-event");
    return imageRotatorer = function() {
      var addImage, deleteImage, el, getAdjustedDimensions, getCurrentUrl, handleImageClick, images, index, next, prev, render, self;
      self = drewsEventMaker({});
      el = $("<div class=\"image-rotator\" style=\"position:relative;\">\n</div>");
      index = 0;
      images = [];
      self.el = el;
      el.bind("click", function(e) {
        return handleImageClick();
      });
      self.getAdjustedDimensions = getAdjustedDimensions = function(w, h) {
        var heightedWidth, widthedHeight;
        widthedHeight = (h / w) * config.imgMaxWidth;
        heightedWidth = (w / h) * config.imgMaxHeight;
        if (widthedHeight > config.imgMaxHeight) {
          return [heightedWidth, config.imgMaxHeight];
        } else {
          return [config.imgMaxWidth, widthedHeight];
        }
      };
      deleteImage = self.deleteImage = function(url) {
        var image, index, _len, _results;
        _results = [];
        for (index = 0, _len = images.length; index < _len; index++) {
          image = images[index];
          _results.push(image.attr("src") === url ? (images.splice(index, 1), next(), image.remove()) : void 0);
        }
        return _results;
      };
      addImage = function(url) {
        var img;
        img = $("<img src=\"" + url + "\" style=\"width: " + config.imgMaxWidth + "px; position: absolute; top: 0; left: 0;\"/>");
        console.log(img);
        img.bind("load", function() {
          var h, w, _ref;
          h = this.height;
          w = this.width;
          _ref = getAdjustedDimensions(w, h), w = _ref[0], h = _ref[1];
          img.animate({
            "width": "" + w + "px"
          });
          return img.animate({
            "height": "" + h + "px"
          });
        });
        images.push(img);
        index += 1;
        el.append(img);
        next();
        return self;
      };
      handleImageClick = function() {
        return next();
      };
      self.addImage = addImage;
      next = function() {
        console.log(images);
        console.log(index);
        index += 1;
        if (index >= images.length) {
          index = 0;
        }
        return render();
      };
      self.next = next;
      getCurrentUrl = function() {
        console.log(images);
        console.log(index);
        console.log(images[index]);
        return images[index].attr("src");
      };
      self.getCurrentUrl = getCurrentUrl;
      prev = function() {
        index += 1;
        if (index <= 0) {
          index = images.length - 1;
        }
        return render();
      };
      self.prev = prev;
      render = function() {
        var i, image, _len, _results;
        _results = [];
        for (i = 0, _len = images.length; i < _len; i++) {
          image = images[i];
          _results.push(index === i ? images[i].show() : images[i].hide());
        }
        return _results;
      };
      return self;
    };
  });
}).call(this);
