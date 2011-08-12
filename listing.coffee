define "listing", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  severus = require "severus"
  severus.db = "officeatlas_dev"
  drews.bind = drews.on

  drewsEventMaker = require "drews-event"
  #closures for classes vs my _type for classes
  #class Listing
      
  listingMaker = (attrs) ->
    self = drewsEventMaker {}
    {trigger, on:bind} = self
    self.attrs = attrs
    _.extend self, attrs
    set = (prop, value) ->
      attrs[prop] = value 
      self[prop] = value # for convenience
      save()
    self.set = set
    #addImages model
    addImages = (urls) ->
      attrs.images or= []
      attrs.images = attrs.images.concat urls
      self.images = attrs.images
      #trigger addimages model
      trigger "addimages", urls
      save (err) ->
        if err
          trigger "failedimages", urls
    self.addImages = addImages

    get = (self, prop, value) ->
      return self.attrs[prop]

    save = (cb=->) ->
      severus.save "listings", attrs, (error, _listing) ->
        _.extend attrs, _listing
        cb error, self
    self.save = save
    remove = (cb) ->
      severus.remove "listings", attrs._id, (err) ->
        trigger "deleted", self
    self.remove = remove
    self
  listingMaker.find = (args...) ->
    severus.find "listings", args...
    
  listingMaker = drewsEventMaker listingMaker
  listingMaker
