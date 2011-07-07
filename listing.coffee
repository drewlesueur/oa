define "listing", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  {trigger, "on":bind} = drews
  {meta:m} = drews
  exports = {} 
  exports.init = (listing) ->
    m(listing).view = {} 
    listing
  return exports
