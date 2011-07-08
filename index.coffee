define "office-atlas", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  gmap = require "gmap"
  barView = require "barview"
  Listing = require "listing"
  ListingView = require "listing-view"
  {log, extend} = _
  {trigger, "on":bind, meta:m, polymorphic:p} = drews
  barHeight = 50
  map = null
  view = (obj) -> (m obj).view || (m obj).view = {}
  type = drews.metaMaker "type"
  # this is the "Presenter"

  band = name: "aterciopelados"
  band.size = 2
  _.mixin "test": (x) -> return "test#{x}"
  log (p "testersony", "s") 4, -1
  stooges = [{name : 'curly', age : 25}, {name : 'moe', age : 21}, {name : 'larry', age : 23}]
  log (p stooges)("sortBy")((stooge) -> stooge.age)(_.map)((s) -> s.name == "larry")()



  handleSubmit = (address) ->
    gmap.lookup address, (err, results) ->
      if err then return log "ERROR looking up address"
      latlng = results[0].geometry.location
      #TODO: trigger and bind on listing
      listing = 
        lat: latlng.lat()
        lng: latlng.lng()
        address: address
      listing = Listing.init listing
      listingView = ListingView.init listing
      listingViewInfo = gmap.addListing map, listing
  handleMarkerClick = (listing) ->
    alert "listing marker clicked" 

  handleBubbleClick = (listing) ->
    alert "listing bubble clicked" 
      

  init = () ->
    map = gmap.makeMap()
    bar = barView.init()
    bind map, "markerclick", handleMarkerClick
    bind map, "bubbleclick", handleBubbleClick

    bind bar, "submit", handleSubmit
    $(document.body).append gmap.getDiv map
    $(document.body).append bar.el
  return {init}

$ = require "jquery"
$ -> 
  officePresenter = require "office-atlas"
  #officePresenter.init()
