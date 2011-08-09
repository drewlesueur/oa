config =
  width: 320
  height: 320

define "file-droppable", () ->
 fileDroppable = (el) -> 
   el.bind "dragover", (e) ->
     e.preventDefault()
     e.stopPropagation()
   el.bind "dragenter", (e) -> #ie?
     return false
   el.bind "drop", (e) ->
     e.preventDefault()
     e.stopPropagation()
     e = e.originalEvent #jQuery stuff
     console.log e
     files = e.dataTransfer.files
     console.log "original files are"
     console.log files
     if files.length > 0
       el.trigger "filedroppablefiles", [files]
     else
       el.trigger "filedroppableurls", e.dataTransfer.getData('text')

     

define "bubble-view", () ->
  #class BubbleView
  window[1] # because I have to have a get for my set
  _ = require "underscore"
  drews = require "drews-mixins"
  fileBoxMaker = require "filebox"
  fileDroppable = require "file-droppable"
  bubbleViewMaker = (options) ->
    {triggeree} = options
    filebox = fileBoxMaker()
    filebox.on "uploaded", (urls) ->
      addImages urls
    self =
      options: options
    el = $ """
      <div>
        <span class="editable" data-prop="address"></span>
        <div class="editable" data-prop="notes"></div>
        <!--<a class="add-images" href="#">Add images</a>-->
        <div class="file-upload">
        </div>
        <div class="add-image-area">
          <textarea class="images"></textarea>
          <input class="save-images-button" type="button" value="Save images">
        </div>
      </div>
    """
    fileDroppable el
    el.bind "filedroppablefiles", (e, files) ->
      console.log files
      filebox.uploadFiles files
    el.bind "filedroppableurls", (e, url) ->
      console.log url
      addImage url

    el.find(".file-upload").append(filebox.getEl()).append(filebox.getProgressBars())
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
    addImages = (urls) ->
      _.each urls, (url) ->
        addImage url
    addImage = (url) ->
      img = $ """
        <img src="#{url}" style="width: #{config.width}px"/>
      """
      el.append img
    handleAddImages = () ->
      self.el.find(".add-image-area").show()
    self.handleAddImages = handleAddImages
    handleSaveImages = () ->
      images = el.find(".images").val().split("\n")
      console.log "the options are"
      console.log self.options
      drews.trigger self.options.triggeree, "modelviewvalchanged", self.options.model, "images", images
    self.handleSaveImages = handleSaveImages
    self






