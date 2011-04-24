var test, tests;
tests = {};
test = function(title, func) {
  return tests[title] = func;
};
test("title should be office atlas", function(done) {
  _.assertEqual(document.body.title, "OfficeAtlas");
  return done();
});
_.parallel(tests, function(results) {
  return console.log("done");
});