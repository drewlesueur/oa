$ = require "jquery"
_ = require "underscore"
drews = require "drews-mixins"
nimble = require "nimble"
severus = require "severus"
severus.db = "officeatlas_dev"
drews.bind = drews.on


{log} = drews

# this is the presenter
define "map-page-presenter", () ->
  mapPageViewMaker = require "map-page-view"
  listingMaker = require "listing"
  listingViewMaker = require "listing-view"
  #class presenter

  mapPagePresenterMaker = () ->
    self = {}
    map = mapPageViewMaker()
    self.map = map
    drews.on map, "submit", self.handleSubmit
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
    addListing = (listing, options) ->
      log "adding pre listing"
      log listing
      listing = listingMaker listing
      log "just created the listing and it's"
      log listing
      listingView = listingViewMaker listing, triggeree: self, editAddress: options?.editAddress
      listing.view = listingView
      listingViewInfo = map.addListing listing
      if options?.save isnt false
        listing.save()
    self.addListing = addListing

    listingMaker.find (error, listings) ->
      _.each listings, (listing) ->
        self.addListing listing, "save": false

    drews.bind self, "modelviewvalchanged", (model, prop, value) ->
      model.set prop, value
    self

  
define "map-page-view", () ->
  searchBarViewMaker = require "search-bar-view"
  mapPageViewMaker = (el=$ "<div class=\"map\"></div>", options) ->
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
    self =
      map: map
      el : el

    bar = searchBarViewMaker triggeree: self

    el.append bar.el

    self.bar = bar

    getDiv =  () ->
      map.getDiv()
    self.getDiv = getDiv
    getCenter = () ->
      map.getCenter()
    self.getCenter = getCenter
    getZoom = () ->
      map.getZoom()
    self.getZoom = getZoom
    setLatLng = (lat, lng) =>
      map.setCenter new google.maps.LatLng lat, lng
    self.setLatLng = setLatLng
    lookup = (address, done) =>
      geocoder = new google.maps.Geocoder()
      geocoder.geocode {address: address}, (results, status) =>
        if status is google.maps.GeocoderStatus.OK
          done null, results
        else
          done status
    self.lookup = lookup
    addListing = (listing, cb=->) =>
      latlng = new google.maps.LatLng listing.lat, listing.lng
      marker = new google.maps.Marker
        animation: google.maps.Animation.DROP
        position: latlng
        title: listing.address
        icon: "http://office.the.tl/pin.png"
      marker.setMap map
      map.setCenter latlng
      bubbleContent = listing.view.getBubbleContent()
      bubble = new google.maps.InfoWindow
        content: bubbleContent
        position: latlng
     
      google.maps.event.addListener marker, 'click', () ->
        #drews.trigger map, "markerclick", listing
        bubble.open map

      google.maps.event.addListener bubble, 'closeclick', () ->
        drews.trigger map, "bubbleclick", listing
      listing.view.marker = marker
      listing.view.bubble = bubble
      return {bubble, marker}
    self.addListing = addListing
    self


define "listing", () ->
  #closures for classes vs my _type for classes
  #class Listing
  find = (args...) ->
    severus.find "listings", args...
  listingMaker = (attrs) ->
    self = {}
    self.attrs = attrs
    _.extend self, attrs
    set = (prop, value) ->
      console.log "setting: #{prop} to #{value}"

      attrs[prop] = value 
      self[prop] = value # for convenience
      save()
    self.set = set

    get = (self, prop, value) ->
      return self.attrs[prop]

    save = (cb=->) ->
      log "saving"
      log attrs
      severus.save "listings", attrs, (error, _listing) ->
        _.extend attrs, _listing
        cb error, self
    self.save = save
    remove = (cb) ->
      severus.remove "listings", attrs._id, cb
    self.remove = remove
    self
  listingMaker.find = find
  listingMaker

define "listing-view", () ->
  editableFormMaker = require "editable-form"
  listingViewMaker = (listing, options) ->
    model = listing
    self =  {}
    self.model = model
    triggeree = self.triggeree = options?.triggeree or self

    getBubbleContent = () ->
      #TODO: cache this
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
      form.el[0]
    self.getBubbleContent = getBubbleContent
    self


# use a self or a big closure
# what is space
define "editable-form", () ->
  editableFormMaker = (html, model, options) ->
    console.log "the html is"
    console.log html

    self = 
      el : $ html
      model: model
    el = self.el
    self.triggeree = options?.triggeree or self
    triggeree = self.triggeree
    
    htmlValues = el.find("[data-prop]")
    drews.eachArray htmlValues, (_el) ->
      _el = $(_el)
      key = _el.attr "data-prop"
      _el.text model[key] or "[#{key}]"

    clickToMakeEditable = (els) ->
      els.bind "click", (e) ->
        prop = $(this).attr "data-prop"
        self.makeEditable(prop)
    self.clickToMakeEditable = clickToMakeEditable

    clickToMakeEditable(el.find(".editable"))

    makeEditable = (prop) ->
      if self.editing
        return
      _el = el.find("[data-prop='#{prop}']")
      value = _el.text()
      replacer = $ "<input type=\"text\" data-prop=\"#{prop}\" value=\"#{value}\">"

      saveIt = () ->
        self.editing = false
        newValue = replacer.val()
        _el.html ""
        _el.text newValue 
        console.log "triggering a save of #{prop}, #{newValue}."
        console.log "the model is"
        console.log model
        drews.trigger triggeree, "modelviewvalchanged", model, prop, newValue

      replacer.bind "keyup", (e) ->
        if e.keyCode is 13
          saveIt()

      replacer.bind "blur", (e) -> saveIt()
         
      _el.html replacer 
      self.editing = true
      replacer[0].focus()
      replacer[0].select()
    self.makeEditable = makeEditable
    self

define "search-bar-view", () ->
  searchBarViewMaker = (options) ->
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

    self =
      el: el
    options?.triggeree ||= self
    {triggeree} = options
    el.submit (e) ->
      e.preventDefault()
      drews.trigger triggeree, "submit", el.find(".search").val()
      el.find(".search").val("")
    self
    


