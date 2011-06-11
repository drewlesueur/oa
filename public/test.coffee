_.assertClose = (val, otherVal, within, message) ->
  if Math.abs(otherVal - val) <= within
    _.assertPass val, otherVal, message, "within #{within} of", _.assertClose
  else
    _.assertFail val, otherVal, message, "within #{within} of", _.assertClose

_.assertSee = (text, message) ->
  possibles = $("body:contains('#{text}'):visible")
  list = _.s possibles, -1 # last one
  if list.length !=0
    _.assertPass text, "[html body]", message, "see", _.assertSee 
  else
    _.assertFail text, "[html body]", message, "see", _.assertSee 

_.assertNoSee = (text, message) ->
  if $("body:contains('#{text}'):visible").length !=0
    _.assertFail text, "not that!", message, "see", _.assertSee 
  else
    _.assertPass text, "[html body]", message, "see", _.assertSee 

# todo get rid of this experimental monkey patching
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

officeTest = do () ->
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
    keys: keys
    isEqual: isEqual
    s:s
    doneMaker: doneMaker
    addListener: bind
    trigger: trigger
    map: map
    indexOf: indexOf
    clone: clone
    times: times
  } = _
  
  [takeCard, onHaveAllCards] = doneMaker()
  
  tests = {}

  test = (title, func) ->
    tests[title] = func

  test "title should be office atlas", (done) ->
    _.assertEqual document.title, "Office Atlas",
    "Title should equal Office Atlas"
    done()

  test "I should see kyles pin marker image", (done) ->
    return done()
    _.assertEqual $('[src="http://office.the.tl/pin.png"]').length > 0, true, "Should see pin"
    done()

  test "A listing should load", (done) ->
    # This is for a default listing
    # If the app loads correctly, a default listing should load
    _.assertNotEqual listingModels[0].view.marker, null,
      "Marker should not be null" 
    done(null)

  test "I should see the info bubble when clicking on the marker", (done) ->
    #TODO should this be trigger?
    listingModels[0].view.handleMarkerClick()
    _.wait waitForYoutube, () ->
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
      youtube: "http://www.youtube.com/watch?v=JbJ42pzLMmI&feature=player_embedded#at=31"
    , () ->
      console.log "done adding temporary listing"
      console.log app.tempListing
      _.assertSee "These notes are my own", "see the notes of a listing"
      #TODO change this to triggerSubmit ...
      app.handleSubmit () ->
        eq $('#notes').val(), "", "Notes field should be empty"
        eq $('#lat').val(), "", "Notes field should be empty"
        eq $('#lng').val(), "", "Notes field should be empty"
        latlng = app.map.getCenter()
        eq latlng.lat(), 33.44187, .01, "Latitude should change when adding a listing"
        eq latlng.lng(), -111.798698, 0.1, "Longitutde should change when adding a listing"
        eq app.map.getZoom(), 13, "Should zoom in when adding a listing"
        newListings = listingModels.filter (listing) -> listing.get('notes') == "These notes are my own"
        eq newListings.length, 1, "New listing should be added"

        oldListings = map (clone app.listings.models), (model) -> model.attributes.address
        app.map.triggerReload () ->
          newListings = map app.listings.models, (model) -> model.attributes.address
          log "old and new listings"
          log oldListings
          log newListings
          eq isEqual(oldListings, newListings), 1,
          "Listings should be reloaded"
          noSee "Reloading"
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
      latlng = app.map.getCenter()
      _.assertClose latlng.lat(), 33.300, 0.001, "auto lookup lat for Gangplank"
      _.assertClose latlng.lng(), -111.841, 0.001, "auto lookup lng for ganglplank"
      _.assertSee "gangplankizzle", "the notes should auto pop up"

      $('#address').val "ray and arizone ave, mesa, az"
      $('#notes').val "egypt"
      app.map.triggerAddressChange()

      oldNewListings = _.filter listingModels, (model) -> not model.id
      _.wait waitForYoutube , () ->
        latlng = app.map.getCenter()
        _.assertClose latlng.lat(), 33.361, 0.05, "auto lookup for egypt lat"
        _.assertClose latlng.lng(), -111.841, 0.05, "auto lookup for egypt lng"
        newNewListings = _.filter listingModels, (model) -> not model.id
        _.assertNoSee "gangplankizzle", "Should not see gangplankizzle"
        _.assertEqual oldNewListings.length, newNewListings.length, "only one non saved listing at a time"
        done()

  #the form 
  test "There should be a youtube video video box", (done) ->
    _.assertSee "Youtube html"
    done()
    
  test "There should be a square feet box", (done) ->
    _.assertSee "Square Ft.", "see sqaure feet"
    done()

  test "There should be a price box", (done) ->
    _.assertSee "Price", "see price"
    done()

  
  test "typing should update the bubble", (done) ->
    listing = app.addTmpListing
      address: "lds temple mesa, az"
      notes: ""
    , () ->

      $('#notes').val "testing notes"
      app.map.triggerNotesChange()
      ok $('.notes:contains(testing notes)').length, 1, "notes should update on change"

      $('#price').val "100 dollars"
      app.map.triggerValueChange "price"
      eq $('.price:contains(100 dollars)').length, 1, "price should update on change"

      $('#squareFeet').val "2sqft."
      app.map.triggerValueChange "squareFeet"
      eq $('.squareFeet:contains(2sqft.)').length, 1, "sqft should update"

      console.log app.tempListing
      eq app.tempListing.get( "price"), "100 dollars"
      eq app.tempListing.get( "squareFeet"), "2sqft." 
      eq app.tempListing.get( "notes"), "testing notes" 
      #TODO: also test on the server     

      

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
          _.assertEqual $('iframe.video-iframe').length, 1,
          "should have iframe youtube video"
          done()
      
  test "moving the map should get rid of the video and show the image instead", (done) ->
    addTmpListing (err, listing) ->
      _.wait waitForYoutube, -> 
        listing.view.triggerYoutubeImageClick () ->
          _.assertEqual $('iframe.video-iframe').length, 1, "wax on"
          _.wait 1000, () ->
            app.map.triggerMapCenterChanged()
            _.assertEqual $('iframe.video-iframe').length, 0, "wax off"
            done()

      
  test "Closing the bubble should remove the youtube video", (done) ->
    addTmpListing (err, listing) ->
      _.wait waitForYoutube, -> 
        listing.view.triggerYoutubeImageClick () ->
          _.wait 1000, () ->
            #TODO should this be trigger?
            listing.view.handleBubbleClose()
            _.assertEqual $('iframe.video-iframe').length, 0, "wax off"
            done()

  test "there should be a big play button", (done) ->
    #TODO make a big play button
    done()

  test "There should be a signin / sign up", (done) ->
    $(".sign-in").length.shouldBe 1, "should be login"
    done()

  test "Sign in should pop up the question answer thing", (done) ->
     _.series [
      app.signInView.triggerSignInClick
      (done) ->
        $(".email").length.shouldBe 1, "see email field"
        $(".question:visible").length.shouldBe 1, "see password question"
        $(".password:visible").length.shouldBe 1, "see password"
        eq $(".cancel-sign-in:visible").length, 1, "see cancel sign in"
        
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

  test "shouldnt see sign out", (d) ->
    eq $("#sign-in-view .sign-out").is(":visible"), false
    d()


  #TODO: haven't tested initial login. When you first get to the page
  test "can login (can sign in)", (d) ->

    login = (d) ->
      app.signInView.el.find('.email').val "drewalex@gmail.com"
      app.signInView.el.find('.question').val "What_is_your_fav_color_"
      app.signInView.el.find('.password').val "blue"
      app.signInView.submit () ->
        d()
        
    badLogin = (d) ->
      app.signInView.el.find('.email').val "drewalex@gmail.com"
      app.signInView.el.find('.question').val "What_is_your_fav_color_"
      app.signInView.el.find('.password').val "red"
      app.signInView.submit () ->
        d()
   
    rightCreds = (d) ->
      server "whoami", (err, result) ->
        eq result.email, "drewalex@gmail.com", "should have my email"
        d()

    logInTests = (d) ->
      ok app.signInView.visible == false, "no see popup"
      ok app.signInView.el.find(".signed-in-as:contains('drew')").length >= 1,
         "should see signed in as"
      ok app.signInView.el.find(".sign-out").is(":visible"),
        "should see sign out"
      ok app.signInView.el.find(".email").val() == "", "email is empty"
      ok app.signInView.el.find(".password").val() == "", "password is empty"

      d()

    badLogInTests = (d) ->
      ok app.signInView.visible == false, "no see popup"
      ok app.signInView.el.find(".signed-in-as:contains('drew')").length == 0,
         "should not see signed in as"
      ok not app.signInView.el.find(".sign-out").is(":visible"),
        "should not see sign out"
      ok app.signInView.el.find(".email").val() == "drewalex@gmail.com", "email isn't empty"
      ok app.signInView.el.find(".password").val() == "", "password is empty"
      d()

    series [
      # delete test users
      (d) -> server "deleteTestUsers", -> d()

      #sign in 
      app.signInView.triggerSignInClick

      # set values
      login

      # make sure you have the right cookies 
      rightCreds

      # some tests 
      logInTests

      # now ou should be able to log out
      app.signInView.triggerSignOutClick 

      # make sure you have don't have the right cookies 
      (d) ->
        server "whoami", (err, result) ->
          ok ("email" not of result)
          d()

      # Now make sure you can log in again with same creds
      login
      rightCreds
      logInTests
      app.signInView.triggerSignOutClick 
      #login with bad credentials
      badLogin
      badLogInTests

        
    ], (err) ->
      eq err, null, "no error on logging in"

      d()
      
  test "auto fill in the question", (d) ->
    server ["sessions", {
      email: "drewalex@gmail.com" 
      question: "What_is_your_fav_color_"
      password: "blue"
    }], (err, result) ->
      

      app.signInView.triggerSignInClick()
      $(".question").val "What_is_your_dogs_maiden_name_"
      $(".email").val "drewalex@gmail.com"

      app.signInView.triggerEmailEntered()
      onEmailEntered = () ->
        eq $(".question").val(), "What_is_your_fav_color_",
        "auto fill in quesiton"
        #TODO
        #write a test for focusing the answer
        app.signInView.triggerCancelClick()
        app.unbind "doneLookupQuestion", onEmailEntered
        # delete the user I made
        d()
      app.bind "doneLookupQuestion", onEmailEntered
        
    
  test "server test", (d) ->
    server "json_test", (err, json) ->
      eq err, null, "should not get error from test json"
      eq json.a, 1
      eq json.band.name, "aterciopelados"
      d()


  test "add listing using app.addListing", (done) ->
    # a simple test for add listing
    # ui tests are elsewhere
    #TODO: this thest assumes a lot
    rawListing = address: "maricopa, az", notes: "maricopa notes", youtube: "http://www.youtube.com/watch?v=S6L9wccThyA"
    app.addListing rawListing, (err, listing) ->
      ok !err, "no error while calling add lisging"
      get "listings", (err, listings) ->
        notes = map listings, (listing) -> listing.notes
        ok indexOf(notes, "maricopa notes") != -1, "notes should appear in the add listing"
        done()

  do () ->   
    return
    returnCard = takeCard()
    rawListing = address: "maricopa, az", notes: "maricopa notes", youtube: "http://www.youtube.com/watch?v=S6L9wccThyA"
    rawUser = 
      email: "drewalex@gmail.com" 
      question: "What_is_your_fav_color_"
      password: "blue"
    series [
        -> app.signIn rawUser
        -> app.addListing rawListing
    ], (err, results) ->

      test "editing a listing", (d) ->
        #TODO: write this test
        d()
      returnCard()
    
  test "some random ui tests", (d) ->



  
  testKeys = keys(tests).reverse()
  # testsKeys = reverse keys tests
  # testKeys = tests.keys().reverse()
  
  log testKeys
  newTests = {}
  for key in testKeys
    newTests[key] = tests[key]
  tests = newTests
  
  listingModels = null


  testsComplete = (err, results) -> 
    server "cleanUpTestDb", (err, result) ->
      if not err then liteAlert "data cleaned"
      
    failures = "<ul>"
    failedMessages = _.getFailedMessages()
    for message in failedMessages
      failures += """
        <li>#{message}</li>
      """
    failures += "</ul>"

    results = """
      #{_.getAssertCount()} tests ran
      #{_.getPassCount()} tests passed
      #{_.getFailCount()} tests failed
      The failed tests were #{failures}
    """
    _.setAssertCount 0
    _.setPassCount 0
    _.setFailCount 0

    $('#test-text').html results.replace /\n/g, "<br />"
    console.log results

  getTestLink = (test) ->
    "#tests/#{test.replace(/\s/g, '_')}"
  self = testsReady: false  

  do ->
    # wait for document.ready
    returnCard = takeCard()
    $ -> returnCard()


  onHaveAllCards () ->
    self.testsReady = true
    trigger self, "testsready"
    #alert "have all cards"
    _.each tests, (val, key) ->
      $('#tests').append $ "<div><a href='#{getTestLink(key)}'>#{key}</div>"

  runTestWhenReady = (test) ->
    if self.testsReady
      runTest test 
    else
      bind self, "testsready", ->  runTest test
  
  # bindAnyTime or asLongAs
  runTestsWhenReady = ->
    if self.testsReady
      runTests()
    else
      bind self, "testsready", ->
        runTests()


    
    

  preRun = () ->
    app.bind "error", (err) ->
      console.log "ERROR! #{err}"
    listingModels = app.listings.models


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
  self.runTest = runTest
  self.runTestWhenReady = runTestWhenReady
  self.runTests = runTests
  self.runTestsWhenReady = runTestsWhenReady
  self
