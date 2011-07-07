define "office-atlas", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  gmap = require "gmap"
  barView = require "barview"
  Listing = require "listing"
  {log} = _
  {trigger, "on":bind, meta:m} = drews
  barHeight = 50
  map = null
  view = (obj) -> (m obj).view || (m obj).view = {}
  # this is the "Presenter"

  handleSubmit = (address) ->
    gmap.lookup address, (err, results) ->
      if err then return log "ERROR looking up address"
      latlng = results[0].geometry.location
      log latlng
      #TODO: trigger and bind on listing
      listing = 
        lat: latlng.lat()
        lng: latlng.lng()
        address: address
      listing = Listing.init listing
      view listing #generates the listing view
      listingViewInfo = gmap.addListing map, listing
      extend (view listing), listingViewInfo 
      

      

  init = () ->
    map = gmap.makeMap()
    bar = barView.init()
    bind bar, "submit", handleSubmit
    $(document.body).append gmap.getDiv map
    $(document.body).append bar.el
    log bar.el
  return {init}

$ = require "jquery"
$ -> 
  officePresenter = require "office-atlas"
  officePresenter.init()
