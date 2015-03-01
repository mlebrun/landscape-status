var express = require('express');
var bodyParser = require('body-parser');
var db = require('bluebird').promisifyAll(require('pg'));
var app = express();

var port = process.env.PORT || 5000;
var connection_url = process.env.DATABASE_URL || '';

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var operations = {
  list: {
    query: 'SELECT * FROM landscapes',
    handler: listHandler,
  },
  add: {
    query: 'INSERT INTO landscapes (name) VALUES ($1) ',
    handler: operationHandler,
  },
  remove: {
    query: 'DELETE FROM landscapes WHERE name = $1',
    handler: operationHandler,
  },
  lock: {
    query: 'UPDATE landscapes SET locked_by = $2 WHERE name = $1',
    handler: operationHandler,
  },
  unlock: {
    query: 'UPDATE landscapes SET locked_by = NULL WHERE name = $1',
    handler: operationHandler,
  }
};

function listHandler(result) {
  if (!result.rows.length) {
    return 'No landscapes found';
  }

  var list = "Landscapes:\n\n";

  landscapes = result.rows;

  for (var i = landscapes.length - 1; i >= 0; i--) {
    var landscape = landscapes[i];
    list += landscape.name + ': ' + (landscape.locked_by || 'unlocked') + "\n";
  }

  return list;
}

function operationHandler(result) {
  if (result.rowCount) {
    return 'Successful!';
  }

  return 'Something went wrong!';
}

app.post('/', urlencodedParser, function (req, res) {

  // parsing `text` for args
  var parsed = req.body.text.split(' '),
      command = (!parsed || parsed.length < 2) ? 'list' : parsed[0],
      input = '',
      sql = '',
      params = [];

  // no command, no fun for you!
  if (!operations[ command ]) {
    return res.send('Action Unsupported');
  }

  // get query/handler from operations map
  sql = operations[ command ].query;
  handler = operations[ command ].handler;

  // determine landscape and parameters if necessary
  if (command !== 'list') {
    landscape = parsed[1];
    params.push(landscape);

    if (command === 'lock') {
      params.push(req.body.user_name);
    }
  }

  // execute query and handler
  db.connectAsync(connection_url).spread(function(connection, release) {
    return connection.queryAsync(sql, params)
      .then(handler)
      .then(function(response_text) {
        res.send(response_text);
      })
      .catch(function(e) {
        res.send(e.name + ': ' + e.message);
      })
      .finally(function() {
        release();
      });
  });
});

app.listen(port);

console.log( 'Running on' + port );
