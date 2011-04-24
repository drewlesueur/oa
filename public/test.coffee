tests = {}

test = (title, func) ->
  tests[title] = func

test "title should be office atlas", (done) ->
  _.assertEqual document.title, "Office Atlas",
  "Title should equal Office Atlas"
  done()


test "A listing should load", (done) ->
  # This is for a default listing
  # If the app loads correctly, a default listing should load
  _.assertNotEqual listingModels[0].view.marker, null,
    "Marker should not be null" 
  done(null)

test "I should see the info bubble when clicking on the marker", (done) ->
  listingModels[0].view.handleMarkerClick()
  _.wait 100, () ->
    _.assertEqual $("body:contains('gilbert, az'):visible").length, 1,
     "The bubble appeared"
    listingModels[0].view.handleMarkerClick()
    _.wait 1000, () ->
      _.assertEqual $("body:contains('gilbert, az'):visible").length, 0,
        "The bubble went away"
      done()

assertSee = (text) ->
  _.assertOk $("body:contains('#{text}'):visible").length !=0,
  "Should be able to see the text '#{text}'"

test "I should be able to save", (done) -> 
  $('#address').val "1465 E. Halifax St, Mesa, AZ 85203"
  $('#notes').val "These notes are my own"
  $('#listing-form').submit()
  _.wait 1000, () ->
    latlng = map.getCenter()
    _.assertEqual latlng.lat(), "33.44187",
    "Latitude should change when adding a listing"

    _.assertEqual latlng.lng(), "-111.798698",
    "Longitutde should change when adding a listing"

    _.assertEqual map.getZoom(), 13, 
    "Should zoom in when adding a listing"

    newListings = listingModels.filter (listing) ->
      return listing.get('notes') == "These notes are my own"
    _.assertEqual newListings.length, 1, 
    "New listing should be added"
    assertSee "These notes are my own"


    oldListings = _.clone app.listings.models

    $('#reload').click()
    assertSee "Reloading"
    _.wait 1000, () ->
      _.assertEqual _.isEqual(oldListings, app.listings.models), 1,
      "Listings should be reloaded"
      done()

listingModels = null
map = null

testsComplete = (results) ->
  console.log """
    #{_.getAssertCount()} tests ran
    #{_.getPassCount()} tests passed
    #{_.getFailCount()} tests failed
  """


$(document).ready ->
  _.wait 1000, () ->
    listingModels = app.listings.models
    map = app.map.map
    _.parallel tests, testsComplete


