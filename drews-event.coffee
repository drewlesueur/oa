define "drews-event", () ->
  drews = require "drews-mixins"
  drews.bind = drews.on
  drewsEventMaker = (obj) ->
    triggeree = obj
    obj.setTriggeree = (_trig) ->
      triggeree = _trig 
    obj.on = (args...) ->
      drews.on obj, args...
    obj.trigger = (args...) ->
      drews.trigger triggeree, args...
    obj
