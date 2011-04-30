var Client, MySqlHelper, app, client, config, db, express, _;
config = require('./config.coffee');
Client = require('mysql').Client;
client = new Client;
_ = require("underscore");
require("drews-mixins")(_);
MySqlHelper = require("mysql-helper").MySqlHelper;
db = new MySqlHelper(client);
client.host = 'drew.the.tl';
client.user = config.user;
client.password = config.password;
client.connect();
client.query("Use " + config.db + ";");
express = require('express');
app = module.exports = express.createServer();
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  return app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  return app.use(express.errorHandler());
});
app.get('/', function(req, res) {
  return res.sendfile("index.html");
});
app.post('/', function(req, res) {
  res.send(req.param("address"));
  client.query("INSERT INTO listings     (address, notes, lat, lng)   values (?, ?, ?, ?)", [req.param("address"), req.param("notes"), req.param("lat"), req.param("lng")]);
  return res.send("thanks");
});
app.get("/drew", function(req, res) {
  return res.send("aguzate, hazte valer");
});
app.post("/cleanUpTestDb", function(req, res) {
  return db.query("delete from listings where address = '1465 E. Halifax St, Mesa, AZ 85203'", function(err) {
    if (err) {
      return res.send(err);
    }
    return res.send("success");
  });
});
app.post("/listings", function(req, res) {
  console.log(req);
  return db.insert("listings", req.body, function(err) {
    if (err) {
      return res.send(err.message);
    }
    return res.send({
      'yay': 1
    });
  });
});
app.get("/listings", function(req, res) {
  db.query("select * from listings", function(err, results) {
    if (err) {
      return res.send({});
    }
    return res.send(results);
  });
  return;
  return res.send([
    {
      address: "gilbert, az",
      notes: "you win",
      lat: 33.4340894,
      lng: -111.6356991
    }, {
      address: "Lehi, AZ",
      notes: "you loose",
      lat: 34.4340894,
      lng: -111.6356991
    }
  ]);
});
console.log("test");
exports.app = app;
if (!module.parent) {
  app.listen(8001);
  console.log("Express server listening on port %d", app.address().port);
}