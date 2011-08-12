define "image-rotator", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  severus = require "severus"
  imageRotatorer = () ->
    self = drews
    el = $ """
      <div class="image-rotator" style="position:relative;">
      </div>
    """
    index = 0
    images = []
    self.el = el
    el.bind "click", (e) ->
      handleImageClick()
    addImage = (url, width) ->
      img = $ """
        <img src="#{url}" style="width: #{width}px; position: absolute; top: 0; left: 0;"/>
      """
      images.push img
      el.append img
      next()
      self
    handleImageClick = () ->
      next()
    self.addImage = addImage

    next = () ->
      index += 1 
      if index >= images.length
        index = 0
      render()
    self.next = next


    prev = () ->
      index += 1 
      if index <= 0
        index = images.length - 1
      render()
    self.prev = prev

    render = () ->
      console.log _.map images, (image) -> image.attr "src"
      for image, i in images
        console.log "#{index} =?= #{i}"
        if index == i
          console.log "yes, showing"
          images[i].show()
          console.log images[i].attr "src"
        else
          console.log "no, hiding`"
          images[i].hide()
          console.log images[i].attr "src"
    self





