let http = require('http');
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

app.use(session({ secret: "secret"}));
  
/* GESTION DES GET */ 
app.get('/', function (req, res) {
	let connected = false;
	if (req.session.email){
		connected = true;
	}
	res.render('index', {connected: connected});
}); 

app.get('/signup', function (req, res) {
	if (req.session.email){
		res.redirect('/');
	}else{
		res.render('signup', {});
	}
	
});

app.get("/login", function (req, res) {
	if (req.session.email){
		res.redirect('/');
	}
	else{
		res.render('login', {});
	}
	
});

app.get("/logout", function (req, res) {
	req.session.destroy();
	res.redirect('/');
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
		
	let userSchema = new mongoose.Schema({
		password: String,
		email: String,
		boxes: Array,
		isAdmin: Boolean
	});
		
	let prestationSchema = new mongoose.Schema({
		title: String,
		description: String,
		image: String,
		price: Number,
		isVisible: Boolean
	})
			
	let categorySchema = new mongoose.Schema({
		title: String,
		image: String,
		prestations: [prestationSchema]
	});
		
	let contributionSchema = new mongoose.Schema({
		name: String, 
		Amount: Number,
		message: String
	})
		
	let boxSchema = new mongoose.Schema({
		recipientName: String,
		recipientEmail: String,
		message: String,
		urlGift: Number,
		urlFund: Boolean,
		date: Date,
		isPaid: Boolean,
		isOpened: Boolean,
		isCurrent: Boolean,
		prestations: [prestationSchema],
		contributions: [contributionSchema]
	})

	let Box = mongoose.model('Box', boxSchema);
	let User = mongoose.model('User', userSchema);
	let Category = mongoose.model('Category', categorySchema);
	let Prestation = mongoose.model('Prestation', prestationSchema);
	let Contribution = mongoose.model('Contribution', contributionSchema);


	let cat = new Category({
		title: "resto",
		image: "resto.png"
	})

	let prest = new Prestation({

		title: "Au bon feu",
		description: "Un resto... comme les autres",
		image: "feu.png",
		price: 5,
		isVisible: true
	})

	cat.prestations.push(prest);

	cat.save(function (err) {
		if (err) return handleError(err) 
	});  

	
 
	//on signup
	app.post('/signup', function (req, res) { 

		//if the password matches the check 
		if (req.body.passwordCheck == req.body.password){

			let user = new User({
				password: req.body.password,
				email: req.body.mail
			});

			user.save(function (err) {
				if (err) return handleError(err) 
				req.session.email = user.email;
				res.redirect('/');
			}); 
		}
	}); 
 
	//on login 
	app.post("/login", function (req, res) {
		
		User.findOne({ email: req.body.mail }, function(err, user){
			if (err) return handleError(err)

			//if the passwords match
			if (req.body.password == user.password ){
				req.session.email = user.email;
				res.redirect('/');
			}
		});  
	});

	app.get("/catalog", function (req, res)  { 

		Category.find(function (err, categories) {
			if (err) return console.error(err);
			res.render('catalog', {'categories' : categories});
		});
	
	});

	app.get("/catalog/:category", function (req, res) {

		Category
		.findOne({ title: req.params.category})
		.populate('prestations')
		.exec(function (err, category){
			if (err) return console.error(err);
			Category.find(function (err, categories) {
				if (err) return console.error(err);
				console.log(category);
				res.render('prestations', {'categories' : categories, 'category' : category, 'prestations' : category.prestations});
			});
		}); 

	});
	   
	app.get("/catalog/:category/:prestation", function (req, res) {

		Category.findOne({ title: req.params.category},function (err, category) {
			if (err) return console.error(err);

			if (category){

				let prestation = category.prestations.filter(function (prestation) {
					return prestation.title === req.params.prestation;
				}).pop();

				Category.find(function (err, categories) {
					if (err) return console.error(err);
					res.render('prestation', {'categories' : categories, 'category' : category, 'prestation' : prestation});
				});
					
			}
			else{
				res.redirect('/catalog');
			}
		}); 
	});



	console.log('Connection à la bdd effectuée');

});












app.listen(port);

