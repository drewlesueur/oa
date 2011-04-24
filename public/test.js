var assertSee, listingModels, map, test, tests, testsComplete;
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
assertSee = function(text) {
  return _.assertOk($("body:contains('" + text + "'):visible").length !== 0, "Should be able to see the text '" + text + "'");
};
test("I should be able to save", function(done) {
  $('#address').val("1465 E. Halifax St, Mesa, AZ 85203");
  $('#notes').val("These notes are my own");
  $('#listing-form').submit();
  return _.wait(1000, function() {
    var latlng, newListings, oldListings;
    latlng = map.getCenter();
    _.assertEqual(latlng.lat(), "33.44187", "Latitude should change when adding a listing");
    _.assertEqual(latlng.lng(), "-111.798698", "Longitutde should change when adding a listing");
    _.assertEqual(map.getZoom(), 13, "Should zoom in when adding a listing");
    newListings = listingModels.filter(function(listing) {
      return listing.get('notes') === "These notes are my own";
    });
    _.assertEqual(newListings.length, 1, "New listing should be added");
    assertSee("These notes are my own");
    oldListings = _.clone(app.listings.models);
    $('#reload').click();
    assertSee("Reloading");
    return _.wait(1000, function() {
      _.assertEqual(_.isEqual(oldListings, app.listings.models), 1, "Listings should be reloaded");
      return done();
    });
  });
});
listingModels = null;
map = null;
testsComplete = function(results) {
  return console.log("" + (_.getAssertCount()) + " tests ran\n" + (_.getPassCount()) + " tests passed\n" + (_.getFailCount()) + " tests failed");
};
$(document).ready(function() {
  return _.wait(1000, function() {
    listingModels = app.listings.models;
    map = app.map.map;
    return _.parallel(tests, testsComplete);
  });
});