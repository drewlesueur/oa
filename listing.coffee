__useLookup__ = true
define "listing", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  {trigger, "on":bind, log, meta:m} = drews
  {} = drews
  {each} = _
  type = drews.metaMaker "type"
  exports = {} 
  exports.init = (listing) ->
    listing._type = exports
    listing
  exports.jsonExclusions = ["view", "__mid"]
      
  return exports
  

define "listing-view", () ->
  #trying some new stuff here
  # because I don't want to pollute listing
  # so I am adding a meta object factor
  # or not
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  youtubeParser = require "youtube-parser"
  {trigger, "on":bind, log} = drews
  exports = {}
  exports.getBubbleContent = (listingView) ->
    listing = listingView.model
    youtube = youtubeParser.init listing.youtube
    bigImage = youtube.bigImage
    width = youtube.width
    height = youtube.height

    if bigImage and width
      image = "<img class=\"thumbnail\" src=\"#{bigImage}\" style=\"width:#{width}px;\;height:#{height}px; position: relative\" />"
    else
      image = ""
    str = """
      <div style="position: relative;" class="bubble-wrapper" data-cid="#{}" data-id="#{}">
      <div class="bubble-position"></div>
      #{listing.address}
      <div class="youtube">
       #{image}
      </div>
      <br />
      <div class="notes">
        #{listing.notes}
      </div>
      <div class="squareFeet">
        #{listing.squareFeet}
      </div>
      <div class="price">
        #{listing.price}
      </div>
    </div>
    """
    content = $(str)
    content.find("img.thumbnail").click () ->
      trigger map, "youtubeimageclick", listing
    listingView.bubbleContent = content[0]


  exports.init = (listing) ->
    listing.view = _type: exports
  exports
  
  
