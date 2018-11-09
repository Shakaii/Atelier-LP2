let express = require('express');
let mongoose = require('mongoose');
let app = express();

let port = 80;
let mustacheExpress = require('mustache-express');
let uri = 'mongodb://mongo:27017/test';
let session = require('express-session')
mongoose.connect(uri);
app.engine('mustache', mustacheExpress()); 
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
	extended: true  
}));
app.use(bodyParser.json());

let path = require('path');
app.use(express.static(path.join(__dirname + '/public')));

app.use(session({ secret: "secret", cookie: { maxAge: 7200000 }}));

require('./models/dbModel')(mongoose, app);

app.listen(port);  