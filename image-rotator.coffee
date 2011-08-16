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
    addImage = (url, maxDimension) ->

      img = $ """
        <img src="#{url}" style="position: absolute; top: 0; left: 0;"/>
      """
      img.bind "load", () ->
        h = this.height #img.height()
        w = this.width #width()

        console.log "height = #{h}"
        console.log "width = #{w}"

        #if maxed to width
        widthedHeight = (h/w) * config.imgMaxWidth
        heightedWidth =  (w/h) * config.imgMaxHeight

        console.log "maxHeight #{config.imgMaxHeight} heightedWidth #{heightedWidth}"
        console.log "maxWidth #{config.imgMaxWidth} widthedHeight #{widthedHeight}"

        if widthedHeight > config.imgMaxHeight
          img.css "height": "#{config.imgMaxHeight}px"
          img.css "width": "#{heightedWidth}px"
        else
          img.css "height": "#{widthedHeight}px"
          img.css "width": "#{config.imgMaxWidth}px"

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





