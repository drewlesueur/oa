# todo: don't don't bind so many dom events liek delete listing
# also, dont call getBubbleContent until its needed
#
# Douglas Crockfords functional inheritance
# vs aboslutely no polymporphisnm Listing.save listing
# either way use binds, and triggers (emits and ons) event based
# programming so it doesn't really matter
# different parts don't only know very minimal api
# like model.val (maybe model.get(val))
# not like: model.view.soSomeCrazyApiCall()
# or: model.view.bubble = bubble
# but: trigger "newbubble", model, bubble
# then the place that knows the model, and its type can set it, or call it

$ = require "jquery"
_ = require "underscore"
drews = require "drews-mixins"
nimble = require "nimble"
severus = require "severus"
severus.db = "officeatlas_dev"
drews.bind = drews.on
define "drews-event", () ->
  drewsEventMaker = (obj) ->
    triggeree = obj
    obj.setTriggeree = (_trig) ->
      triggeree = _trig 
    obj.on = (args...) ->
      drews.on obj, args...
    obj.trigger = (args...) ->
      drews.trigger triggeree, args...
    obj

drewsEventMaker = require "drews-event"


{log} = drews

    
define "bubble-view", () ->
  #class BubbleView
  _ = require "underscore"
  drews = require "drews-mixins"
  fileBoxMaker = require "filebox"
  fileDroppable = require "file-droppable"
  drewsEventMaker = require "drews-event"

  bubbleViewMaker = (options) ->
    {triggeree, model} = options

    self = drewsEventMaker options: options
    self.setTriggeree options?.triggeree or self
    {trigger} = self

    filebox = fileBoxMaker()
    filebox.on "uploaded", (urls) ->
      #trigger addimages view
      trigger "addimages", model, urls

    el = $ """
      <div>
        <span class="editable" data-prop="address"></span>
        <div class="editable" data-prop="notes"></div>
        <!--<a class="add-images" href="#">Add images</a>-->
        <div class="file-upload">
        </div>
        <div class="add-image-area">
          <textarea class="images"></textarea>
          <input class="save-images-button" type="button" value="Save images">
        </div>
        <a href="#" class="delete">Delete Listing</a>
      </div>
    """
    fileDroppable el
    el.bind "filedroppablefiles", (e, files) ->
      filebox.uploadFiles files
    el.bind "filedroppableurls", (e, url) ->
      addImage url

    el.find(".file-upload").append(filebox.getEl()).append(filebox.getProgressBars())
    el.find(".delete").click (e) ->
      e.preventDefault()
      handleDeleteButton()

    handleDeleteButton = () ->
      trigger "deletelisting", model
     
      
    el.css
      width: "#{config.width}px"
      height: "#{config.height}px"

    el.find(".add-image-area").hide()
    el.find(".add-images").click (e) ->
      e.preventDefault()
      self.handleAddImages()
    el.find(".save-images-button").click (e) ->
       e.preventDefault()
       self.handleSaveImages()
    self.el = el
    addImages = (urls) ->
      _.each urls, (url) ->
        addImage url
    self.addImages = addImages
    addImage = (url) ->
      img = $ """
        <img src="#{url}" style="width: #{config.width}px"/>
      """
      el.append img
    handleAddImages = () ->
      self.el.find(".add-image-area").show()
    self.handleAddImages = handleAddImages
    handleSaveImages = () ->
      images = el.find(".images").val().split("\n")
      drews.trigger triggeree, "modelviewvalchanged", model, "images", images
    self.handleSaveImages = handleSaveImages
    addImages model.images #initail addimages
    self

