config = require './config.coffee'
Client = require('mysql').Client
_ = require "underscore"
require("drews-mixins") _
MySqlHelper = require("mysql-helper").MySqlHelper


log = (args...) -> console.log args... 

# reconnect 1 second after the connection closes

tries = 0
Client.prototype.makeLastingConnection = () ->
  tries++
  console.log "trying to make a lasting connection for the #{tries} time"
  @connect () =>
    @_connection.on "close", () =>
      _.wait 1000, () => @makeLastingConnection()

  
client = new Client

db = new MySqlHelper client


client.host = 'drew.the.tl'
client.user = config.user
client.password = config.password
client.makeLastingConnection()
client.query("Use #{config.db};")

express = require('express')

drewsSignIn = (req, res, next) ->
  req.isSignedIn = () ->
    req.session.email isnt null
  next()

app = module.exports = express.createServer()
app.configure () ->
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
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




# Routes

app.get '/', (req, res) ->
  res.sendfile "index.html"
  #res.send "hello world"

app.post '/', (req, res) ->
  res.send req.param "address"
  client.query "INSERT INTO listings 
    (address, notes, lat, lng) 
  values (?, ?, ?, ?)" 
  , [req.param("address"), req.param("notes"), 
  req.param("lat"), req.param("lng")]
  res.send "thanks"


app.get "/drew", (req, res) ->
  res.send "aguzate, hazte valer"

app.post "/cleanUpTestDb", (req, res) ->
  db.query "delete from listings where address = '1465 E. Halifax St, Mesa, AZ 85203'", (err) ->
    if err then return res.send err
    res.send "success"

app.post "/deleteTestUsers", (req, res) ->
  db.query "delete from users", (err) ->
    res.send {}

app.post "/listings", (req, res) ->
  db.insert "listings", req.body, (err) ->
    if err then return res.send err.message
    res.send {'yay': 1}
    
app.get "/listings", (req, res) ->
  db.query "select * from listings", (err, results) ->
   if err then return res.send {}, 500
   res.send results
  
userExists = (email, cb=->) ->
  db.query "select * from users where email = ?",
  [email], (err, result) ->
    if result?.length > 0
      cb null, true
    else 
      cb null, false
      
app.post "/sessions", (req, res) ->
  log "going to see if user exists"
  userExists req.body.email, (err, result) ->
    if result is true
      log "user exists"
      db.query "select * from users where email = ? and question = ? and password = password(?)",
        [req.body.email, req.body.question, req.body.password],
        (err, results) ->
          if results.length is 0
            res.send {error: "wrong combo"}, 500
          else
            req.session.email = req.body.email
            res.send {} #200 ok
    else
      log "user doesn't exit"

      # just create the user
      log "goign to try to insert user "
      db.insert "users", req.body, (err) ->
        log "inserted user"
        log "err"
        log err
        
        if err then return res.send {error: "couldn't create user"}, 500
        res.send {"message": "created user"} #200

  
  


exports.app = app

if (!module.parent) 
  app.listen(8001)
  console.log("Express server listening on port %d", app.address().port)

