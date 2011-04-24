var TestBatch, TestBatchHelper;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
TestBatchHelper = (function() {
  function TestBatchHelper(info) {
    this.equal = __bind(this.equal, this);;    _.extend(this, info);
  }
  TestBatchHelper.prototype.equal = function(a, b, message) {
    var result;
    result = {
      message: message,
      expected: b,
      got: a,
      title: this.title
    };
    if (a === b) {
      result.pass = true;
      this.testBatch;
    } else {
      result.pass = false;
      this.testBatch["" + this.testType + "Failures"].push(result);
    }
    return this.testBatch["" + this.testType + "Results"].push(result);
  };
  return TestBatchHelper;
})();
TestBatch = (function() {
  function TestBatch() {
    this.run = __bind(this.run, this);;    this.tests = [];
    this.testFailures = [];
    this.testTitles = [];
    this.testResults = [];
    this.asyncTests = [];
    this.asyncTestFailures = [];
    this.asyncTestTitles = [];
    this.asyncTestResults = [];
  }
  TestBatch.prototype.addGeneralTest = function(title, test, testType) {
    this["" + testType + "Titles"].push(title);
    return this["" + testType + "s"].push(__bind(function(err, done) {
      var theThis;
      theThis = new TestBatchHelper({
        done: done,
        testType: testType,
        title: title,
        testBatch: this
      });
      return test.call(theThis, test);
    }, this));
  };
  TestBatch.prototype.addTest = function(title, test) {
    return this.addGeneralTest(title, test, "test");
  };
  TestBatch.prototype.addAsyncTest = function(title, test) {
    return this.addGeneralTest(title, test, "asyncTest");
  };
  TestBatch.prototype.run = function() {
    _.doThese(this.asyncTests, __bind(function(errors, values) {
      if (!_.isNull(errors)) {
        console.log("Async Tests failed");
      }
      if (this.asyncTestFailures.length > 0) {
        console.log("FAIL async");
        return console.log(this.asyncTestFailures);
      } else {
        return console.log("PASS async");
      }
    }, this));
    return _.doTheseSync(this.tests, __bind(function(errors, values) {
      if (!_.isNull(errors)) {
        console.log("Tests failed");
      }
      if (this.testFailures.length > 0) {
        console.log("FAIL");
        return console.log(this.testFailures);
      } else {
        return console.log("PASS");
      }
    }, this));
  };
  return TestBatch;
})();