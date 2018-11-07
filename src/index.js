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

let path = require('path');
app.use(express.static(path.join(__dirname+'/public')));


app.use(session({ secret: "secret"}));

  

/* GESTION DES GET */ 
app.get('/', function (req, res) {
	let connected = false;
	if (req.session.email){
		connected = true;
	}
	res.render('index', {'connected': connected});
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
		boxes: Array,
		isAdmin: Boolean
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

	//profile
	app.get("/profile",function(req,res){
		//si connecte
		if (req.session.email){
			//renvoie l'user
			User.findOne({ email: req.session.email},function(err,user){
				res.render('profile',{'connected': true, 'user':user});
			});
		}
		//sinon accueil
		else{
			res.redirect('/');
		}
	});

	app.get("/profile/modify",function(req,res){
		//si connecte
		if (req.session.email){
			//renvoie l'user
			User.findOne({ email: req.session.email},function(err,user){
				res.render('modify',{'connected': true, 'user':user});
			});
		}
		//sinon accueil
		else{
			res.redirect('/');
		}
	});

	//modifying password in profile
	app.post("/profile/modify", function (req, res) {
		
		console.log(req.body.password);
		//get logged in user
		User.findOne({email: req.session.email }, function(err, user){
			if (err) return handleError(err)

			//if the passwords match
			if (req.body.passwordCheck == req.body.password){
				user.password = req.body.password;
			}
			
			user.save(function (err) {
				if (err) return handleError(err) 
				res.redirect('/profile');
			});
			
		});

	});


	console.log('Connection à la bdd effectuée');

});

app.listen(port);
