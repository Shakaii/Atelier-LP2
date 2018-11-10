let express = require('express');
let mongoose = require('mongoose');
let mustacheExpress = require('mustache-express');
let session = require('express-session');
const bodyParser = require("body-parser");

let app = express();
let port = 80;
let uri = 'mongodb://mongo:27017/test'; 

app.use(bodyParser.urlencoded({
	extended: true  
}));
 
mongoose.connect(uri);

app.engine('mustache', mustacheExpress()); 
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());

let path = require('path');
app.use(express.static(path.join(__dirname + '/public')));

app.use(session({ secret: "secret", cookie: { maxAge: 7200000 }}));

require('./models/dbModel')(mongoose, app);

app.listen(port);  