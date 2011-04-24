vows = require "vows"
assert = require "assert"
zombie = require "zombie"

browser = new zombie.Browser()
browser.debug = true
run = vows.describe("Visiting Sites with Browsers").addBatch
  "Visiting Google":
    topic: () ->
      browser.visit "http://office.the.tl/index-test.html", this.callback
    "can be accessed": (err, browser, status) ->
      assert.isNull err
    "can see Google as the Title": (err, browser, status) ->
      assert.equal browser.text("title"), "OfficeAtlas"

run.run()
