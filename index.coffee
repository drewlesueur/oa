__useGetSet__ = true

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
  
  MapPageView = require "map-page-view"
  Listing = require "listing"
  ListingView = require "listing-view"
  #class presenter
  MapPagePresenter  =
    init: () ->
      self =
        _type: MapPagePresenter
      self.map = MapPageView.init()
      map = self.map
      drews.on map, "submit", self.handleSubmit
      $(document.body).append self.map.getDiv()

      Listing.find (error, listings) ->
        _.each listings, (listing) ->
          self.addListing listing, "save": false

      drews.bind self, "modelviewvalchanged", (model, prop, value) ->
        model[prop] = value

      self

    name: "MapPagePresenter" 
    handleSubmit: (self, address) ->
      self.map.lookup address, (err, results) ->
        if err then return log "ERROR looking up address"
        latlng = results[0].geometry.location
        #TODO: trigger and bind on listing
        self.addListing 
          lat: latlng.lat()
          lng: latlng.lng()
          address: address
        , editAddress: true
     addListing: (self, listing, options) ->
        log "adding pre listing"
        log listing
        listing = Listing.init listing
        listingView = ListingView.init listing, triggeree: self, editAddress: options?.editAddress
        listing.view = listingView
        listingViewInfo = self.map.addListing listing
        if options?.save isnt false
          listing.save()

       

      

  
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
      self =
        _type: MapPageView
        map: map
        el : el

      bar = SearchBarView.init triggeree: self

      el.append bar.el

      self.bar = bar
      

      self

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
    addListing : (self, listing, cb=->) =>
     
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
  #class Listing
  Listing =
    init: (attrs) ->
       if attrs._type == Listing
         listing = attrs
         listing
       else
         listing =
           _type: Listing
           attrs: attrs
           nonAttrs: {}

         listing
    name: "Listing"
    notInAttrs: ["view"]
    _set: (self, prop, value) ->
      if prop in self.notInAttrs #has
        __set(self, prop, value, false) #actually save it to the listing
        log self
      else
        self.attrs[prop] = value 
        self.save()

    _get: (self, prop) ->
      self.attrs[prop]

    save: (self, cb) ->
      severus.save "listings", self.attrs, (error, _listing) ->
        _.extend listing, _listing
        cb error, listing
    remove: (self, cb) ->
      severus.remove "listings", self2._id, cb
    find: (args...) ->
      severus.find "listings", args...

define "listing-view", () ->
  EditableForm = require "editable-form"
  ListingView = 
    init: (listing, options) ->
      self = 
        _type: ListingView
        model: listing
      self.triggeree = options?.triggeree or self
      self
    name: "Listing View"
    getBubbleContent: (self) ->
      listing = self.model
      if self.bubbleContent
        return self.bubbleContent
      model = self.model

        #TODO:  make the formHtml an option
      formHtml = require "bubble-view" 
      form = EditableForm.init formHtml, listing, triggeree: self.triggeree
      self.form = form
      if options?.editAddress
        self.form.makeEditable("address")
      form.el[0]
       


       

# use a self or a big closure
# what is space
define "editable-form", () ->

  EditableForm = 
    init: (html, model, options) ->
      self = 
        _type: EditableForm
        el : $ html
        model: model

      self.triggeree = options?.triggeree or self
      
      htmlValues = self.el.find("[data-prop]")
      drews.eachArray htmlValues, (el) ->
        el = $(el)
        key = el.attr "data-prop"
        el.text model[key] or "[#{key}]"

      self.clickToMakeEditable(self.el.find(".editable"))
      self
      
    name: "Editable form"
    clickToMakeEditable : (self, els) ->
      els.bind "click", (e) ->
        prop = $(this).attr "data-prop"
        self.makeEditable(prop)

    makeEditable: (self, prop) ->
      if self.editing
        return
      el = self.el.find("[data-prop='#{prop}']")
      value = el.text()
      replacer = $ "<input type=\"text\" data-prop=\"#{prop}\" value=\"#{value}\">"

      saveIt = () ->
        self.editing = false
        newValue = replacer.val()
        el.html ""
        el.text newValue 
        drews.trigger self.triggeree, "modelviewvalchanged", self.model, prop, newValue

      replacer.bind "keyup", (e) ->
        if e.keyCode is 13
          saveIt()

      replacer.bind "blur", (e) -> saveIt()
         
      el.html replacer 
      self.editing = true
      replacer[0].focus()
      replacer[0].select()


 


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
      options?.triggeree ||= bar
      {triggeree} = options
      el.submit (e) ->
        e.preventDefault()
        drews.trigger triggeree, "submit", el.find(".search").val()
        el.find(".search").val("")
      return bar
    name: "SearchBarView"
    


