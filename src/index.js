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


  

/* GESTION DES GET */ 
app.get('/', function (req, res) {
	res.render('index', {});
});

app.get('/signin', function (req, res) {
	res.render('signin', {});
});

app.get("/login", function (req, res) {
    console.log(req.body.user.name)
});


/* GESTION DES POST */ 
app.post('/signup', function (req, res) {
	console.log(req.body.mail)
	console.log(req.body.pass)
});

app.post("/login", function (req, res) {
	console.log(req.body.mail)
	console.log(req.body.pass)
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

/*
	let user = new User({
		password: "geof",
		email: "geof.b@laposte.net",
	});

	user.boxes.push (new Box({
		recipientName: "geof",
		recipientEmail: "bern.geof@laposte.net",
		message: "joyeux anniversaire",
		isPaid: false,
		isOpened: false,
		isCurrent: false,
	}));


	user.save(function (err) {
		if (err) return handleError(err);  
	}); 

	User.find(function (err, users) {
		if (err) return console.error(err);
		console.log("LESUSERS");
		console.log(JSON.stringify(users));
	})
*/	 

	console.log('Connection à la bdd effectuée');

});












app.listen(port);

