assert = require("assert")
var zombie = require("zombie");

browser = new zombie.Browser({debug: true})
browser.runScripts = true

// Load the page from localhost
browser.visit("http://office.the.tl/index-test.html", function (err, browser, status) {
  if (err) {
     console.log("there was an error")
     console.log(err.message)
  }
  console.log("the browser is")
  console.log (browser.html())


});
