config = require './config.coffee'
Client = require('mysql').Client
_ = require "underscore"
require("drews-mixins") _
MySqlHelper = require("mysql-helper").MySqlHelper

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


express = require('express');
app = module.exports = express.createServer();
app.configure () ->
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

app.configure 'development', () ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 

app.configure 'production', () ->
  app.use(express.errorHandler()); 




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

app.post "/listings", (req, res) ->
  db.insert "listings", req.body, (err) ->
    if err then return res.send err.message
    res.send {'yay': 1}
    
app.get "/listings", (req, res) ->
  db.query "select * from listings", (err, results) ->
   if err then return res.send {}, 500
   res.send results
  



exports.app = app

if (!module.parent) 
  app.listen(8001);
  console.log("Express server listening on port %d", app.address().port);

