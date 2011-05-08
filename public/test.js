var cleanDb, getTestLink, listingModels, map, preRun, runTest, runTests, savingAListing, server, test, tests, testsComplete;
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
      "address field should be empty";      var latlng, newListings, oldListings;
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
test("should be able to add youtube video", function(done) {
  var listing;
  return listing = app.addTmpListing({
    address: "lds temple mesa, az",
    notes: "",
    youtube: ""
  }, function() {
    $('#youtube').val('<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
    app.map.triggerYoutubeChange();
    _.assertOk($('.youtube img:visible').attr("src"), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg");
    return done();
  });
});
test("should be able to play a you tube video", function(done) {
  var listing;
  return listing = app.addTmpListing({
    address: "scottsdale, az",
    youtube: '<iframe width="425" height="349" src="http://www.youtube.com/embed/_OBlgSz8sSM" frameborder="0" allowfullscreen></iframe>'
  }, function() {
    return app.tempListing.view.triggerYoutubeImageClick(function() {
      _.assertOk(app.tempListing.view.getBubbleDiv().find("iframe").length === 1, "should have iframe youtube video");
      return done();
    });
  });
});
test("Youtube parser", function(done) {
  var t, y;
  y = new YoutubeParser('<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
  _.assertEqual(y.id, "H1G2YnKanWs");
  _.assertEqual(y.getBigImage(), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg");
  _.assertEqual(y.getLittleImage(1), "http://img.youtube.com/vi/H1G2YnKanWs/1.jpg");
  _.assertEqual(y.getLittleImage(2), "http://img.youtube.com/vi/H1G2YnKanWs/2.jpg");
  _.assertEqual(y.getLittleImage(3), "http://img.youtube.com/vi/H1G2YnKanWs/3.jpg");
  _.assertEqual(y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>');
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
runTests = function() {
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