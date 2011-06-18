var func, monkeyPatch, name, officeTest, toMonkeyPatch;
var __slice = Array.prototype.slice;
_.assertClose = function(val, otherVal, within, message) {
  if (Math.abs(otherVal - val) <= within) {
    return _.assertPass(val, otherVal, message, "within " + within + " of", _.assertClose);
  } else {
    return _.assertFail(val, otherVal, message, "within " + within + " of", _.assertClose);
  }
};
_.assertSee = function(text, message) {
  var list, possibles;
  possibles = $("body:contains('" + text + "'):visible");
  list = _.s(possibles, -1);
  if (list.length !== 0) {
    return _.assertPass(text, "[html body]", message, "see", _.assertSee);
  } else {
    return _.assertFail(text, "[html body]", message, "see", _.assertSee);
  }
};
_.assertNoSee = function(text, message) {
  if ($("body:contains('" + text + "'):visible").length !== 0) {
    return _.assertFail(text, "not that!", message, "see", _.assertSee);
  } else {
    return _.assertPass(text, "[html body]", message, "see", _.assertSee);
  }
};
monkeyPatch = function(obj, name, func) {
  return obj[name] = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return func.apply(this, [this].concat(args));
  };
};
toMonkeyPatch = {
  "shouldBe": _.assertEqual,
  "shouldNotBe": _.assertNotEqual,
  "wait": _.wait
};
for (name in toMonkeyPatch) {
  func = toMonkeyPatch[name];
  monkeyPatch(Number.prototype, name, func);
  monkeyPatch(String.prototype, name, func);
}
officeTest = (function() {
  var addTmpListing, bind, cleanDb, clone, doneMaker, e, eq, getTestLink, indexOf, isEqual, key, keys, listingModels, map, ne, newTests, noSee, ok, onHaveAllCards, parallel, preRun, runTest, runTestWhenReady, runTests, runTestsWhenReady, s, savingAListing, see, self, series, takeCard, test, testKeys, tests, testsComplete, times, trigger, wait, waitForYoutube, _i, _len, _ref;
  see = _.assertSee, e = _.assertEqual, ne = _.assertNotEqual, eq = _.assertEqual, noSee = _.assertNoSee, series = _.series, parallel = _.parallel, wait = _.wait, ok = _.assertOk, keys = _.keys, isEqual = _.isEqual, s = _.s, doneMaker = _.doneMaker, bind = _.addListener, trigger = _.trigger, map = _.map, indexOf = _.indexOf, clone = _.clone, times = _.times;
  _ref = doneMaker(), takeCard = _ref[0], onHaveAllCards = _ref[1];
  tests = {};
  test = function(title, func) {
    return tests[title] = func;
  };
  test("title should be office atlas", function(done) {
    _.assertEqual(document.title, "Office Atlas", "Title should equal Office Atlas");
    return done();
  });
  test("I should see kyles pin marker image", function(done) {
    return done();
    _.assertEqual($('[src="http://office.the.tl/pin.png"]').length > 0, true, "Should see pin");
    return done();
  });
  test("A listing should load", function(done) {
    _.assertNotEqual(listingModels[0].view.marker, null, "Marker should not be null");
    return done(null);
  });
  test("I should see the info bubble when clicking on the marker", function(done) {
    listingModels[0].view.handleMarkerClick();
    return _.wait(waitForYoutube, function() {
      _.assertEqual($("body:contains('gilbert, az'):visible").length, 1, "The bubble appeared");
      listingModels[0].view.handleMarkerClick();
      return _.wait(1000, function() {
        _.assertEqual($("body:contains('gilbert, az'):visible").length, 0, "The bubble went away");
        return done();
      });
    });
  });
  savingAListing = function(done) {
    return app.addTmpListing({
      address: "1465 E. Halifax St, Mesa, AZ 85203",
      notes: "These notes are my own",
      youtube: "http://www.youtube.com/watch?v=JbJ42pzLMmI&feature=player_embedded#at=31"
    }, function() {
      console.log("done adding temporary listing");
      console.log(app.tempListing);
      _.assertSee("These notes are my own", "see the notes of a listing");
      return app.handleSubmit(function() {
        var latlng, newListings, oldListings;
        eq($('#notes').val(), "", "Notes field should be empty");
        eq($('#lat').val(), "", "Notes field should be empty");
        eq($('#lng').val(), "", "Notes field should be empty");
        latlng = app.map.getCenter();
        eq(latlng.lat(), 33.44187, .01, "Latitude should change when adding a listing");
        eq(latlng.lng(), -111.798698, 0.1, "Longitutde should change when adding a listing");
        eq(app.map.getZoom(), 13, "Should zoom in when adding a listing");
        newListings = listingModels.filter(function(listing) {
          return listing.get('notes') === "These notes are my own";
        });
        eq(newListings.length, 1, "New listing should be added");
        oldListings = map(clone(app.listings.models), function(model) {
          return model.attributes.address;
        });
        app.map.triggerReload(function() {
          newListings = map(app.listings.models, function(model) {
            return model.attributes.address;
          });
          log("old and new listings");
          log(oldListings);
          log(newListings);
          eq(isEqual(oldListings, newListings), 1, "Listings should be reloaded");
          noSee("Reloading");
          return done();
        });
        return _.assertSee("Reloading");
      });
    });
  };
  cleanDb = function(done) {
    return jsonPost("/cleanUpTestDb", function(err) {
      return done();
    });
  };
  test("I should be able to save", function(done) {
    return _.series([cleanDb, savingAListing, cleanDb], function() {
      return done();
    });
  });
  test("starting to type should auto look up", function(done) {
    $('#address').val("250 s. arizona ave, chandler, az");
    $("#notes").val("gangplankizzle");
    return app.map.triggerAddressChange(function() {
      var latlng, oldNewListings;
      latlng = app.map.getCenter();
      _.assertClose(latlng.lat(), 33.300, 0.001, "auto lookup lat for Gangplank");
      _.assertClose(latlng.lng(), -111.841, 0.001, "auto lookup lng for ganglplank");
      _.assertSee("gangplankizzle", "the notes should auto pop up");
      $('#address').val("ray and arizone ave, mesa, az");
      $('#notes').val("egypt");
      app.map.triggerAddressChange();
      oldNewListings = _.filter(listingModels, function(model) {
        return !model.id;
      });
      return _.wait(waitForYoutube, function() {
        var newNewListings;
        latlng = app.map.getCenter();
        _.assertClose(latlng.lat(), 33.361, 0.05, "auto lookup for egypt lat");
        _.assertClose(latlng.lng(), -111.841, 0.05, "auto lookup for egypt lng");
        newNewListings = _.filter(listingModels, function(model) {
          return !model.id;
        });
        _.assertNoSee("gangplankizzle", "Should not see gangplankizzle");
        _.assertEqual(oldNewListings.length, newNewListings.length, "only one non saved listing at a time");
        return done();
      });
    });
  });
  test("There should be a youtube video video box", function(done) {
    _.assertSee("Youtube html");
    return done();
  });
  test("There should be a square feet box", function(done) {
    _.assertSee("Square Ft.", "see sqaure feet");
    return done();
  });
  test("There should be a price box", function(done) {
    _.assertSee("Price", "see price");
    return done();
  });
  test("typing should update the bubble", function(done) {
    var listing;
    return listing = app.addTmpListing({
      address: "lds temple mesa, az",
      notes: ""
    }, function() {
      $('#notes').val("testing notes");
      app.map.triggerNotesChange();
      ok($('.notes:contains(testing notes)').length, 1, "notes should update on change");
      $('#price').val("100 dollars");
      app.map.triggerValueChange("price");
      eq($('.price:contains(100 dollars)').length, 1, "price should update on change");
      $('#squareFeet').val("2sqft.");
      app.map.triggerValueChange("squareFeet");
      eq($('.squareFeet:contains(2sqft.)').length, 1, "sqft should update");
      console.log(app.tempListing);
      eq(app.tempListing.get("price"), "100 dollars");
      eq(app.tempListing.get("squareFeet"), "2sqft.");
      eq(app.tempListing.get("notes"), "testing notes");
      app.listings.remove(listing);
      return done();
    });
  });
  test("Youtube parser", function(done) {
    var t, y;
    return done();
    y = new YoutubeParser('<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
    _.assertEqual(y.id, "H1G2YnKanWs");
    _.assertEqual(y.getBigImage(), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg");
    _.assertEqual(y.getLittleImage(1), "http://img.youtube.com/vi/H1G2YnKanWs/1.jpg");
    _.assertEqual(y.getLittleImage(2), "http://img.youtube.com/vi/H1G2YnKanWs/2.jpg");
    _.assertEqual(y.getLittleImage(3), "http://img.youtube.com/vi/H1G2YnKanWs/3.jpg");
    _.assertEqual(y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
    _.assertEqual(y.width, 425);
    _.assertEqual(y.height, 349);
    y = new YoutubeParser('http://www.youtube.com/watch?v=VnXTlclUyfg&feature=channel_video_title');
    _.assertEqual(y.id, "VnXTlclUyfg", "youtube link");
    _.assertEqual(y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/VnXTlclUyfg"></iframe>');
    _.assertEqual(y.link, "http://www.youtube.com/watch?v=VnXTlclUyfg&feature=channel_video_title");
    y = new YoutubeParser('http://www.youtube.com/user/DrewLeSueur2#p/u/3/o1N9Y_1QROs');
    _.assertEqual(y.id, "o1N9Y_1QROs");
    _.assertEqual(y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/o1N9Y_1QROs"></iframe>');
    _.assertEqual(y.link, 'http://www.youtube.com/user/DrewLeSueur2#p/u/3/o1N9Y_1QROs');
    y = new YoutubeParser('<iframe width="560" height="349" src="http://www.youtube.com/embed/TzRvt8ehYD0?rel=0" frameborder="0" allowfullscreen></iframe>');
    _.assertEqual(y.id, "TzRvt8ehYD0");
    t = new YoutubeParser('');
    _.assertEqual(t.id, null);
    _.assertEqual(t.getBigImage(), null);
    _.assertEqual(t.getLittleImage(1), null);
    _.assertEqual(t.getLittleImage(2), null);
    _.assertEqual(t.getLittleImage(3), null);
    return done();
  });
  test("should be able to add youtube video", function(done) {
    var listing;
    return listing = app.addTmpListing({
      address: "lds temple mesa, az",
      notes: "",
      youtube: ""
    }, function() {
      var img;
      $('#youtube').val('<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
      app.map.triggerYoutubeChange();
      img = $('.youtube img:visible');
      _.assertOk(img.attr("src"), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg");
      _.assertEqual(img.width(), 425);
      return done();
    });
  });
  addTmpListing = function(cb) {
    var listing;
    if (cb == null) {
      cb = function() {};
    }
    return listing = app.addTmpListing({
      address: "scottsdale, az",
      youtube: '<iframe width="425" height="349" src="http://www.youtube.com/embed/_OBlgSz8sSM" frameborder="0" allowfullscreen></iframe>'
    }, function(err, listing) {
      return cb(null, listing);
    });
  };
  waitForYoutube = 3000;
  test("should be able to play a you tube video", function(done) {
    var listing;
    return listing = app.addTmpListing({
      address: "scottsdale, az",
      youtube: '<iframe width="425" height="349" src="http://www.youtube.com/embed/_OBlgSz8sSM" frameborder="0" allowfullscreen></iframe>'
    }, function() {
      return _.wait(waitForYoutube, function() {
        return app.tempListing.view.triggerYoutubeImageClick(function() {
          _.assertEqual($('iframe.video-iframe').length, 1, "should have iframe youtube video");
          return done();
        });
      });
    });
  });
  test("moving the map should get rid of the video and show the image instead", function(done) {
    return addTmpListing(function(err, listing) {
      return _.wait(waitForYoutube, function() {
        return listing.view.triggerYoutubeImageClick(function() {
          _.assertEqual($('iframe.video-iframe').length, 1, "wax on");
          return _.wait(1000, function() {
            app.map.triggerMapCenterChanged();
            _.assertEqual($('iframe.video-iframe').length, 0, "wax off");
            return done();
          });
        });
      });
    });
  });
  test("Closing the bubble should remove the youtube video", function(done) {
    return addTmpListing(function(err, listing) {
      return _.wait(waitForYoutube, function() {
        return listing.view.triggerYoutubeImageClick(function() {
          return _.wait(1000, function() {
            listing.view.handleBubbleClose();
            _.assertEqual($('iframe.video-iframe').length, 0, "wax off");
            return done();
          });
        });
      });
    });
  });
  test("there should be a big play button", function(done) {
    return done();
  });
  test("There should be a signin / sign up", function(done) {
    $(".sign-in").length.shouldBe(1, "should be login");
    return done();
  });
  test("Sign in should pop up the question answer thing", function(done) {
    return _.series([
      app.signInView.triggerSignInClick, function(done) {
        $(".email").length.shouldBe(1, "see email field");
        $(".question:visible").length.shouldBe(1, "see password question");
        $(".password:visible").length.shouldBe(1, "see password");
        eq($(".cancel-sign-in:visible").length, 1, "see cancel sign in");
        return done();
      }
    ], function(err, results) {
      return done();
    });
  });
  test("cancel sign in ", function(done) {
    return series([app.signInView.triggerSignInClick, app.signInView.triggerCancelClick], function(err, results) {
      eq(app.signInView.visible, false, "shouln't see the popup");
      return done();
    });
  });
  test("new wait syntax", function(done) {
    (1000).wait(function() {
      console.log("waited");
      return "test".shouldBe("test");
    });
    wait(1000, function() {
      console.log("also waited");
      ok(true, "ok should be ok");
      eq("this", "this", "shorthand equal");
      ne("that", "this", "shortahdn not equal");
      return see("office", "should see office");
    });
    return wait(2000, function() {
      return done();
    });
  });
  test("shouldnt see sign out", function(d) {
    eq($("#sign-in-view .sign-out").is(":visible"), false);
    return d();
  });
  test("can login (can sign in)", function(d) {
    var badLogInTests, badLogin, logInTests, login, rightCreds;
    login = function(d) {
      app.signInView.el.find('.email').val("drewalex@gmail.com");
      app.signInView.el.find('.question').val("What_is_your_fav_color_");
      app.signInView.el.find('.password').val("blue");
      return app.signInView.submit(function() {
        return d();
      });
    };
    badLogin = function(d) {
      app.signInView.el.find('.email').val("drewalex@gmail.com");
      app.signInView.el.find('.question').val("What_is_your_fav_color_");
      app.signInView.el.find('.password').val("red");
      return app.signInView.submit(function() {
        return d();
      });
    };
    rightCreds = function(d) {
      return jsonPost("/whoami", function(err, result) {
        eq(result.email, "drewalex@gmail.com", "should have my email");
        return d();
      });
    };
    logInTests = function(d) {
      ok(app.signInView.visible === false, "no see popup");
      ok(app.signInView.el.find(".signed-in-as:contains('drew')").length >= 1, "should see signed in as");
      ok(app.signInView.el.find(".sign-out").is(":visible"), "should see sign out");
      ok(app.signInView.el.find(".email").val() === "", "email is empty");
      ok(app.signInView.el.find(".password").val() === "", "password is empty");
      return d();
    };
    badLogInTests = function(d) {
      ok(app.signInView.visible === false, "no see popup");
      ok(app.signInView.el.find(".signed-in-as:contains('drew')").length === 0, "should not see signed in as");
      ok(!app.signInView.el.find(".sign-out").is(":visible"), "should not see sign out");
      ok(app.signInView.el.find(".email").val() === "drewalex@gmail.com", "email isn't empty");
      ok(app.signInView.el.find(".password").val() === "", "password is empty");
      return d();
    };
    return series([
      function(d) {
        return jsonPost("/deleteTestUsers", function() {
          return d();
        });
      }, app.signInView.triggerSignInClick, login, rightCreds, logInTests, app.signInView.triggerSignOutClick, function(d) {
        return jsonPost("/whoami", function(err, result) {
          ok(!("email" in result));
          return d();
        });
      }, login, rightCreds, logInTests, app.signInView.triggerSignOutClick, badLogin, badLogInTests
    ], function(err) {
      eq(err, null, "no error on logging in");
      return d();
    });
  });
  test("auto fill in the question", function(d) {
    return jsonPost("/sessions", {
      email: "drewalex@gmail.com",
      question: "What_is_your_fav_color_",
      password: "blue"
    }, function(err, result) {
      var onEmailEntered;
      app.signInView.triggerSignInClick();
      $(".question").val("What_is_your_dogs_maiden_name_");
      $(".email").val("drewalex@gmail.com");
      app.signInView.triggerEmailEntered();
      onEmailEntered = function() {
        eq($(".question").val(), "What_is_your_fav_color_", "auto fill in quesiton");
        app.signInView.triggerCancelClick();
        app.unbind("doneLookupQuestion", onEmailEntered);
        return d();
      };
      return app.bind("doneLookupQuestion", onEmailEntered);
    });
  });
  test("server test", function(d) {
    return jsonPost("/json_test", function(err, json) {
      eq(err, null, "should not get error from test json");
      eq(json.a, 1);
      eq(json.band.name, "aterciopelados");
      return d();
    });
  });
  test("add listing using app.addListing", function(done) {
    var rawListing;
    rawListing = {
      address: "maricopa, az",
      notes: "maricopa notes",
      youtube: "http://www.youtube.com/watch?v=S6L9wccThyA"
    };
    return app.addListing(rawListing, function(err, listing) {
      ok(!err, "no error while calling add lisging");
      return jsonGet("/listings", function(err, listings) {
        var notes;
        notes = map(listings, function(listing) {
          return listing.notes;
        });
        ok(indexOf(notes, "maricopa notes") !== -1, "notes should appear in the add listing");
        return done();
      });
    });
  });
  (function() {
    var rawListing, rawUser, returnCard;
    return;
    returnCard = takeCard();
    rawListing = {
      address: "maricopa, az",
      notes: "maricopa notes",
      youtube: "http://www.youtube.com/watch?v=S6L9wccThyA"
    };
    rawUser = {
      email: "drewalex@gmail.com",
      question: "What_is_your_fav_color_",
      password: "blue"
    };
    return series([
      function() {
        return app.signIn(rawUser);
      }, function() {
        return app.addListing(rawListing);
      }
    ], function(err, results) {
      test("editing a listing", function(d) {
        return d();
      });
      return returnCard();
    });
  })();
  test("some random ui tests", function(d) {
    return d();
  });
  test("file upload", function(d) {
    return d();
  });
  testKeys = keys(tests).reverse();
  log(testKeys);
  newTests = {};
  for (_i = 0, _len = testKeys.length; _i < _len; _i++) {
    key = testKeys[_i];
    newTests[key] = tests[key];
  }
  tests = newTests;
  listingModels = null;
  testsComplete = function(err, results) {
    var failedMessages, failures, message, _j, _len2;
    jsonPost("/cleanUpTestDb", function(err, result) {
      if (!err) {
        return liteAlert("data cleaned");
      }
    });
    failures = "<ul>";
    failedMessages = _.getFailedMessages();
    for (_j = 0, _len2 = failedMessages.length; _j < _len2; _j++) {
      message = failedMessages[_j];
      failures += "<li>" + message + "</li>";
    }
    failures += "</ul>";
    results = "" + (_.getAssertCount()) + " tests ran\n" + (_.getPassCount()) + " tests passed\n" + (_.getFailCount()) + " tests failed\nThe failed tests were " + failures;
    _.setAssertCount(0);
    _.setPassCount(0);
    _.setFailCount(0);
    $('#test-text').html(results.replace(/\n/g, "<br />"));
    return console.log(results);
  };
  getTestLink = function(test) {
    return "#tests/" + (test.replace(/\s/g, '_'));
  };
  self = {
    testsReady: false
  };
  (function() {
    var returnCard;
    returnCard = takeCard();
    return $(function() {
      return returnCard();
    });
  })();
  onHaveAllCards(function() {
    self.testsReady = true;
    trigger(self, "testsready");
    return _.each(tests, function(val, key) {
      return $('#tests').append($("<div><a href='" + (getTestLink(key)) + "'>" + key + "</div>"));
    });
  });
  runTestWhenReady = function(test) {
    if (self.testsReady) {
      return runTest(test);
    } else {
      return bind(self, "testsready", function() {
        return runTest(test);
      });
    }
  };
  runTestsWhenReady = function() {
    if (self.testsReady) {
      return runTests();
    } else {
      return bind(self, "testsready", function() {
        return runTests();
      });
    }
  };
  preRun = function() {
    app.bind("error", function(err) {
      return console.log("ERROR! " + err);
    });
    return listingModels = app.listings.models;
  };
  runTest = function(testName) {
    testName = testName.replace(/_/g, " ");
    return _.wait(1000, function() {
      preRun();
      return _.series([tests[testName]], testsComplete);
    });
  };
  runTests = function() {
    return _.wait(1000, function() {
      preRun();
      newTests = {};
      _.each(tests, function(test, key) {
        return newTests[key] = function(done) {
          console.log(key + (" http://office.the.tl/" + (getTestLink(key))));
          return test(done);
        };
      });
      return _.series(newTests, testsComplete);
    });
  };
  self.runTest = runTest;
  self.runTestWhenReady = runTestWhenReady;
  self.runTests = runTests;
  self.runTestsWhenReady = runTestsWhenReady;
  return self;
})();