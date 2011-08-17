define "map-page-presenter", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  drews.bind = drews.on
  drewsEventMaker = require "drews-event"
  mapPageViewMaker = require "map-page-view"
  listingMaker = require "listing"
  listingViewMaker = require "listing-view"
  #class presenter

  mapPagePresenterMaker = () ->
    self = drewsEventMaker {}
    map = mapPageViewMaker()
    self.map = map
    $(document.body).append self.map.getDiv()
    handleSubmit = (address) ->
      map.lookup address, (err, results) ->
        if err then return log "ERROR looking up address"
        latlng = results[0].geometry.location
        addListing 
          lat: latlng.lat()
          lng: latlng.lng()
          address: address
        , editAddress: true
    self.handleSubmit = handleSubmit
    map.on "submit", self.handleSubmit
    addListing = (listing, options) ->
      listing = listingMaker listing
      listingView = listingViewMaker listing, triggeree: map, editAddress: options?.editAddress
      listing.view = listingView
      map.addListing listing
      listing.presenter = self
      # either bind on listing or listingMaker
      # if bind on listingMaker, check for listing._isInApp
      #
      # bind addimages presenter
      listing.on "addimages", (urls) ->
        listing.view.addImages urls
      listing.on "deleted", () ->
        map.removeListing listing
      listing.on "deleteimage", (url) ->
        listing.view.deleteImage url

      if options?.save isnt false
        listing.save()
      listing
    self.addListing = addListing
    listings = []
    self.listings = listings
    listingMaker.find (error, _listings) ->
      listings = _listings
      _.each listings, (listing, index) ->
        listings[index] = addListing listing, "save": false

    map.on "modelviewvalchanged", (model, prop, value) ->
      model.set prop, value
    
    #addimages presenter
    addImages = (listing, urls) ->
      listing.addImages urls
      #listingMaker.addImages listing, urls
    self.addImages = addImages
    # bind addimages presenter

    #TODO: event is no longer triggered on map
    # maybe should be in the future so you have one listener
    map.on "addimages", addImages
    map.on "bubbleopen", (_listing) ->
      _.each listings, (listing) ->
        if listing != _listing
          listing.view.bubble.close()

    map.on "newbubble", (listing, bubble) ->
      listing.view.bubble = bubble
    
    deleteListing = (listing) ->
      listing.remove()

    deleteImage = (listing, url) ->
      listing.deleteImage url


    map.on "deletelisting", deleteListing
    map.on "deleteimage", deleteImage
    

    map.on "newmarker", (listing, marker) ->
      listing.view.marker = marker
    self
