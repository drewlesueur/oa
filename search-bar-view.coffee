define "search-bar-view", () ->
  $ = require "jquery"
  _ = require "underscore"
  drews = require "drews-mixins"
  nimble = require "nimble"
  drews.bind = drews.on
  drewsEventMaker = require "drews-event"
  searchBarViewMaker = (options) ->
    el ?= $ """
      <div class="search-bar-view">
        <form class="search-form">
          <input class="search" placeholder="" />
        </form>
      </div>
    """
    el.css
      position:"absolute"
      "z-index": 600
      left: "300px"

    self =
      el: el
    self = drewsEventMaker self
    triggeree = options?.triggeree or self
    self.setTriggeree triggeree
    {trigger} = self

    el.submit (e) ->
      e.preventDefault()
      trigger "submit", el.find(".search").val()
      el.find(".search").val("")
    self
