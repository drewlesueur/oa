define "youtube-parser", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  exports = {}
  exports.exampleEmbed = '<iframe width="425" height="349" src="http://www.youtube.com/embed/H1G2YnKanWs" frameborder="0" allowfullscreen></iframe>'
  createIframe =  (yt) ->
    """<iframe class="video-iframe" width="#{yt.width}" height="#{yt.height}" src="http://www.youtube.com/embed/#{yt.id}?autoplay=1"></iframe>"""
  exports.createIframe = createIframe
  exports.init = (youtubeEmbed) ->
    yt = {}
    yt.embed = youtubeEmbed
    matches = null
    if matches = yt.embed.match /embed\/([^\"\?]*)(\"|\?)/
      #"""""""
      yt.id = matches[1]
      widthMatches = yt.embed.match(/width="(\d+)"/)
      heightMatches = yt.embed.match(/height="(\d+)"/)
      if widthMatches
        yt.width = widthMatches[1]
      if heightMatches
        yt.height = heightMatches[1]
      yt.embed = createIframe yt

    #example link1 http://www.youtube.com/watch?v=VnXTlclUyfg&feature=channel_video_title
    else if matches = yt.embed.match /v=([^\&]*)\&/
      yt.id = matches[1]
      yt.link = yt.embed
      yt.width = 425
      yt.height = 349
      yt.embed = createIframe yt
    #example link2 http://www.youtube.com/user/DrewLeSueur2#p/u/3/o1N9Y_1QROs
    else if matches = yt.embed.match /\/([^\/]*)$/
      yt.id = matches[1]
      yt.link = yt.embed
      yt.width = 425
      yt.height = 349
      yt.embed = createIframe yt


  exports.getLittleImage = (numb) =>
    if not yt.id then return null
    if not _.isNumber(numb) then numb = 1
    "http://img.youtube.com/vi/#{yt.id}/#{numb}.jpg"
  exports.getBigImage = () =>
    if not yt.id then return null
    "http://img.youtube.com/vi/#{yt.id}/0.jpg"
 
