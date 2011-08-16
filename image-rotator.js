(function() {
  define("image-rotator", function() {
    var $, config, drews, imageRotatorer, nimble, severus, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    severus = require("severus");
    config = require("config");
    return imageRotatorer = function() {
      var addImage, el, getAdjustedDimensions, handleImageClick, images, index, next, prev, render, self;
      self = drews;
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
        el.append(img);
        next();
        return self;
      };
      handleImageClick = function() {
        return next();
      };
      self.addImage = addImage;
      next = function() {
        index += 1;
        if (index >= images.length) {
          index = 0;
        }
        return render();
      };
      self.next = next;
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