# this is the presenter
define "map-page-presenter", () ->
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
      map.addListing listing, listing.view.getBubbleContent()
      listing.presenter = self
      # either bind on listing or listingMaker
      # if bind on listingMaker, check for listing._isInApp
      #
      # bind addimages presenter
      listing.on "addimages", (urls) ->
        listing.view.addImages urls
      listing.on "deleted", () ->
        map.removeListing listing
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
    map.on "addimages", addImages

    map.on "bubbleopen", (_listing) ->
      _.each listings, (listing) ->
        if listing != _listing
          listing.view.bubble.close()

    map.on "newbubble", (listing, bubble) ->
      listing.view.bubble = bubble
    
    deleteListing = (listing) ->
      listing.remove()

    map.on "deletelisting", deleteListing
    

    map.on "newmarker", (listing, marker) ->
      listing.view.marker = marker
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
    self = drewsEventMaker self
    {trigger, on:bind} = self
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
    #removeListing view
    removeListing = (listing) ->
      listing.view.marker.setMap null
      listing.view.bubble.close()
    self.removeListing = removeListing
    

    #addListing view
    addListing = (listing, bubbleContent, cb=->) =>
      latlng = new google.maps.LatLng listing.lat, listing.lng
      marker = new google.maps.Marker
        animation: google.maps.Animation.DROP
        position: latlng
        title: listing.address
        icon: "http://3office.drewl.us/pinb.png"
      marker.setMap map
      map.setCenter latlng
      bubble = new google.maps.InfoWindow
        content: bubbleContent
        position: latlng
     
      google.maps.event.addListener marker, 'click', () ->
        #drews.trigger map, "markerclick", listing
        trigger "bubbleopen", listing 
        bubble.open map
        

      google.maps.event.addListener bubble, 'closeclick', () ->
        trigger "bubbleclick", listing
      trigger "newmarker", listing, marker
      trigger "newbubble", listing, bubble
      return {bubble, marker}
    self.addListing = addListing
    self


define "listing", () ->
  #closures for classes vs my _type for classes
  #class Listing
      
  listingMaker = (attrs) ->
    self = drewsEventMaker {}
    {trigger, on:bind} = self
    self.attrs = attrs
    _.extend self, attrs
    set = (prop, value) ->
      attrs[prop] = value 
      self[prop] = value # for convenience
      save()
    self.set = set
    #addImages model
    addImages = (urls) ->
      attrs.images or= []
      attrs.images = attrs.images.concat urls
      self.images = attrs.images
      #trigger addimages model
      trigger "addimages", urls
      save (err) ->
        if err
          trigger "failedimages", urls
    self.addImages = addImages

    get = (self, prop, value) ->
      return self.attrs[prop]

    save = (cb=->) ->
      severus.save "listings", attrs, (error, _listing) ->
        _.extend attrs, _listing
        cb error, self
    self.save = save
    remove = (cb) ->
      severus.remove "listings", attrs._id, (err) ->
        trigger "deleted", self
    self.remove = remove
    self
  listingMaker.find = (args...) ->
    severus.find "listings", args...
    
  listingMaker = drewsEventMaker listingMaker
  listingMaker

define "listing-view", () ->
  editableFormMaker = require "editable-form"
  listingViewMaker = (listing, options) ->
    bubbleView = null
    model = listing
    self =  drewsEventMaker {}
    triggeree = options.triggeree or self
    self.setTriggeree triggeree
    #drewsEventMaker.setTriggeree self, options.triggeree
    self.model = model

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
    closeBubble = () ->
    #view addImages
    addImages = (urls) ->
      bubbleView?.addImages urls
    self.addImages = addImages

      
    self


# use a self or a big closure
# what is space
define "editable-form", () ->
  editableFormMaker = (html, model, options) ->
    self = 
      el : $ html
      model: model
    self = drewsEventMaker self
    triggeree = options?.triggeree or self
    self.setTriggeree triggeree
    {trigger} = self
    el = self.el
    
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
        trigger "modelviewvalchanged", model, prop, newValue

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
    self = drewsEventMaker self
    triggeree = options?.triggeree or self
    self.setTriggeree triggeree
    {trigger} = self

    el.submit (e) ->
      e.preventDefault()
      trigger "submit", el.find(".search").val()
      el.find(".search").val("")
    self
    


config =
  width: 320
  height: 320

define "file-droppable", () ->
 fileDroppable = (el) -> 
   el.bind "dragover", (e) ->
     e.preventDefault()
     e.stopPropagation()
   el.bind "dragenter", (e) -> #ie?
     return false
   el.bind "drop", (e) ->
     e.preventDefault()
     e.stopPropagation()
     e = e.originalEvent #jQuery stuff
     files = e.dataTransfer.files
     if files.length > 0
       el.trigger "filedroppablefiles", [files]
     else
       el.trigger "filedroppableurls", e.dataTransfer.getData('text')

     

