define "map-page-view", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  drews.bind = drews.on

  drewsEventMaker = require "drews-event"

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
    addListing = (listing, cb=->) =>
      listing.view.marker.setMap map
      map.setCenter listing.view.latlng

    self.addListing = addListing
    self
