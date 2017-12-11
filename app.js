const express = require ('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require ('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

let client = redis.createClient();
client.on('connect', function(){
  console.log('Connected to Redis ...');
});

const port = 3000;

const app = express();

app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(methodOverride('_method'));

app.get('/', function(req, res, next){
  res.render('searchclients');
});

app.get('/client/add', function(req, res, next){
  res.render('addclient');
});

app.post('/client/add', function(req, res, next){
    let id = req.body.id;
    let first_name= req.body.first_name;
    let last_name= req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
      'first_name', first_name,
      'last_name', last_name,
      'email', email,
      'phone', phone
    ], function( err, reply){
      if (err){
        console.log(err);
      }
      console.log(reply);
      res.redirect('/');
    }
  );
});

app.delete('/client/delete/:id', function(req, res, next){
  client.del(req.params.id);
  res.redirect('/');
});

app.post('/client/search', function(req, res, next){
  let id = req.body.id;
  console.log(id);
  client.hgetall(id, function(err, obj){
    if (obj){
      obj.id = id;
      res.render('clientdetails', {
        client: obj
      });
    }else{
      res.render('searchclients', {
        error :'Client id was not found'
      });
    }
  });
});

app.listen(port, function(){
  console.log('Server started on port :' + port);
});
