var express = require('express');
var app = express();
var pg = require('pg');

var port = process.env.PORT || 5000;
var conString = process.env.HEROKU_POSTGRESQL_YELLOW_URL || false;

app.post('/', function (req, res) {

  console.log(req.query);

  pg.connect(conString, function(err, client, done) {
    if(err) {
      return res.send('Error fetching client from pool');
    }

    client.query('SELECT * FROM landscapes', [], function(err, result) {
      done(); // call `done()` to release the client back to the pool
      client.end();

      var list = '',
          landscapes;

      if(err) {
        return res.send('There was an error running your query');
      }

      if (!result.rows.length) {
        return res.send('No landscapes found');
      }

      landscapes = result.rows;

      for (var i = landscapes.length - 1; i >= 0; i--) {
        var row = landscapes[i];
        list += row.landscape + ': ' + (row.locked_by || 'unlocked') + "\n";
      }

      return res.send(list);
    });
  });
});

app.listen(port);

console.log( 'Running on' + port );