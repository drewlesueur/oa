define "bubble-view", () ->
  #class BubbleView
  $ = require "jquery"
  nimble = require "nimble"
  _ = require "underscore"
  drews = require "drews-mixins"
  drews.bind = drews.on
  drewsEventMaker = require "drews-event"
  fileBoxMaker = require "filebox"
  fileDroppable = require "file-droppable"
  drewsEventMaker = require "drews-event"
  config = require "config"
  imageRotatorer = require "image-rotator"


  bubbleViewMaker = (options) ->
    {triggeree, model} = options

    self = drewsEventMaker options: options
    triggeree =  options?.triggeree or self
    self.setTriggeree triggeree
    {trigger} = self

    filebox = fileBoxMaker()
    filebox.on "uploaded", (urls) ->
      #trigger addimages view
      trigger "addimages", model, urls
    bubbleHtml = require "bubble-html"
    el = $ """
      <div>
        <div>
          #{bubbleHtml}
        </div>
        <a href="#" class="delete">Delete Listing</a>
        <div class="file-upload">
        </div>
        <div class="add-image-area" >
          <textarea class="images"></textarea>
          <input class="save-images-button" type="button" value="Save images">
        </div>
        <div class="image-area" style="position:relative;">
        </div>
        <div style="bottom: 0px; position: absolute;">
          <a href="#" style="font-size: 10px;" class="delete-image">delete image</a>
        </div>
      </div>
    """
    
    imageRotator = imageRotatorer()
    el.find(".image-area").append imageRotator.el
    el.find(".delete-image").bind "click", () ->
      console.log imageRotator
      trigger "deleteimage", model, imageRotator.getCurrentUrl()

    fileDroppable el
    el.bind "filedroppablefiles", (e, files) ->
      filebox.uploadFiles files
    el.bind "filedroppableurls", (e, url) ->
      addImage url

    el.find(".file-upload").append(filebox.getEl()).append(filebox.getProgressBars())
    el.find(".delete").click (e) ->
      e.preventDefault()
      handleDeleteButton()

    handleDeleteButton = () ->
      if (confirm("Are you sure you want to delete?"))
        trigger "deletelisting", model
      
    el.css
      width: "#{config.width}px"
      height: "#{config.height}px"

    el.find(".add-image-area").hide()
    el.find(".add-images").click (e) ->
      e.preventDefault()
      self.handleAddImages()
    el.find(".save-images-button").click (e) ->
       e.preventDefault()
       self.handleSaveImages()
    self.el = el

    deleteImage = self.deleteImage = (url) ->
      imageRotator.deleteImage url

    #view addimages
    addImages = (urls) ->
      _.each urls, (url) ->
        addImage url
    self.addImages = addImages
    addImage = (url) ->
      imageRotator.addImage url, config.width
    handleAddImages = () ->
      self.el.find(".add-image-area").show()
    self.handleAddImages = handleAddImages
    handleSaveImages = () ->
      images = el.find(".images").val().split("\n")
      drews.trigger triggeree, "modelviewvalchanged", model, "images", images
    self.handleSaveImages = handleSaveImages
    addImages model.images #initail addimages
    self
