liteAlert = (message) ->
  console.log message

class YoutubeParser
  exampleEmbed: '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>'
  constructor: (youtubeEmbed) ->
    @embed = youtubeEmbed
    matches = @embed.match /embed\/([^\"]*)"/
    if not matches
      @id = null
      return
    @id = matches[1]
  getLittleImage: (numb) =>
    if not @id then return null
    if not _.isNumber(numb) then numb = 1
    "http://img.youtube.com/vi/#{@id}/#{numb}.jpg"
  getBigImage: () =>
    if not @id then return null
    "http://img.youtube.com/vi/#{@id}/0.jpg"
 
    

_.each ['s'], (method) ->
  Backbone.Collection.prototype[method] = () ->
    return _[method].apply _, [this.models].concat _.toArray arguments

class GoogleMap extends Backbone.View
  constructor: (width, height) ->
    @el = $ @make "div"
    @el.css
      width: screen.availWidth - 300 + "px"
      height: window.innerHeight + "px"
    @latLng = new google.maps.LatLng(-34.397, 150.644)
    @options =
      zoom: 8
      center: @latLng
      mapTypeId: google.maps.MapTypeId.ROADMAP
    @map = new google.maps.Map @el[0], @options 

    #$('#address').typed () => @trigger "addresschange"
    $('#address').change () => @triggerAddressChange()
    #$("#notes").typed () => @triggerNotesChange()
    $("#notes").keyup () => @triggerNotesChange()
    $("#youtube").keyup () => @triggerYoutubeChange()
    $('#reload').click () => @triggerReload()
  triggerReload: (cb=->) =>
    @trigger "reload", cb
  triggerYoutubeChange: (cb=->) =>
    @trigger "youtubechange", $('#youtube').val(), cb
      
  triggerAddressChange: (cb=->) =>
    @trigger "addresschange",
      address: $('#address').val()
      notes: $('#notes').val()
      youtube: $('#youtube').val()
    , cb
  clearFields: () => 
    $("#address, #notes, #lat, #lng").val ""
  triggerNotesChange: () =>
    @trigger "noteschange", $('#notes').val()
  addListing: (listing) =>
    latlng = new google.maps.LatLng listing.get('lat'), listing.get('lng')
    marker = new google.maps.Marker
      animation: google.maps.Animation.DROP
      position: latlng
      title: listing.get('address')
      icon: "http://office.the.tl/pin.png"
    listing.view.marker = marker
    marker.setMap @map
    bubble = new google.maps.InfoWindow
      content: listing.view.getBubbleContent()
      zIndex: 999999

    listing.view.bubble = bubble

    google.maps.event.addListener marker, 'click', () ->
      listing.view.handleMarkerClick()
      
     
  updateCurrentBubbleNotes: (notes, cb=->) =>
    if not @tempListing then return cb()
    cb()
  addListings: (listings) =>
    for listing in listings
      @addListing listing
  removeListings: (listings) =>
    for listing in listings
      @removeListing listing
  removeListing: (listing) =>
    listing.view.marker?.setMap null
    listing.view.bubble?.setMap null
  displayReloading: () =>
    $('#reload-text').text "Reloading..."
  hideReloading: () =>
    $('#reload-text').text ""
  lookup: (address, done) =>
    geocoder = new google.maps.Geocoder()
    geocoder.geocode {address: address}, (results, status) =>
      if status is google.maps.GeocoderStatus.OK
        done null, results
      else
        done status
    
class Listing extends Backbone.Model
  constructor: () ->
    super
  set: (args...) =>
    attrs = args[0]
    if "youtube" of attrs
      @setYoutube attrs['youtube']
    super
  setYoutube: (embed) =>
    @youtubeParser = new YoutubeParser embed
     
  
class ListingView extends Backbone.View
  constructor: () ->
    super
  triggerYoutubeImageClick: (cb=->) =>
    #@trigger "youtubeimageclick", @listing
    #why trigger on just the listing
    # isn't it simpler to trigger on the apps view (in this case 's map)

    #app.map.trigger "youtubeimageclick", @listing
    # or why even trigger at all. this is black boxed
    @swapImageWithVideo()
  swapImageWithVideo: (cb=->) =>
    iframe = $ @model.youtubeParser.embed
    img = @getBubbleDiv().find('img')
    iframe.css 
      display: "none"
      position: "absolute"
      top: 0
      left: 0

    $(document.body).append iframe

    console.log img.length
    _.wait 500, () ->
      console.log "offset"
      console.log img.offset()
      iframe.css
        display: "block"
        top: img.offset().top + "px"
        left: img.offset().left + "px"
      cb()


    
  getBubbleDiv: () =>
    $("[data-cid=\"#{@model.cid}\"]")
  renderBubble: () =>
    @bubble.setContent @getBubbleContent()

    @getBubbleDiv().find("img.thumbnail").click () =>
      console.log "Click"
      @triggerYoutubeImageClick()

#appending do body first didnt work. I wanted it to work for chrome. does for safart
# waiting also works for safari (need to set the width height though)
# tried appending after, makes it small but works, then setCOntenting it, no works
# cant figure out how to make the info window bubble bigger.. canvas sutff?

  getBubbleContent: () =>
    if @model.youtubeParser?.getBigImage()
      image = "<img class=\"thumbnail\" src=\"#{@model.youtubeParser.getBigImage()}\" />"
    else
      image = ""
    str = """
    <div style="position: relative;" data-cid="#{@model.cid}" data-id="#{@model.id}">
      <div class="bubble-position"></div>
      #{@model.get('address')}
      <div class="youtube">
       #{image} 
      </div>
      <br />
      <div class="notes">
        #{@model.get('notes')}
      </div>
    </div>
    """
    $(str)[0]
    
  handleMarkerClick: () ->
    if @bubbleState == "open"
      @bubble.close()
      @bubbleState = "closed"
    else
      @bubble.open app.map.map, @marker
      @bubbleState = "open"
    
   
class Listings extends Backbone.Collection
  url: "/listings"
  model: Listing
  constructor: () ->
    super


class OfficeListController extends Backbone.Controller
  constructor: () ->
    super
  routes:
    "test": "test"
    "tests/:test": "tests"
  tests: (test) =>
    runTest test
  test: () =>
    runTests() 

    

class OfficeListPresenter
  handleRefreshedListings: () =>
    for listing in @listings.models
      @handleRefreshedListing listing

    #@map.addListings @listings.models

  handleRefreshedListing: (listing) =>
    listing.view = new ListingView model: listing
    @map.addListing listing
  handleAddedListing: (listing) =>
    @handleRefreshedListing listing
  handleReload: (cb=->) =>
    @map.removeListings @listings.models
    @listings.fetch
      success: () =>
        @map.hideReloading()
        cb()
    @map.displayReloading()
  handleSubmit: (done) => @addListing(@tempListing, done)
  addListing: (listing, done=->) => 
    listing ||= @tempListing
    if listing
      if not listing.collection
        @listings.add listing
      @map.clearFields()
      listing.save null,
        success: () => 
          liteAlert "saved"
        error: (err) => done err 
      listing.view.handleMarkerClick()
      done()
    else
      @trigger "error", "no temporary listing"
  addTmpListing: (listing, callback) =>
    callback ||= ->
    if listing.constructor isnt Listing
      listing = new Listing listing
      listing.view = new ListingView model: listing
    listing.bind "remove", (model, collection) =>
      @map.removeListing model
    listing.bind "change:notes", () => @handleListingChange listing
    listing.bind "change:youtube", () => @handleListingChange listing

    @map.lookup listing.get('address'), (err, results) =>
      if err 
        liteAlert "Error getting address"
        return callback err
      @listings.remove(@tempListing)
      @tempListing = listing
      latlng = results[0].geometry.location
      @map.map.setCenter latlng
      @map.map.setZoom 13
      listing.set 
        lat: latlng.lat()
        lng: latlng.lng()
      @listings.add listing
      listing.view.handleMarkerClick()
      callback()
  handleListingChange: (listing) =>
    listing.view.renderBubble()
  handleAppNotesChange: (notes, cb=->) =>
    if not @tempListing then return cb()
    @tempListing.set notes: notes
    cb()
  handleAppYoutubeChange: (youtube, cb=->) =>
    if not @tempListing then return cb()
    @tempListing.set youtube: youtube

    cb()
  handleListingYoutubeImageClick: (listing, cb=->) =>
    listing.view.swapImageWithVideo cb
  constructor: () ->
    _.extend @, Backbone.Events
    $('#listing-form').submit (e) =>
      e.preventDefault()
      @handleSubmit()

    @officeListController = new OfficeListController
    Backbone.history.start()
      

    @map = new GoogleMap()
    @listings = new Listings
    @listings.bind "refresh", @handleRefreshedListings
    @listings.bind "add", @handleAddedListing
    @listings.fetch()
    @map.bind "addresschange", @addTmpListing
    @map.bind "noteschange", @handleAppNotesChange
    @map.bind "youtubechange", @handleAppYoutubeChange
    @map.bind "reload", @handleReload
    @map.bind "yotubeimageclick", @handleListingYoutubeImageClick

    $('#map-wrapper').append @map.el
    $('#map-wrapper').css
      width: (screen.availWidth - 300) + "px"
      height: document.body.clientHeight + "px"

    
    onLoc = (position) =>
      lat = position.coords.latitude
      lng = position.coords.longitude

      $('#lat').val lat
      $('#lng').val lng
      latLng = new google.maps.LatLng(lat, lng)
      @map.map.setCenter(latLng)
  
    navigator.geolocation?.getCurrentPosition?(onLoc)

    



