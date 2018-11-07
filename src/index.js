let http = require('http');
let express = require('express');
let mongoose = require('mongoose');
let app = express();
let port = 80;
let mustacheExpress = require('mustache-express');
let uri = 'mongodb://mongo:27017/test';
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
app.use(express.static(path.join(__dirname+'/public')));

  

/* GESTION DES GET */ 
app.get('/', function (req, res) {
	res.render('index', {});
});

app.get('/signup', function (req, res) {
	res.render('signup', {});
});

app.get("/login", function (req, res) {
	res.render('login', {});
});

app.get("/catalogue", function (req, res) {
  res.render('catalogue', {});
});

app.get("/catalogue/:categorie", function (req, res) {
  res.render('listePrestations', {'cat':req.params.categorie});
});

app.get("/catalogue/:categorie/:prestation", function (req, res) {
  res.render('prestation', {'prest':req.params.prestation, 'cat':req.params.categorie});
});


		 
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
		
	let UserSchema = new mongoose.Schema({
		password: String,
		email: String,
		boxes: Array
	});
		
	let PrestationSchema = new mongoose.Schema({
		title: String,
		description: String,
		image: String,
		price: Number,
		isVisible: Boolean
	})
			
	let CategorySchema = new mongoose.Schema({
		title: String,
		prestations: [PrestationSchema]
	});
		
	let ContributionSchema = new mongoose.Schema({
		name: String, 
		Amount: Number,
		message: String
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
		prestations: [PrestationSchema],
		contributions: [ContributionSchema]
	})

	let Box = mongoose.model('Box', BoxSchema);
	let User = mongoose.model('User', UserSchema);
	let Category = mongoose.model('Category', CategorySchema);
	let Prestation = mongoose.model('Prestation', PrestationSchema);
	let Contribution = mongoose.model('Contribution', ContributionSchema);

	/* GESTION DES POST */ 
	app.post('/signup', function (req, res) { 

		console.log("ok");

		let user = new User({
			password: req.body.pass,
			email: req.body.mail
		});

		user.save(function (err) {
			if (err) return handleError(err);  
			console.log("inscrit")
		}); 
		//res.render('index', {});
	});
 
	app.post("/login", function (req, res) {
		
		User.findOne({ email: req.body.mail }, function(err, user){

			if (req.body.pass == user.password){
				console.log("connecté")
			}
		});
		//res.render('index', {});
	});


	console.log('Connection à la bdd effectuée');

});












app.listen(port);

