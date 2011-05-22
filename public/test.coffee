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


# This could be bad, experimenting with extending native javascript objects
# / Monkeypatching javascript

monkeyPatch = (obj, name, func) ->
  obj[name] = (args...) ->
    return func.apply this, [this].concat args
  
toMonkeyPatch =
  "shouldBe" : _.assertEqual
  "shouldNotBe" : _.assertNotEqual
  "wait" : _.wait


for name, func of toMonkeyPatch
  #monkeyPatch Object, name, func
  monkeyPatch Number.prototype, name, func
  monkeyPatch String.prototype, name, func

#polluting window
#for name, func of _
#  window[name] = func

runTest = null
runTests = null
do () ->
  # some coffeescript destructuring assignments
  {
    assertSee: see
    assertEqual: e
    assertNotEqual: ne
    assertEqual: eq #again
    assertNoSee: noSee
    series: series
    parallel: parallel
    wait: wait
    assertOk: ok
  } = _
  
  
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
    app.addTmpListing
      address: "1465 E. Halifax St, Mesa, AZ 85203"
      notes:  "These notes are my own"
    , () ->
      console.log "done adding temporary listing"
      console.log app.tempListing
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

        app.map.triggerReload () ->
          newListings = _.map app.listings.models, (model) -> model.attributes.address
          _.assertEqual _.isEqual(oldListings, newListings), 1,
          "Listings should be reloaded"
          _.assertNoSee "Reloading"
          done()
        _.assertSee "Reloading"


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

  test "Youtube parser", (done) ->
    #TODO fix this!!
    return done()
    y = new YoutubeParser('<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>')
    _.assertEqual y.id, "H1G2YnKanWs"
    _.assertEqual y.getBigImage(), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg"
    _.assertEqual y.getLittleImage(1), "http://img.youtube.com/vi/H1G2YnKanWs/1.jpg"
    _.assertEqual y.getLittleImage(2), "http://img.youtube.com/vi/H1G2YnKanWs/2.jpg"
    _.assertEqual y.getLittleImage(3), "http://img.youtube.com/vi/H1G2YnKanWs/3.jpg"
    _.assertEqual y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>'
    _.assertEqual y.width, 425
    _.assertEqual y.height, 349

    y = new YoutubeParser 'http://www.youtube.com/watch?v=VnXTlclUyfg&feature=channel_video_title'
    _.assertEqual y.id, "VnXTlclUyfg", "youtube link" 
    _.assertEqual y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/VnXTlclUyfg"></iframe>'
    _.assertEqual y.link, "http://www.youtube.com/watch?v=VnXTlclUyfg&feature=channel_video_title"

    y = new YoutubeParser 'http://www.youtube.com/user/DrewLeSueur2#p/u/3/o1N9Y_1QROs'
    _.assertEqual y.id, "o1N9Y_1QROs"
    _.assertEqual y.embed, '<iframe width="425" height="349" src="http://www.youtube.com/embed/o1N9Y_1QROs"></iframe>'
    _.assertEqual y.link, 'http://www.youtube.com/user/DrewLeSueur2#p/u/3/o1N9Y_1QROs'

    y = new YoutubeParser '<iframe width="560" height="349" src="http://www.youtube.com/embed/TzRvt8ehYD0?rel=0" frameborder="0" allowfullscreen></iframe>'
    _.assertEqual y.id, "TzRvt8ehYD0"


    t = new YoutubeParser ''
    _.assertEqual t.id, null
    _.assertEqual t.getBigImage(), null
    _.assertEqual t.getLittleImage(1), null
    _.assertEqual t.getLittleImage(2), null
    _.assertEqual t.getLittleImage(3), null
    done()
      
  test "add listing using app.addListing", (done) ->
    done()

  test "should be able to add youtube video", (done) ->
    listing = app.addTmpListing
      address: "lds temple mesa, az"
      notes: ""
      youtube: ""
    , () ->
      $('#youtube').val '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>'
      app.map.triggerYoutubeChange()
      img = $('.youtube img:visible') 
      _.assertOk img.attr("src"), "http://img.youtube.com/vi/H1G2YnKanWs/0.jpg"
      _.assertEqual img.width(), 425
      # _.assertEqual img.height(), 349
      done()
      

  addTmpListing = (cb=->) ->
    listing = app.addTmpListing
      address: "scottsdale, az"
      youtube: '<iframe width="425" height="349" src="http://www.youtube.com/embed/_OBlgSz8sSM" frameborder="0" allowfullscreen></iframe>'
    , (err, listing) ->
      cb(null, listing)

  waitForYoutube = 3000

  test "should be able to play a you tube video", (done) ->
    listing = app.addTmpListing
      address: "scottsdale, az"
      youtube: '<iframe width="425" height="349" src="http://www.youtube.com/embed/_OBlgSz8sSM" frameborder="0" allowfullscreen></iframe>'
    , () ->
      _.wait waitForYoutube, () ->
        app.tempListing.view.triggerYoutubeImageClick () ->
          _.assertEqual $('iframe').length, 1
          "should have iframe youtube video"
          done()
      
  test "moving the map should get rid of the video and show the image instead", (done) ->
    addTmpListing (err, listing) ->
      _.wait waitForYoutube, -> 
        listing.view.triggerYoutubeImageClick () ->
          _.assertEqual $('iframe').length, 1, "wax on"
          _.wait 1000, () ->
            app.map.triggerMapCenterChanged()
            _.assertEqual $('iframe').length, 0, "wax off"
            done()

      
  test "Closing the bubble should remove the youtube video", (done) ->
    addTmpListing (err, listing) ->
      _.wait waitForYoutube, -> 
        listing.view.triggerYoutubeImageClick () ->
          _.wait 1000, () ->
            listing.view.handleBubbleClose()
            _.assertEqual $('iframe').length, 0, "wax off"
            done()

  test "there should be a big play button", (done) ->
    #TODO make a big play button
    done()

  test "There should be a login", (done) ->
    $("#sign-in").length.shouldBe 1, "should be login"
    $("#sign-up").length.shouldBe 1, "see ceate account"
    done()

  test "Sign in should pop up the question answer thing", (done) ->
     _.series [
      app.signInView.triggerSignInClick
      (done) ->
        $("#email").length.shouldBe 1, "see email field"
        $("#question:visible").length.shouldBe 1, "see password question"
        $("#password:visible").length.shouldBe 1, "see password"
        eq $("#cancel-signin:visible").length, 1, "see cancel sign in"
        
        done()
     ], (err, results) ->
       done()
       
  test "cancel sign in ", (done) ->
    series [
      app.signInView.triggerSignInClick
      app.signInView.triggerCancelClick 
    ], (err, results) ->
      eq app.signInView.visible, false, "shouln't see the popup"
      done() 

  test "can login (can sign in)", (d) ->
    series [
      (d) -> server "deleteTestUsers", -> d()
      app.signInView.triggerSignInClick
      (d) ->
        $('#email').val "drewalex@gmail.com"
        $('#question').val "What_is_your_fav_color_"
        $('#password').val "blue"
        log "going to submit sign in"
        app.signInView.submit () ->
          log "done submitting sign in "
          d()
    ], (err) ->
      eq err, null, "no error on logging in"
      ok app.signInView.visible == false, "no see popup"
      see "signed in as drewalex@gmail.com"
      d()
      

      

  test "new wait syntax", (done) ->
    1000.wait () -> 
      console.log "waited"
      "test".shouldBe "test"
    wait 1000, () ->
      console.log "also waited"
      ok true, "ok should be ok"
      eq "this", "this", "shorthand equal"
      ne "that", "this", "shortahdn not equal"
      see "office", "should see office"
      

    wait 2000, () -> 
      done()
      

  listingModels = null
  map = null


  testsComplete = (err, results) -> 
    server "cleanUpTestDb", (err, result) ->
      if not err then liteAlert "data cleaned"
      
      

    results = """
      #{_.getAssertCount()} tests ran
      #{_.getPassCount()} tests passed
      #{_.getFailCount()} tests failed
    """
    _.setAssertCount 0
    _.setPassCount 0
    _.setFailCount 0

    $('#test-text').html results.replace /\n/g, "<br />"
    console.log results

  getTestLink = (test) ->
    "#tests/#{test.replace(/\s/g, '_')}"
    
  $(document).ready () ->
    _.each tests, (val, key) ->
      $('#tests').append $ "<div><a href='#{getTestLink(key)}'>#{key}</div>"

  preRun = () ->
    app.bind "error", (err) ->
      console.log "ERROR! #{err}"
    listingModels = app.listings.models
    map = app.map.map


  runTest = (testName) ->
    testName = testName.replace /_/g, " "
    _.wait 1000, () ->
      preRun()
      _.series [tests[testName]], testsComplete
    
  runTests = () ->
    _.wait 1000, () ->
      preRun()
      newTests = {}
      _.each tests, (test, key) ->
        newTests[key] = (done) -> 
          console.log key + " http://office.the.tl/#{getTestLink(key)}"
          test(done)
      _.series newTests, testsComplete
