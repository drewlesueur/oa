var assert, browser, run, vows, zombie;
vows = require("vows");
assert = require("assert");
zombie = require("zombie");
browser = new zombie.Browser();
browser.debug = true;
run = vows.describe("Visiting Sites with Browsers").addBatch({
  "Visiting Google": {
    topic: function() {
      return browser.visit("http://office.the.tl/index-test.html", this.callback);
    },
    "can be accessed": function(err, browser, status) {
      return assert.isNull(err);
    },
    "can see Google as the Title": function(err, browser, status) {
      return assert.equal(browser.text("title"), "OfficeAtlas");
    }
  }
});
run.run();