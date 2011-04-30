liteAlert = (message) ->
  console.log message

isTesting = () ->
  url = location.href.toString()
  url.indexOf("test") != -1

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
  addListing: (listing) =>
    latlng = new google.maps.LatLng listing.get('lat'), listing.get('lng')
    marker = new google.maps.Marker
      animation: google.maps.Animation.DROP
      position: latlng
      title: listing.get('address')
    listing.view.marker = marker
    marker.setMap @map
    bubble = new google.maps.InfoWindow
      content: """
       #{listing.get('address')}
       <br />
       #{listing.get('notes')}
      """
    listing.view.bubble = bubble

    google.maps.event.addListener marker, 'click', () ->
      listing.view.handleMarkerClick()
     

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
    
class Listing extends Backbone.Model
  constructor: () ->
    super
  
class ListingView extends Backbone.View
  constructor: () ->
    super
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
  handleSubmit: () =>
    listing = new Listing
     address: $('#address').val()
     notes: $('#notes').val()

    console.log $('#address, #notes, #lat, #lng').val("")
    
    
    geocoder = new google.maps.Geocoder()
    geocoder.geocode {address: listing.get('address')}, (results, status) =>
     if status is google.maps.GeocoderStatus.OK
       latlng = results[0].geometry.location
       @map.map.setCenter latlng
       @map.map.setZoom 13
       listing.set 
         lat: latlng.lat()
         lng: latlng.lng()
       @listings.add listing
       listing.save null,
         success: () => 
           liteAlert "saved"
         error: () => liteAlert "not saved"
       listing.view.handleMarkerClick()
      else
        alert "There was a problem loading"

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
    listing = new Listing address: "test", "notes": "test"
    @listings.fetch()
   

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

    



