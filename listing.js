(function() {
  var __slice = Array.prototype.slice;
  define("listing", function() {
    var $, drews, drewsEventMaker, listingMaker, nimble, severus, _;
    $ = require("jquery");
    _ = require("underscore");
    drews = require("drews-mixins");
    nimble = require("nimble");
    severus = require("severus");
    severus.db = "officeatlas_dev";
    drews.bind = drews.on;
    drewsEventMaker = require("drews-event");
    listingMaker = function(attrs) {
      var addImages, bind, get, remove, save, self, set, trigger;
      self = drewsEventMaker({});
      trigger = self.trigger, bind = self.on;
      self.attrs = attrs;
      _.extend(self, attrs);
      set = function(prop, value) {
        attrs[prop] = value;
        self[prop] = value;
        return save();
      };
      self.set = set;
      addImages = function(urls) {
        attrs.images || (attrs.images = []);
        attrs.images = attrs.images.concat(urls);
        self.images = attrs.images;
        trigger("addimages", urls);
        return save(function(err) {
          if (err) {
            return trigger("failedimages", urls);
          }
        });
      };
      self.addImages = addImages;
      get = function(self, prop, value) {
        return self.attrs[prop];
      };
      save = function(cb) {
        if (cb == null) {
          cb = function() {};
        }
        return severus.save("listings", attrs, function(error, _listing) {
          _.extend(attrs, _listing);
          return cb(error, self);
        });
      };
      self.save = save;
      remove = function(cb) {
        return severus.remove("listings", attrs._id, function(err) {
          return trigger("deleted", self);
        });
      };
      self.remove = remove;
      return self;
    };
    listingMaker.find = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return severus.find.apply(severus, ["listings"].concat(__slice.call(args)));
    };
    listingMaker = drewsEventMaker(listingMaker);
    return listingMaker;
  });
}).call(this);
