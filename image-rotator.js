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
      var addImage, el, handleImageClick, images, index, next, prev, render, self;
      self = drews;
      el = $("<div class=\"image-rotator\" style=\"position:relative;\">\n</div>");
      index = 0;
      images = [];
      self.el = el;
      el.bind("click", function(e) {
        return handleImageClick();
      });
      addImage = function(url, maxDimension) {
        var img;
        img = $("<img src=\"" + url + "\" style=\"position: absolute; top: 0; left: 0;\"/>");
        img.bind("load", function() {
          var h, heightedWidth, w, widthedHeight;
          h = this.height;
          w = this.width;
          console.log("height = " + h);
          console.log("width = " + w);
          widthedHeight = (h / w) * config.imgMaxWidth;
          heightedWidth = (w / h) * config.imgMaxHeight;
          console.log("maxHeight " + config.imgMaxHeight + " heightedWidth " + heightedWidth);
          console.log("maxWidth " + config.imgMaxWidth + " widthedHeight " + widthedHeight);
          if (widthedHeight > config.imgMaxHeight) {
            img.css({
              "height": "" + config.imgMaxHeight + "px"
            });
            return img.css({
              "width": "" + heightedWidth + "px"
            });
          } else {
            img.css({
              "height": "" + widthedHeight + "px"
            });
            return img.css({
              "width": "" + config.imgMaxWidth + "px"
            });
          }
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
