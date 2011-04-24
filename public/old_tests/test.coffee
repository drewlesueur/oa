class TestBatchHelper
  constructor: (info) ->
    _.extend(@, info)
  equal: (a, b, message) =>
    result = 
      message: message
      expected: b
      got: a
      title: @title
    if a == b
      result.pass = true
      @testBatch
    else
      result.pass = false
      @testBatch["#{@testType}Failures"].push result
    @testBatch["#{@testType}Results"].push result

    

class TestBatch
  constructor: () ->
    @tests = []
    @testFailures = []
    @testTitles = []
    @testResults = []
    @asyncTests = []
    @asyncTestFailures = []
    @asyncTestTitles = []
    @asyncTestResults = []


  addGeneralTest: (title, test, testType) ->
    @["#{testType}Titles"].push title
    @["#{testType}s"].push (err, done) =>
      theThis = new TestBatchHelper
        done: done
        testType: testType
        title: title
        testBatch: @
      test.call theThis, test
    
  addTest: (title, test) ->
    @addGeneralTest title, test, "test"
   #todo _.orderBy  
  addAsyncTest: (title, test) ->
    @addGeneralTest title, test, "asyncTest"
    
  run: () =>
    _.doThese @asyncTests, (errors, values) =>
      if not _.isNull errors
        console.log "Async Tests failed"
      if @asyncTestFailures.length > 0
        console.log "FAIL async"
        console.log @asyncTestFailures
      else
        console.log "PASS async"


    _.doTheseSync @tests, (errors, values) =>
      if not _.isNull errors
        console.log "Tests failed"
      if @testFailures.length > 0
        console.log "FAIL"
        console.log @testFailures
      else
        console.log "PASS"
      



