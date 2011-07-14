__useLookup__ = true
# gmap returns a function that
# 'instantiates' a new googlemap wrapper object
define "gmap", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  google = require "google"
  self = {}
  # mapifies a div
  map = null
  {log, extend} = _
  {trigger, "on":bind, meta:m, polymorphic:p} = drews
  type = drews.metaMaker "type"
  makeMap = (el=$ "<div id=\"map\"></div>") ->
    el.css
      width: "#{$(window).width()}px"
      height: "#{$(window).height()}px"
      position: 'absolute'
    latLng = new google.maps.LatLng(33.4222685,-111.8226402)
    options =
      zoom:11
      center: latLng
      mapTypeId: google.maps.MapTypeId.ROADMAP
    log "what"
    map = new google.maps.Map el[0], options
    log "what2"
    return map
  getDiv = (map) -> map.getDiv()
  getCenter = (map) ->
    map.getCenter()
  getZoom = (map) ->
    map.getZoom()
  setLatLng = (map, lat, lng) =>
    map.setCenter new google.maps.LatLng lat, lng
  lookup = (address, done) =>
    geocoder = new google.maps.Geocoder()
    geocoder.geocode {address: address}, (results, status) =>
      if status is google.maps.GeocoderStatus.OK
        done null, results
      else
        done status
  addListing = (map, listing, d=->) =>
    drews.wait 10, ->
     
      latlng = new google.maps.LatLng listing.lat, listing.lng
      log "the lat lng is"
      log latlng
      marker = new google.maps.Marker
        animation: google.maps.Animation.DROP
        position: latlng
        title: listing.address
        icon: "http://office.the.tl/pin.png"
      marker.setMap map
      map.setCenter latlng
      bubble = new google.maps.InfoWindow
        content: listing.view.getBubbleContent()
        zIndex: 999999
     
      google.maps.event.addListener marker, 'click', () ->
        trigger map, "markerclick", listing
      google.maps.event.addListener bubble, 'closeclick', () ->
        trigger map, "bubbleclick", listing
      listing.view.marker = marker
      listing.view.bubble = bubble
      return {bubble, marker}

  return {makeMap, getCenter, getZoom, setLatLng, getDiv,
    addListing
    lookup
  } 


