define "image-rotator", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  severus = require "severus"
  config = require "config"
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


    self.getAdjustedDimensions = getAdjustedDimensions = (w, h) ->
      widthedHeight = (h/w) * config.imgMaxWidth
      heightedWidth =  (w/h) * config.imgMaxHeight
      if widthedHeight > config.imgMaxHeight
        [heightedWidth, config.imgMaxHeight]
      else
        [config.imgMaxWidth, widthedHeight]

    addImage = (url) ->
      img = $ """
        <img src="#{url}" style="width: #{config.imgMaxWidth}px; position: absolute; top: 0; left: 0;"/>
      """
      console.log img
      img.bind "load", () ->
        h = this.height #img.height()
        w = this.width #width()
        [w,h] = getAdjustedDimensions w,h
        img.animate "width": "#{w}px"
        img.animate "height": "#{h}px"


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
      for image, i in images
        if index == i
          images[i].show()
        else
          images[i].hide()
    self





