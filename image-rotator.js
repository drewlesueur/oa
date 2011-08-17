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
        var image, _index, _len, _results;
        console.log(images);
        _results = [];
        for (_index = 0, _len = images.length; _index < _len; _index++) {
          image = images[_index];
          image = $(image);
          _results.push(image.attr("src") === url ? (images.splice(_index, 1), render(), image.remove()) : void 0);
        }
        return _results;
      };
      addImage = function(url) {
        var img;
        img = $("<img src=\"" + url + "\" style=\"width: " + config.imgMaxWidth + "px; position: absolute; top: 0; left: 0;\"/>");
        return img.bind("load", function() {
          var h, w, _ref;
          images.push(img);
          el.append(img);
          h = this.height;
          w = this.width;
          _ref = getAdjustedDimensions(w, h), w = _ref[0], h = _ref[1];
          img.animate({
            "width": "" + w + "px"
          });
          img.animate({
            "height": "" + h + "px"
          });
          index = images.length - 1;
          render();
          return self;
        });
      };
      handleImageClick = function() {
        return next();
      };
      self.addImage = addImage;
      next = function() {
        index += 1;
        return render();
      };
      self.next = next;
      getCurrentUrl = function() {
        return images[index].attr("src");
      };
      self.getCurrentUrl = getCurrentUrl;
      prev = function() {
        index += 1;
        return render();
      };
      self.prev = prev;
      render = function() {
        var i, image, _len, _results;
        if (index >= images.length) {
          index = 0;
        } else if (index < 0) {
          index = images.length - 1;
        }
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
