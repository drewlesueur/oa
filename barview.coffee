define "barview", () ->
  _ = require "underscore"
  $ = require "jquery"
  drews = require "drews-mixins"
  nimble = require "nimble"
  {trigger, "on":bind} = drews
  
  init = () ->
    form = {}
    el = $ """
      <div class="bar">
        <form class="search-form">
          <input class="search" placeholder="Add address" />
        </form>
      </div>
    """
    form.el = el
    el.submit (e) ->
      e.preventDefault()
      trigger form, "submit", el.find(".search").val()
    return form

  return {init}
