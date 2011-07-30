define "bubble-view", () ->
  #class BubbleView
  window[1] # because I have to have a get for my set
  _ = require "underscore"
  drews = require "drews-mixins"
  BubbleView = 
    init: (options) ->
      self =
        _type: BubbleView
        options: options
      el = $ """
        <div>
          <span class="editable" data-prop="address"></span>
          <div class="editable" data-prop="notes"></div>
          <a class="add-images" href="#">Add images</a>
          
          <div class="add-image-area">
            <textarea class="images"></textarea>
            <input class="save-images-button" type="button" value="Save images">
          </div>
        </div>
      """
      el.css
        width: "300px"
        height: "300px"

      el.find(".add-image-area").hide()
      el.find(".add-images").click (e) ->
        e.preventDefault()
        self.handleAddImages()
      el.find(".save-images-button").click (e) ->
         e.preventDefault()
         self.handleSaveImages()
      self.el = el
      self
    handleAddImages: (self) ->
      self.el.find(".add-image-area").show()
    handleSaveImages: (self) ->
      images = self.el.find(".images").val().split("\n")
      console.log "the options are"
      console.log self.options
      drews.trigger self.options.triggeree, "modelviewvalchanged", self.options.model, "images", images






