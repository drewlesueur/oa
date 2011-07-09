define "listing", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  {trigger, "on":bind, log} = drews
  {meta:m} = drews
  type = drews.metaMaker "type"
  exports = {} 
  exports.init = (listing) ->
    (m listing).type = exports
    listing
  return exports

define "listing-view", () ->
  #trying some new stuff here
  # because I don't want to pollute listing
  # so I am adding a meta object factor
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  youtubeParser = require "youtube-parser"
  {trigger, "on":bind, log} = drews
  {meta:m} = drews
  type = drews.metaMaker "type"
  exports = {}
  view = (obj) -> (m obj).view || (m obj).view = {}
  exports.getBubbleContent = (listing) ->
    getBubbleContent: () =>
      youtube = youtubeParser.init listing.youtube
      bigImage = youtube.bigImage
      width = youtube.width
      height = youtube.height

      if bigImage and width
        image = "<img class=\"thumbnail\" src=\"#{bigImage}\" style=\"width:#{width}px;\;height:#{height}px; position: relative\" />"
      else
        image = ""
      str = """
        <div style="position: relative;" class="bubble-wrapper" data-cid="#{@model.cid}" data-id="#{@model.id}">
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
      v.bubbleContent = content[0]
      log v.bubbleContent 
      return v.bubbleContent

  exports.view = view
  exports.init = (listing) ->
    type (view listing), exports
    #(m view listing).type = exports
    view listing

  exports
  
  
