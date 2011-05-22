var SignInView;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
SignInView = (function() {
  __extends(SignInView, Backbone.View);
  SignInView.prototype.questions = ["What is your fav color?", "What is your dogs maiden name?", "How many pet hampsters do you have?"];
  SignInView.prototype.signUpText = "Just type in an email and choose a question and answer";
  SignInView.prototype.signInText = "Type in your email and choose your question and answer";
  SignInView.prototype.divId = "sign-in-view";
  SignInView.prototype.createEl = function() {
    var question, questions, val;
    questions = (function() {
      var _i, _len, _ref, _results;
      _ref = this.questions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        question = _ref[_i];
        val = question.replace(/[^\w]/g, "_");
        _results.push("<option value=\"" + val + "\">" + question + "</option>");
      }
      return _results;
    }).call(this);
    return $("<div id=\"" + this.divId + "\">\n  <div class=\"top-bar\">\n    <div class=\"sign-in-wrapper\">\n      <a href=\"#\" class=\"sign-in\">Sign In</a> \n    </div>\n    <div class=\"signed-in\" style=\"display:none;\">\n      <span class=\"signed-in-as-text\">Signed in as</span>\n      <span class=\"signed-in-as\"></span>\n      <a href=\"#\" class=\"sign-out\" >Sign Out</a>\n    </div>\n  </div>\n  <div class=\"login-area\">\n    <div class=\"login\" style=\"display:none;\" class=\"login-pop-up\">\n      <div class=\"notes\">" + this.signInText + "</div> \n      <form>\n        <input type=\"text\" class=\"email\" placeholder=\"email\">\n        <br />\n        <select class=\"question\">\n          " + questions + "\n        </select>\n        <br/>\n        <input type=\"text\" class=\"password\" placeholder=\"ansswer\"/>\n        <br />\n        <input type=\"submit\" value=\"Sign In\"/>\n        <a href=\"#\" class=\"cancel-sign-in\">Cancel</a>\n      </form>\n    </div>\n  </div>\n</div>");
  };
  function SignInView(mainView) {
    this.triggerSignInClick = __bind(this.triggerSignInClick, this);
    this.submit = __bind(this.submit, this);
    this.showSignedInAs = __bind(this.showSignedInAs, this);
    this.showPopUp = __bind(this.showPopUp, this);
    this.hidePopUp = __bind(this.hidePopUp, this);
    this.triggerCancelClick = __bind(this.triggerCancelClick, this);
    this.createEl = __bind(this.createEl, this);    SignInView.__super__.constructor.apply(this, arguments);
    this.el = this.createEl();
    this.el.find('cancel-sign-in').click(__bind(function(e) {
      e.preventDefault();
      return this.triggerCancelClick();
    }, this));
    this.SignInDiv = this.el.find('.login');
    this.SignInDiv.find('form').submit(__bind(function(e) {
      e.preventDefault();
      return this.submit();
    }, this));
    this.mainView = mainView || this;
    this.visible = false;
    this.el.find(".sign-in").click(__bind(function(e) {
      e.preventDefault();
      return this.triggerSignInClick();
    }, this));
  }
  SignInView.prototype.triggerCancelClick = function(done) {
    if (done == null) {
      done = function() {};
    }
    return this.hidePopUp(done);
  };
  SignInView.prototype.hidePopUp = function(done) {
    if (done == null) {
      done = function() {};
    }
    return this.SignInDiv.hide(__bind(function() {
      this.visible = false;
      return done();
    }, this));
  };
  SignInView.prototype.showPopUp = function(d) {
    if (d == null) {
      d = function() {};
    }
    return this.SignInDiv.show(__bind(function() {
      this.visible = true;
      return d();
    }, this));
  };
  SignInView.prototype.showSignedInAs = function(email) {
    this.el.find(".signed-in-as").text(email);
    this.el.find(".signed-in").css({
      display: "block"
    });
    return this.el.find(".sign-in-wrapper").css({
      display: "none"
    });
  };
  SignInView.prototype.submit = function(d) {
    var values;
    if (d == null) {
      d = function() {};
    }
    values = {
      email: this.el.find(".email").val(),
      question: this.el.find(".question").val(),
      password: this.el.find(".password").val()
    };
    return this.mainView.trigger("signin", values, d);
  };
  SignInView.prototype.triggerSignInClick = function(done) {
    if (done == null) {
      done = function() {};
    }
    if (this.SignInDiv.is(":visible")) {
      return this.hidePopUp(done);
    } else {
      return this.showPopUp(done);
    }
  };
  return SignInView;
})();