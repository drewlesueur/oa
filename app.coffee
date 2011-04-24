config = require './config.coffee'
Client = require('mysql').Client
client = new Client

console.log config
client.host = 'drew.the.tl'
client.user = config.user
client.password = config.password
client.connect()

  client.query("Use #{config.db};")



# * Module dependencies.


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


app.post "/listings", (req, res) ->
  


app.get "/listings", (req, res) ->
  res.send [
    address: "gilbert, az"
    notes: "you win"
    lat: 33.4340894
    lng: -111.6356991
  ,
    address: "Lehi, AZ"
    notes: "you loose"
    lat: 34.4340894
    lng: -111.6356991 
  ]

  



console.log "test"
exports.app = app

if (!module.parent) 
  app.listen(8001);
  console.log("Express server listening on port %d", app.address().port);

