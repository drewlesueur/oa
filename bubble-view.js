(function() {
  var __get = function (obj, property, dontBindObj, childObj, debug) {
    __slice = Array.prototype.slice
    if (property == "call" && "__original" in obj) {
      return function(){
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        thethis = args[0]
        theargs = args.slice(1)
        return obj.__original.apply(thethis, theargs)
      } 
    }
    if (property == "apply" && "__original" in obj) {
      return function(){
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        thethis = args[0]
        theargs = args[1]
        return obj.__original.apply(thethis, theargs)
      } 
    }
    var originalFunction = function(){}
    var isString = function(obj) {
      return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    };
    isUndefined = function(obj) {
      return obj === void 0;
    };
    var isFunction = function(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }; 
    var isRegExp = function(obj) {
      return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false)); 
    }
    var thissedFunction = function () {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      method = obj[property]
      if (method) {
        //todo make this conditional
        return method.apply(obj, args);
      } else {
        return
      }
    }
    if (typeof obj !== "object" && typeof obj !== "function") {
      if (isString(obj) && property === "length") {
        return obj.length;
      } else if (isRegExp(obj) && property === "source") {
        return obj.source
      } else if (typeof obj === "number") {
        return obj[property]
      } else if (obj[property] === void 0) { //might not need this one
        return
      } else {
        //thissedFunction.__original == ????
        return thissedFunction //everyting else is a function
      }
    }
    if (property in obj) {
      var ret = obj[property];  
      if (!dontBindObj && isFunction(ret)) {
        originalFunction = ret
        thissedFunction.__original = ret
        ret = thissedFunction
      }
      return ret
    } else if ("_get" in obj) {
      var usedObj = childObj || obj
      var ret = (obj._get(usedObj, property))
      if (!isUndefined(ret)) {
        return ret  
      }
    }
    var type = obj._type
    var hasTypeObj = (typeof type === "object") || (typeof type === "function");
    if (hasTypeObj) {
      var usedObj = childObj || obj;
      ret = __get(type, property, true, usedObj);
      if (!dontBindObj && isFunction(ret)) { //is don't bind obj needed here
        var fn = function () {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          args.unshift(usedObj)
          return ret.apply(usedObj, args)
        }
        fn.__original = ret
        return fn
      } else {
        return ret;
      }
  
    } else {
      return;
    }
  }, __set = function (obj, prop, val, meta) {
    if (meta === void 0) // if meta is undefined
      meta = true
    var set = __get(obj, "_set");
    if (meta && set && typeof obj == "object") {
      set(prop, val);
    } else {
      obj[prop] = val;  
    }
  };
  define("bubble-view", function() {
    var BubbleView, drews, _;
    __get(window, 1);
    _ = require("underscore");
    drews = require("drews-mixins");
    return BubbleView = {
      init: function(options) {
        var el, self;
        self = {
          _type: BubbleView,
          options: options
        };
        el = $("<div>\n  <span class=\"editable\" data-prop=\"address\"></span>\n  <div class=\"editable\" data-prop=\"notes\"></div>\n  <a class=\"add-images\" href=\"#\">Add images</a>\n  \n  <div class=\"add-image-area\">\n    <textarea class=\"images\"></textarea>\n    <input class=\"save-images-button\" type=\"button\" value=\"Save images\">\n  </div>\n  <div class=\"images\">\n  \n  </div>\n</div>");
        __get(el, "css")({
          width: "300px",
          height: "300px"
        });
        __get(el, "find")("");
        __get(__get(el, "find")(".add-image-area"), "hide")();
        __get(__get(el, "find")(".add-images"), "click")(function(e) {
          __get(e, "preventDefault")();
          return __get(self, "handleAddImages")();
        });
        __get(__get(el, "find")(".save-images-button"), "click")(function(e) {
          __get(e, "preventDefault")();
          return __get(self, "handleSaveImages")();
        });
        __set(self, "el", el);
        return self;
      },
      handleAddImages: function(self) {
        return __get(__get(__get(self, "el"), "find")(".add-image-area"), "show")();
      },
      handleSaveImages: function(self) {
        var images;
        images = __get(__get(__get(__get(self, "el"), "find")(".images"), "val")(), "split")("\n");
        __get(console, "log")("the options are");
        __get(console, "log")(__get(self, "options"));
        return __get(drews, "trigger")(__get(__get(self, "options"), "triggeree"), "modelviewvalchanged", __get(__get(self, "options"), "model"), "images", images);
      }
    };
  });
}).call(this);
