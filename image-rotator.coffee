define "image-rotator", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  severus = require "severus"
  config = require "config"
  drewsEventMaker = require "drews-event"
  

  imageRotatorer = () ->
    self = drewsEventMaker {}
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

    deleteImage = self.deleteImage = (url) ->
      console.log images
      for image, _index in images
        image = $ image # I tought image was already a jquert object
        if image.attr("src") == url
          images.splice(_index, 1)
          render()
          image.remove()

    addImage = (url) ->
      img = $ """
        <img src="#{url}" style="width: #{config.imgMaxWidth}px; position: absolute; top: 0; left: 0;"/>
      """
      img.bind "load", () ->
        images.push img
        el.append img
        h = this.height #img.height()
        w = this.width #width()
        [w,h] = getAdjustedDimensions w,h
        img.animate "width": "#{w}px"
        img.animate "height": "#{h}px"
        index = images.length - 1
        render()
        self


    handleImageClick = () ->
      next()
    self.addImage = addImage

    next = () ->
      index += 1 
      render()
    self.next = next

    getCurrentUrl = () ->
      images[index].attr "src"
    self.getCurrentUrl = getCurrentUrl
    


    prev = () ->
      index += 1 
      render()
    self.prev = prev

    render = () ->
      if index >= images.length
        index = 0
      else if index < 0
        index = images.length - 1
      for image, i in images
        if index == i
          images[i].show()
        else
          images[i].hide()
    self





