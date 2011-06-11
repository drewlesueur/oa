config = require './config.coffee'
Client = require('mysql').Client
_ = require "underscore"
require("drews-mixins") _
MySqlHelper = require("mysql-helper").MySqlHelper

mongo = require("mongodb")
mongoHost = config.db.host
mongoPort = config.db.port || mongo.Connection.DEFAULT_PORT
ObjectId = mongo.BSONPure.ObjectId
db = null
dbBig = new mongo.Db config.db.db,
  new mongo.Server mongoHost, mongoPort, {}
  {}

listings = null
users = null
dbBig.open (err, _db) -> 
  db = _db
  db.collection 'listings', (err, collection) ->
    listings = collection
  db.collection 'users', (err, collection) ->
    users = collection
    
# this works
#  db.collection 'things', (err, collection) ->
#    collection.insert {a:"this is a drew test"}
    
{keys, wait} = _

log = (args...) -> console.log args... 

# reconnect 1 second after the connection closes

client = null
db = null
tries = 0

  



express = require('express')

drewsSignIn = (req, res, next) ->
  req.isSignedIn = () ->
    req.session.email isnt null
  next()

app = module.exports = express.createServer()
app.configure () ->
  app.use(express.bodyParser())
  app.use express.cookieParser()
  app.use express.session secret: "boom shaka laka"
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
  app.use drewsSignIn

app.configure 'development', () ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })) 

app.configure 'production', () ->
  app.use(express.errorHandler()) 


pg = (p, f) ->
  app.post p, f
  app.get p, f


# Routes

app.get '/', (req, res) ->
  req.session.booya = "test this"
  res.sendfile "index.html"
  #res.send "hello world"



app.get "/drew", (req, res) ->
  res.send "aguzate, hazte valer"

app.post "/deleteTestUsers", (req, res) ->
  console.log "delete test users"
  if config.env is "production"
    res.send "no can do", 401
    return
  else
    users.remove (err) ->
      if !err
        console.log "should have deleted test users"
      else
        console.log "cant delete users"
      res.send {}

app.post "/cleanUpTestDb", (req, res) ->
  if config.env is "production"
    res.send "no can do", 401
    return
  else
    listings.remove {address: {"$ne": "gilbert, az" }}, (err) ->
      console.log "you cleaned the db!!"
      if err then return res.send err
      res.send "success"


pg "/p", (req, res) ->
  req.session.poo = "gotta"
  res.send "that is all"

pg "/whoami", (req, res) ->
  res.send req.session
  
pg "/questions/:email", (req, res) ->
  console.log "GOT to the email thing"
  users.findOne email:req.params.email, (err, user) ->
    if err then return res.send err, 500
    if user then return res.send user
    res.send {error: err.getMessage()}, 400 

app.post "/listings", (req, res) ->
  listings.insert req.body, (err) ->
    if err
      console.log "there was an error"  
      return res.send err.message
    else
      res.send {'yay': 1}
    
app.get "/listings", (req, res) ->
  listings.find().toArray (err, _listings) ->
   if err then return res.send {}, 500
   res.send _listings,
     "Cache-Control": "no-cache, must-revalidate"
     "Expires": "Sat, 26 Jul 1997 05:00:00 GMT"
  
userExists = (email, cb=->) ->
  users.findOne email: email, (err, user) ->
    if user
      cb null, true
    else 
      cb null, false

#not restful, but I'll worry about it later
pg "/signout", (req, res) ->
  delete req.session.email
  res.send you: "did it"

pg "/json_test", (req, res) ->
  res.send
    a: 1
    b: 2
    band:
      name: "aterciopelados"
      albums: ["rio", "oye", "gozo poderoso"]
      members: ["hector buitrago", "andrea echeverri"]

app.post "/sessions", (req, res) ->
  userExists req.body.email, (err, result) ->
    if result is true
      users.findOne 
        email: req.body.email
        question: req.body.question 
        password: req.body.password
        (err, user) -> 
          console.log "the user is"
          console.log user
          if not user
            res.send {error: "wrong combo"}, 401
          else
            req.session.email = req.body.email
            res.send {} #200 ok
    else

      # just create the user
      #db.insert "users", req.body, (err) ->
      {email, question, password} = req.body
      users.insert req.body, (err) ->
        req.session.email = req.body.email
        if err then return res.send {error: "couldn't create user"}, 500
        res.send {"message": "created user"} #200

  
  


exports.app = app

if (!module.parent) 
  app.listen config.server.port || 8001
  console.log("Express server listening on port %d", app.address().port)

