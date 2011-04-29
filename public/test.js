var cleanDb, listingModels, map, savingAListing, server, test, tests, testsComplete;
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
  console.log("SAAAAAAAAAAAVING");
  $('#address').val("1465 E. Halifax St, Mesa, AZ 85203");
  $('#notes').val("These notes are my own");
  $('#listing-form').submit();
  _.assertEqual($('#address').val(), "", "address field should be empty");
  _.assertEqual($('#notes').val(), "", "Notes field should be empty");
  _.assertEqual($('#lat').val(), "", "Notes field should be empty");
  _.assertEqual($('#lng').val(), "", "Notes field should be empty");
  return _.wait(1000, function() {
    var latlng, newListings, oldListings;
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
    $('#reload').click();
    _.assertSee("Reloading");
    return _.wait(1000, function() {
      console.log("comparing the listings");
      newListings = _.map(app.listings.models, function(model) {
        return model.attributes.address;
      });
      _.assertEqual(_.isEqual(oldListings, newListings), 1, "Listings should be reloaded");
      _.assertNoSee("Reloading");
      return done();
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
  return console.log("" + (_.getAssertCount()) + " tests ran\n" + (_.getPassCount()) + " tests passed\n" + (_.getFailCount()) + " tests failed");
};
$(document).ready(function() {
  return _.wait(1000, function() {
    listingModels = app.listings.models;
    map = app.map.map;
    return _.series(tests, testsComplete);
  });
});