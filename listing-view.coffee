define "listing-view", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  drews.bind = drews.on
  drewsEventMaker = require "drews-event"

  editableFormMaker = require "editable-form"
  listingViewMaker = (listing, options) ->
    bubbleView = null
    model = listing
    self =  drewsEventMaker {}
    triggeree = options.triggeree or self
    self.setTriggeree triggeree
    #drewsEventMaker.setTriggeree self, options.triggeree
    self.model = model
    {trigger, on:bind} = self

    getBubbleContent = () ->
      listing = model
      if self.bubbleContent
        return self.bubbleContent
        #TODO:  make the formHtml an option
      bubbleViewMaker = require "bubble-view" 
      bubbleView = bubbleViewMaker {model, triggeree}
      form = editableFormMaker bubbleView.el, listing, triggeree: triggeree
      self.form = form
      if options?.editAddress
        form.makeEditable("address")
      self.bubbleContent = form.el[0]
      self.bubbleContent
    self.getBubbleContent = getBubbleContent

    closeBubble = () ->
    #view addImages
    addImages = (urls) ->
      bubbleView?.addImages urls
    self.addImages = addImages
    self
    latlng = new google.maps.LatLng listing.lat, listing.lng
    self.latlng = latlng
    marker = new google.maps.Marker
      animation: google.maps.Animation.DROP
      position: latlng
      title: listing.address
      icon: "http://3office.drewl.us/pinb.png"
    bubble = new google.maps.InfoWindow
      content: getBubbleContent()
      position: latlng
    self.marker = marker 
    self.bubble = bubble
    google.maps.event.addListener marker, 'click', () ->
      #drews.trigger map, "markerclick", listing
      trigger "bubbleopen", listing 
      #TODO: make the reference to map simpler
      bubble.open listing.presenter.map.map
      

    google.maps.event.addListener bubble, 'closeclick', () ->
      trigger "bubbleclick", listing
    return self
