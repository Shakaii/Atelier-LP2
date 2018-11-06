let http = require('http');
let express = require('express');
let mongoose = require('mongoose');




let app = express();
let port = 80;

let mustacheExpress = require('mustache-express');

let uri = 'mongodb://mongo:27017/test';
mongoose.connect(uri)

// Register '.mustache' extension with The Mustache Express
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
  res.render('index', {
    locals: {
      title: 'Welcome'
    }
  });
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	let UserSchema = new mongoose.Schema({
		username: String,
		password: String,
		email: String,
		boxes: Array
	});
	
	let CategorySchema = new mongoose.Schema({
		title: String,
		prestations: Array
	});

	let PrestationSchema = new mongoose.Schema({
		title: String,
		description: String,
		image: String,
		price: Number,
		isVisible: Boolean
	})

	let BoxSchema = new mongoose.Schema({
		recipientName: String,
		recipientEmail: String,
		message: String,
		urlGift: Number,
		urlFund: Boolean,
		date: Date,
		isPaid: Boolean,
		isOpened: Boolean,
		isCurrent: Boolean,
		prestations: Array,
		contributions: Array
	})

	let ContributionSchema = new mongoose.Schema({
		name: String, 
		Amount: Number,
		message: String
	})
	
	let Box = mongoose.model('Box', BoxSchema);
	let User = mongoose.model('User', UserSchema);
	let Category = mongoose.model('Category', CategorySchema);
	let Prestation = mongoose.model('prestation', PrestationSchema);
	let Contribution = mongoose.model('Contribution', ContributionSchema);
	
	

	console.log("is okay");
	
});












app.listen(port);

/*
var server = http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.write('<a href="https://mongodb.github.io/node-mongodb-native/api-articles/nodekoarticle1.html">To learn some mongoDB with NodeJS</a></br>');
  res.write('<a href="https://www.npmjs.com/package/mustache">To learn some mustache template</a></br>');
  res.write('<a href="https://expressjs.com/fr/guide/routing.html">Learn a bit of express for routing</a></br>');
  res.write('<a href="http://docs.sequelizejs.com/manual/installation/getting-started">Using sequelize if needed</a></br>');
  res.end('<a href="https://mongoosejs.com/">An ORM for MongoDB</a></br>');
  var MongoClient = require('mongodb').MongoClient;

	var uri = "mongodb+srv://Shakai:Eu8tsS8k6cupaJ2P@cluster0-lbc8c.gcp.mongodb.net/test?retryWrites=true";
	MongoClient.connect(uri, function(err, client) {
	   const collection = client.db("test").collection("devices");
	   // perform actions on the collection object
	   var doc1 = {'hello':'doc1'};
	   collection.insert(doc1);
	   client.close();
	});

});
server.listen(80);
*/



//Eu8tsS8k6cupaJ2P