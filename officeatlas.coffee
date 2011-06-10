config = require './config.coffee'
Client = require('mysql').Client
_ = require "underscore"
require("drews-mixins") _
MySqlHelper = require("mysql-helper").MySqlHelper

{wait} = _

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
client.user = config.db.user
client.password = config.db.password
client.makeLastingConnection()
client.query("Use #{config.db.db};")

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
  db.query "delete from listings where id > 36" , (err) ->
    console.log "you cleaned the db!!"
    if err then return res.send err
    res.send "success"

app.post "/deleteTestUsers", (req, res) ->
  db.query "delete from users", (err) ->
    res.send {}

pg "/p", (req, res) ->
  req.session.poo = "gotta"
  res.send "that is all"

pg "/whoami", (req, res) ->
  res.send req.session
  
pg "/questions/:email", (req, res) ->
  db.query "select question from users where email = ?", [req.params.email], (err, result) ->
    if err then return res.send err, 500
    if result.length then return res.send result[0]
    res.send {error: err}, 400 

app.post "/listings", (req, res) ->
  db.insert "listings", req.body, (err) ->
    if err
      console.log "there was an error"  
      return res.send err.message
    else
      res.send {'yay': 1}
    
app.get "/listings", (req, res) ->
  db.query "select * from listings", (err, results) ->
   if err then return res.send {}, 500
   res.send results,
     "Cache-Control": "no-cache, must-revalidate"
     "Expires": "Sat, 26 Jul 1997 05:00:00 GMT"
  
userExists = (email, cb=->) ->
  db.query "select * from users where email = ?",
  [email], (err, result) ->
    if result?.length > 0
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
      db.query "select * from users where email = ? and question = ? and password = password(?)",
        [req.body.email, req.body.question, req.body.password],
        (err, results) ->
          if results.length is 0
            res.send {error: "wrong combo"}, 401
          else
            req.session.email = req.body.email
            res.send {} #200 ok
    else

      # just create the user
      #db.insert "users", req.body, (err) ->
      {email, question, password} = req.body
      db.query """
        insert into users (email, question, password)
        values
        (?, ?, password(?))
      """, [email, question, password], (err) ->
        req.session.email = req.body.email
        if err then return res.send {error: "couldn't create user"}, 500
        res.send {"message": "created user"} #200

  
  


exports.app = app

if (!module.parent) 
  app.listen config.server.port || 8001
  console.log("Express server listening on port %d", app.address().port)

