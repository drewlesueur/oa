_.assertClose = (val, otherVal, within, message) ->
  if Math.abs(otherVal - val) <= within
    _.assertPass val, otherVal, message, "within #{within} of", _.assertClose
  else
    _.assertFail val, otherVal, message, "within #{within} of", _.assertClose

_.assertSee = (text, message) ->
  if $("body:contains('#{text}'):visible").length !=0
    _.assertPass text, "[html body]", message, "see", _.assertSee 
  else
    _.assertFail text, "[html body]", message, "see", _.assertSee 

_.assertNoSee = (text, message) ->
  if $("body:contains('#{text}'):visible").length !=0
    _.assertFail text, "not that!", message, "see", _.assertSee 
  else
    _.assertPass text, "[html body]", message, "see", _.assertSee 

tests = {}

test = (title, func) ->
  tests[title] = func

test "title should be office atlas", (done) ->
  _.assertEqual document.title, "Office Atlas",
  "Title should equal Office Atlas"
  done()

test "I should see kyles pin marker image", (done) ->
  _.assertEqual $('[src="http://office.the.tl/pin.png"]').length > 0, true, "Should see pin"
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



savingAListing = (done) ->
  $('#address').val "1465 E. Halifax St, Mesa, AZ 85203"
  $('#notes').val "These notes are my own"
  #$('#listing-form').submit()
  app.handleSubmit () ->
    "address field should be empty"
    _.assertEqual $('#notes').val(), "",
    "Notes field should be empty"
    _.assertEqual $('#lat').val(), "",
    "Notes field should be empty"
    _.assertEqual $('#lng').val(), "",
    "Notes field should be empty"
    latlng = map.getCenter()
    _.assertClose latlng.lat(), 33.44187, .01
    "Latitude should change when adding a listing"

    _.assertClose latlng.lng(), -111.798698, 0.1
    "Longitutde should change when adding a listing"

    _.assertEqual map.getZoom(), 13, 
    "Should zoom in when adding a listing"

    
    newListings = listingModels.filter (listing) ->
      return listing.get('notes') == "These notes are my own"
    _.assertEqual newListings.length, 1, 
    "New listing should be added"
    _.assertSee "These notes are my own"

    oldListings = _.map _.clone(app.listings.models), (model) -> model.attributes.address

    $('#reload').click()
    _.assertSee "Reloading"
    _.wait 1000, () ->
      newListings = _.map app.listings.models, (model) -> model.attributes.address
      _.assertEqual _.isEqual(oldListings, newListings), 1,
      "Listings should be reloaded"
      _.assertNoSee "Reloading"
      done()


cleanDb = (done) ->
  server "cleanUpTestDb", (err) ->
    done()

test "I should be able to save", (done) -> 
  _.series [cleanDb, savingAListing, cleanDb], () -> done()



test "starting to type should auto look up", (done) ->
  $('#address').val "250 s. arizona ave, chandler, az"
  $("#notes").val "gangplankizzle"
  app.map.triggerAddressChange () ->
    latlng = map.getCenter()
    _.assertClose latlng.lat(), 33.300, 0.001, "auto lookup lat for Gangplank"
    _.assertClose latlng.lng(), -111.841, 0.001, "auto lookup lng for ganglplank"
    _.assertSee "gangplankizzle", "the notes should auto pop up"

    $('#address').val "ray and arizone ave, mesa, az"
    $('#notes').val "egypt"
    app.map.triggerAddressChange()

    oldNewListings = _.filter listingModels, (model) -> not model.id
    _.wait 1000, () ->
      latlng = map.getCenter()
      _.assertClose latlng.lat(), 33.321, 0.001, "auto lookup for egypt"
      _.assertClose latlng.lng(), -111.841, 0.001, "auto lookup for egypt"
      newNewListings = _.filter listingModels, (model) -> not model.id
      _.assertNoSee "gangplankizzle", "Should not see gangplankizzle"
      _.assertEqual oldNewListings.length, newNewListings.length, "only one non saved listing at a time"
      done()

     
test "There should be a youtube video video box", (done) ->
  _.assertSee "Youtube html"
  done()

test "typing in notes should update the bubble", (done) ->
  listing = app.addTmpListing
    address: "lds temple mesa, az"
    notes: ""
  , () ->
    $('#notes').val "testing notes"
    app.map.triggerNotesChange()
    _.assertOk $('.notes:contains(testing notes)').length, 1,
    "notes should update on change"
    app.listings.remove listing
    done()

test "should be able to add youtube video", (done) ->
  listing = app.addTmpListing
    address: "lds temple mesa, az"
    notes: ""
    youtube: ""
  , () ->
    $('#youtube').val '<iframe width="425" height="349" src="http://www.youtube.com/embed/UmFjNiiVk9w" frameborder="0" allowfullscreen></iframe>'
    app.map.triggerYoutubeChange()
    _.assertOk $('.notes:contains(testing notes)').length, 1,
    "notes should update on change"
    done()
  
 
    
test "add listing using app.addListing", (done) ->
  done()

    


listingModels = null
map = null

server = (method, callback) ->
  if _.isArray method
    [method, args...] = method
  $.ajax 
    url: "/#{method}"
    type: "POST"
    contentType: 'application/json'
    data: args
    dataType: 'json'
    processData: false
    success: (data) -> callback null, data
    error: (data) -> callback data

testsComplete = (err, results) -> 
  server "cleanUpTestDb", (err, result) ->
    if not err then liteAlert "data cleaned"
    
    

  results = """
    #{_.getAssertCount()} tests ran
    #{_.getPassCount()} tests passed
    #{_.getFailCount()} tests failed
  """

  $('#test-text').html results.replace /\n/g, "<br />"
  console.log results
  
$(document).ready () ->
  _.each tests, (val, key) ->
    $('#tests').append $ "<div><a href=\"#tests/#{key.replace(/\s/g, '_')}\">#{key}</a></div>"

runTest = (testName) ->
  testName = testName.replace /_/g, " "
  _.wait 1000, () ->
    listingModels = app.listings.models
    map = app.map.map
    _.series [tests[testName]], testsComplete
  
runTests = () ->
  _.wait 1000, () ->
    listingModels = app.listings.models
    map = app.map.map
    newTests = {}
    _.each tests, (test, key) ->
      newTests[key] = (done) -> 
        console.log key
        test(done)
    _.series newTests, testsComplete
