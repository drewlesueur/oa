var func, monkeyPatch, name, runTest, runTests, toMonkeyPatch;
var __slice = Array.prototype.slice;
_.assertClose = function(val, otherVal, within, message) {
  if (Math.abs(otherVal - val) <= within) {
    return _.assertPass(val, otherVal, message, "within " + within + " of", _.assertClose);
  } else {
    return _.assertFail(val, otherVal, message, "within " + within + " of", _.assertClose);
  }
};
_.assertSee = function(text, message) {
  if ($("body:contains('" + text + "'):visible").length !== 0) {
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
runTest = null;
runTests = null;
(function() {
  var addTmpListing, cleanDb, e, eq, getTestLink, listingModels, map, ne, noSee, ok, parallel, preRun, savingAListing, see, serial, server, test, tests, testsComplete, wait, waitForYoutube;
  see = _.assertSee, e = _.assertEqual, ne = _.assertNotEqual, eq = _.assertEqual, noSee = _.assertNoSee, serial = _.serial, parallel = _.parallel, wait = _.wait, ok = _.assertOk;
  tests = {};
  test = function(title, func) {
    return tests[title] = func;
  };
  test("title should be office atlas", function(done) {
    _.assertEqual(document.title, "Office Atlas", "Title should equal Office Atlas");
    return done();
  });
  test("I should see kyles pin marker image", function(done) {
    _.assertEqual($('[src="http://office.the.tl/pin.png"]').length > 0, true, "Should see pin");
    return done();
  });
  test("A listing should load", function(done) {
    _.assertNotEqual(listingModels[0].view.marker, null, "Marker should not be null");
    return done(null);
  });
  test("I should see the info bubble when clicking on the marker", function(done) {
    listingModels[0].view.handleMarkerClick();
    return _.wait(100, function() {
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
      notes: "These notes are my own"
    }, function() {
      console.log("done adding temporary listing");
      console.log(app.tempListing);
      return app.handleSubmit(function() {
        "address field should be empty";        var latlng, newListings, oldListings;
        _.assertEqual($('#notes').val(), "", "Notes field should be empty");
        _.assertEqual($('#lat').val(), "", "Notes field should be empty");
        _.assertEqual($('#lng').val(), "", "Notes field should be empty");
        latlng = map.getCenter();
        _.assertClose(latlng.lat(), 33.44187, .01);
        "Latitude should change when adding a listing";
        _.assertClose(latlng.lng(), -111.798698, 0.1);
        "Longitutde should change when adding a listing";
        _.assertEqual(map.getZoom(), 13, "Should zoom in when adding a listing");
        newListings = listingModels.filter(function(listing) {
          return listing.get('notes') === "These notes are my own";
        });
        _.assertEqual(newListings.length, 1, "New listing should be added");
        _.assertSee("These notes are my own");
        oldListings = _.map(_.clone(app.listings.models), function(model) {
          return model.attributes.address;
        });
        app.map.triggerReload(function() {
          newListings = _.map(app.listings.models, function(model) {
            return model.attributes.address;
          });
          _.assertEqual(_.isEqual(oldListings, newListings), 1, "Listings should be reloaded");
          _.assertNoSee("Reloading");
          return done();
        });
        return _.assertSee("Reloading");
      });
    });
  };
  cleanDb = function(done) {
    return server("cleanUpTestDb", function(err) {
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
      latlng = map.getCenter();
      _.assertClose(latlng.lat(), 33.300, 0.001, "auto lookup lat for Gangplank");
      _.assertClose(latlng.lng(), -111.841, 0.001, "auto lookup lng for ganglplank");
      _.assertSee("gangplankizzle", "the notes should auto pop up");
      $('#address').val("ray and arizone ave, mesa, az");
      $('#notes').val("egypt");
      app.map.triggerAddressChange();
      oldNewListings = _.filter(listingModels, function(model) {
        return !model.id;
      });
      return _.wait(1000, function() {
        var newNewListings;
        latlng = map.getCenter();
        _.assertClose(latlng.lat(), 33.321, 0.001, "auto lookup for egypt");
        _.assertClose(latlng.lng(), -111.841, 0.001, "auto lookup for egypt");
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
  test("typing in notes should update the bubble", function(done) {
    var listing;
    return listing = app.addTmpListing({
      address: "lds temple mesa, az",
      notes: ""
    }, function() {
      $('#notes').val("testing notes");
      app.map.triggerNotesChange();
      _.assertOk($('.notes:contains(testing notes)').length, 1, "notes should update on change");
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
  test("add listing using app.addListing", function(done) {
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
          _.assertEqual($('iframe').length, 1);
          "should have iframe youtube video";
          return done();
        });
      });
    });
  });
  test("moving the map should get rid of the video and show the image instead", function(done) {
    return addTmpListing(function(err, listing) {
      return _.wait(waitForYoutube, function() {
        return listing.view.triggerYoutubeImageClick(function() {
          _.assertEqual($('iframe').length, 1, "wax on");
          return _.wait(1000, function() {
            app.map.triggerMapCenterChanged();
            _.assertEqual($('iframe').length, 0, "wax off");
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
            _.assertEqual($('iframe').length, 0, "wax off");
            return done();
          });
        });
      });
    });
  });
  test("there should be a big play button", function(done) {
    return done();
  });
  test("There should be a login", function(done) {
    $("#sign-in").length.shouldBe(1, "should be login");
    $("#sign-up").length.shouldBe(1, "see ceate account");
    return done();
  });
  test("Sign in should pop up the question answer thing", function(done) {
    return _.series([
      app.signInView.triggerSignInClick, function(done) {
        $("#email").length.shouldBe(1, "see email field");
        $("#question:visible").length.shouldBe(1, "see password question");
        $("#password:visible").length.shouldBe(1, "see password");
        _.assertOk(!($("#sign-in").is(":visible")), "shouldnt see sign in");
        return done();
      }
    ], function(err, results) {
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
  listingModels = null;
  map = null;
  server = function(method, callback) {
    var args, _ref;
    if (_.isArray(method)) {
      _ref = method, method = _ref[0], args = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
    }
    return $.ajax({
      url: "/" + method,
      type: "POST",
      contentType: 'application/json',
      data: args,
      dataType: 'json',
      processData: false,
      success: function(data) {
        return callback(null, data);
      },
      error: function(data) {
        return callback(data);
      }
    });
  };
  testsComplete = function(err, results) {
    server("cleanUpTestDb", function(err, result) {
      if (!err) {
        return liteAlert("data cleaned");
      }
    });
    results = "" + (_.getAssertCount()) + " tests ran\n" + (_.getPassCount()) + " tests passed\n" + (_.getFailCount()) + " tests failed";
    _.setAssertCount(0);
    _.setPassCount(0);
    _.setFailCount(0);
    $('#test-text').html(results.replace(/\n/g, "<br />"));
    return console.log(results);
  };
  getTestLink = function(test) {
    return "#tests/" + (test.replace(/\s/g, '_'));
  };
  $(document).ready(function() {
    return _.each(tests, function(val, key) {
      return $('#tests').append($("<div><a href='" + (getTestLink(key)) + "'>" + key + "</div>"));
    });
  });
  preRun = function() {
    app.bind("error", function(err) {
      return console.log("ERROR! " + err);
    });
    listingModels = app.listings.models;
    return map = app.map.map;
  };
  runTest = function(testName) {
    testName = testName.replace(/_/g, " ");
    return _.wait(1000, function() {
      preRun();
      return _.series([tests[testName]], testsComplete);
    });
  };
  return runTests = function() {
    return _.wait(1000, function() {
      var newTests;
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
})();