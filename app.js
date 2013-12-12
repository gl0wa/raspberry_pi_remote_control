var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);
var sys = require('sys');

var FFI = require("node-ffi");
var libc = new FFI.Library(null, {
  "system": ["int32", ["string"]]
});



var run = libc.system;
 
run("sudo echo '17' > /sys/class/gpio/export");
run("sudo echo 'out' > /sys/class/gpio/gpio17/direction");

var actions = {
  lampOn: function(){
    run("sudo echo '0' > /sys/class/gpio/gpio17/value");
  },
  lampOff: function(){
    run("sudo echo '1' > /sys/class/gpio/gpio17/value");
  }
};

app.get('/remote_actions', function(req, res){
  var action = req.query["action"];
  console.log('got action: ' + action);

  if(actions[action]){
    actions[action]();
  } else {
    console.log('action: ' + action + ' does not exist');
  }
  res.send('ok');
});

var fs = require('fs');

app.get('/', function(req, res){
  var remoteLayout = null;
  //probably stupid way to serve static file
  fs.readFile('remote.html', function(err, data) {
      if(!err) {
          remoteLayout = data;
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Length', remoteLayout.length);
          res.end(remoteLayout);
      } else {
        res.send('Error!');
      }
  });
});

server.listen(1234);
