(function() {
  define("image-rotator", function() {
    var $, drews, imageRotatorer, nimble, severus, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    severus = require("severus");
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
      addImage = function(url, width) {
        var img;
        img = $("<img src=\"" + url + "\" style=\"width: " + width + "px; position: absolute; top: 0; left: 0;\"/>");
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
        console.log(_.map(images, function(image) {
          return image.attr("src");
        }));
        _results = [];
        for (i = 0, _len = images.length; i < _len; i++) {
          image = images[i];
          console.log("" + index + " =?= " + i);
          _results.push(index === i ? (console.log("yes, showing"), images[i].show(), console.log(images[i].attr("src"))) : (console.log("no, hiding`"), images[i].hide(), console.log(images[i].attr("src"))));
        }
        return _results;
      };
      return self;
    };
  });
}).call(this);
