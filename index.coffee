# todo: don't don't bind so many dom events liek delete listing
# also, dont call getBubbleContent until its needed
#
# Douglas Crockfords functional inheritance
# vs aboslutely no polymporphisnm Listing.save listing
# either way use binds, and triggers (emits and ons) event based
# programming so it doesn't really matter
# different parts don't only know very minimal api
# like model.val (maybe model.get(val))
# not like: model.view.soSomeCrazyApiCall()
# or: model.view.bubble = bubble
# but: trigger "newbubble", model, bubble
# then the place that knows the model, and its type can set it, or call it
 $ ->
   app = require "map-page-presenter"
   app()


     

