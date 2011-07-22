__useLookup__ = true

$ = require "jquery"
_ = require "underscore"
drews = require "drews-mixins"
nimble = require "nimble"
{log} = drews

# this is the presenter
define "map-page-presenter", () ->
  
  MapPageView = require "map-page-view"
  Listing = require "listing"
  ListingView = require "listing-view"
  MapPagePresenter  =
    init: () ->
      presenter =
          _type: MapPagePresenter
      presenter.map = MapPageView.init()
      map = presenter.map
      drews.on map, "submit", presenter.handleSubmit
      $(document.body).append presenter.map.getDiv()
      presenter
    handleSubmit: (presenter, address) ->
      presenter.map.lookup address, (err, results) ->
        if err then return log "ERROR looking up address"
        latlng = results[0].geometry.location
        #TODO: trigger and bind on listing
        presenter.addListing 
          lat: latlng.lat()
          lng: latlng.lng()
          address: address
     addListing: (presenter, listing) ->
        listing = Listing.init
          lat: listing.lat
          lng: listing.lng
          address: listing.address
        listingView = ListingView.init listing
        listing.view = listingView
        listingViewInfo = presenter.map.addListing listing

       

      

  
define "map-page-view", () ->
  SearchBarView = require "search-bar-view"
  MapPageView =
    init: (el=$ "<div class=\"map\"></div>", options) ->
      options or=
        barView: "search-bar-view"
      el.css
        width: "#{$(window).width()}px"
        height: "#{$(window).height()}px"
        position: 'absolute'
      latLng = new google.maps.LatLng(33.4222685,-111.8226402)
      options =
        zoom:11
        center: latLng
        mapTypeId: google.maps.MapTypeId.ROADMAP
      map = new google.maps.Map el[0], options
      mapPageView =
        _type: MapPageView
        map: map
        el : el

      bar = SearchBarView.init
        triggerer: mapPageView

      el.append bar.el

      mapPageView.bar = bar
      mapPageView

    getDiv: (self) ->
     self.map.getDiv()
    getCenter : (self) ->
      self.map.getCenter()
    getZoom : (self) ->
      self.map.getZoom()
    setLatLng : (self, lat, lng) =>
      self.map.setCenter new google.maps.LatLng lat, lng
    lookup : (self, address, done) =>
      geocoder = new google.maps.Geocoder()
      geocoder.geocode {address: address}, (results, status) =>
        if status is google.maps.GeocoderStatus.OK
          done null, results
        else
          done status
    addListing : (self, listing, d=->) =>
     
      latlng = new google.maps.LatLng listing.lat, listing.lng
      marker = new google.maps.Marker
        animation: google.maps.Animation.DROP
        position: latlng
        title: listing.address
        icon: "http://office.the.tl/pin.png"
      marker.setMap self.map
      self.map.setCenter latlng

      bubbleContent = listing.view.getBubbleContent()
      bubble = new google.maps.InfoWindow
        content: bubbleContent
        position: latlng
     
      google.maps.event.addListener marker, 'click', () ->
        #drews.trigger self.map, "markerclick", listing
        bubble.open self.map

      google.maps.event.addListener bubble, 'closeclick', () ->
        drews.trigger self.map, "bubbleclick", listing
      listing.view.marker = marker
      listing.view.bubble = bubble
      return {bubble, marker}


define "listing", () ->
  Listing =
    init: (listing) ->
       listing._type = Listing
       listing

define "listing-view", () ->
  EditableForm = require "editable-form"
  ListingView = 
    init: (listing) ->
      self = 
        _type: ListingView
        model: listing
    getBubbleContent: (self) ->
      listing = self.model
      if self.bubbleContent
        return self.bubbleContent
      model = self.model

        #TODO:  make the formHtml an option
      formHtml = require "bubble-view" 
      form = EditableForm.init formHtml, listing
      self.form = form
      self.form.makeEditable("address")
      form.el[0]
       


       

# use a self or a big closure
define "editable-form", () ->

  EditableForm = 
    init: (html, values) ->
      self = 
        _type: EditableForm
        el : $ html
        _: "Editable form"
      
      htmlValues = self.el.find("[data-prop]")
      log "the values are"
      log htmlValues
      drews.eachArray htmlValues, (el) ->
        log el
        el = $(el)
        key = el.attr "data-prop"
        el.text values[key] or "[#{key}]"

      self.clickToMakeEditable(self.el.find(".editable"))
      self
      
    clickToMakeEditable : (self, els) ->
      els.bind "click", (e) ->
        prop = $(this).attr "data-prop"
        self.makeEditable(prop)

    makeEditable: (self, prop) ->
      el = self.el.find("[data-prop='#{prop}']")
      log el
      value = el.text()
      log "the value is #{value}."
      replacer = $ "<input type=\"text\" data-prop=\"#{prop}\" value=\"#{value}\">"
      replacer.bind "keyup", (e) ->
        if e.keyCode is 13
          el.text replacer.val()
          replacer.replaceWith el 
          self.clickToMakeEditable(el)
         
      log replacer
      el.replaceWith replacer 

 


define "search-bar-view", () ->
  SearchBarView = 
    init: (options) ->
    
      el ?= $ """
        <div class="search-bar-view">
          <form class="search-form">
            <input class="search" placeholder="" />
          </form>
        </div>
      """
      el.css
        position:"absolute"
        "z-index": 600
        left: "300px"

      bar =
        _type: SearchBarView
        el: el
      options.triggerer ||= bar
      {triggerer} = options
      el.submit (e) ->
        e.preventDefault()
        drews.trigger triggerer, "submit", el.find(".search").val()
        el.find(".search").val("")

      return bar
    


