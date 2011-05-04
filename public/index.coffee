liteAlert = (message) ->
  console.log message

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
  reloadListings: () =>
    $('#reload-text').text "Reloading..."
  handleDoneReloading: () =>
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
  
class ListingView extends Backbone.View
  constructor: () ->
    super
  renderBubble: () =>
     bubbleDiv = $("[data-cid=\"#{@model.cid}\"]")
     bubbleDiv.html @getBubbleInnerContent()
  getBubbleContent: () =>
      """
      <div data-cid="#{@model.cid}" data-id="#{@model.id}">
        #{@getBubbleInnerContent()}
       </div>
      """
  getBubbleInnerContent: () =>
    """ 
      #{@model.get('address')}
      <div class="youtube">
        #{@model.get('youtube')}
      </div>
      <br />
      <div class="notes">
        #{@model.get('notes')}
      </div>
    """
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
  handleReload: () =>
    @map.removeListings @listings.models
    @listings.fetch
      success: () => @map.handleDoneReloading()
    @map.reloadListings()
  handleSubmit: (done) => @addListing(@tempListing, done)
  addListing: (listing, done) => 
    listing ||= @tempListing
    done ||= ->
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
      app.map.triggerAddressChange () =>
        @handleSubmit(done)
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
  handleNotesChange: (notes, cb=->) =>
    if not @tempListing then return cb()
    @tempListing.set notes: notes
    cb()
  handleYoutubeChange: (youtube, cb=->) =>
    if not @tempListing then return cb()
    @tempListing.set youtube: youtube
    cb()
  constructor: () ->
    $('#listing-form').submit (e) =>
      e.preventDefault()
      @handleSubmit()
    $('#reload').click @handleReload

    @officeListController = new OfficeListController
    Backbone.history.start()
      

    @map = new GoogleMap()
    @listings = new Listings
    @listings.bind "refresh", @handleRefreshedListings
    @listings.bind "add", @handleAddedListing
    @listings.fetch()
    @map.bind "addresschange", @addTmpListing
    @map.bind "noteschange", @handleNotesChange
    @map.bind "youtubechange", @handleYoutubeChange

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

    



