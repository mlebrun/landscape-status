var express = require('express');
var bodyParser = require('body-parser');
var db = require('bluebird').promisifyAll(require('pg'));
var app = express();

var port = process.env.PORT || 5000;
var conString = process.env.HEROKU_POSTGRESQL_YELLOW_URL || false;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var operations = {
  list: {
    query: 'SELECT * FROM landscapes',
    handler: getLandscapesHandler,
  },
  add: {
    query: 'INSERT INTO landscapes (name) VALUES ($1) ',
    handler: addLandscapeHandler,
  },
  remove: {
    query: 'DELETE FROM landscapes WHERE name = $1',
    handler: removeLandscapeHandler,
  },
  lock: {
    query: 'UPDATE landscapes SET locked_by = $2 WHERE name = $1',
    handler: lockLandscapeHandler,
  },
  unlock: {
    query: 'UPDATE landscapes SET locked_by = NULL WHERE name = $1',
    handler: unlockLandscapeHandler,
  }
};

function getLandscapesHandler(result) {
  if (!result.rows.length) {
    return 'No landscapes found';
  }

  landscapes = result.rows;

  for (var i = landscapes.length - 1; i >= 0; i--) {
    var row = landscapes[i];
    list += row.landscape + ': ' + (row.locked_by || 'unlocked') + "\n";
  }

  return list;
}

function addLandscapeHandler(result) { console.log(result); return 'Successful!'; }
function removeLandscapeHandler(result) { console.log(result); return 'Successful!'; }
function lockLandscapeHandler(result) { console.log(result); return 'Successful!'; }
function unlockLandscapeHandler(result) { console.log(result); return 'Successful!'; }

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.post('/', urlencodedParser, function (req, res) {

  console.log(req.body);

  var parsed = req.body.text.split(' '),
      command =  (!parsed || parsed.length < 2) ? 'list' : parsed[0],
      input = '',
      sql = '',
      params = [];

  if (!operations[ command ]) {
    return res.send('Action Unsupported');
  }

  sql = operations[ command ].query;
  handler = operations[ command ].handler;

  if (command !== 'list') {
    landscape = parsed[1];
    params.push(landscape);

    if (command === 'lock') {
      params.push(req.body.user_name);
    }
  }

  db.connectAsync(conString).spread(function(connection, release) {
    return connection.queryAsync(sql, params)
      .then(handler)
      .then(function(response_text) {
        res.send(response_text);
      })
      .finally(function() {
        release();
      });
  });
});

app.listen(port);

console.log( 'Running on' + port );