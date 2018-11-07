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

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
			
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

	let userSchema = new mongoose.Schema({
		password: String,
		email: String,
		boxes: [boxSchema],
		isAdmin: Boolean
	});

	let Box = mongoose.model('Box', boxSchema);
	let User = mongoose.model('User', userSchema);
	let Category = mongoose.model('Category', categorySchema);
	let Prestation = mongoose.model('Prestation', prestationSchema);
	let Contribution = mongoose.model('Contribution', contributionSchema);

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


	//test pour affichage coffrets
	let box1 = new Box({
		recipientName: "jj54",
		recipientEmail: "jj54@yahoo.fr",
		message: "Tiens jj54 le bro",
		isPaid: true
	});

	let box2 = new Box({
		recipientName: "PasGoélise",
		recipientEmail: "papinox@yahoo.fr",
		message: "Pas de chance",
		isPaid: false
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


	//profile
	app.get("/profile",function(req,res){
		//si connectedocker exec -i docker-node_mongo_1 mongo test --eval "db.dropDatabase()"
		if (req.session.email){
			//renvoie l'user
			User.findOne({ email: req.session.email},function(err,user){
				user.boxes = [];
				user.boxes.push(box1,box2);
				user.save(function(err){
					if (err)  return HandleError(err)
				});
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

	app.get("/box/:id", function (req,res) {
		if (req.session.email){
			
			User.findOne({email:req.session.email}, function (err, user){
				let box;
				let found=false;
				user.boxes.forEach(function(element) {
					if(element._id == req.params.id){
						box=element;
						found=true;
					}
				});
				if(found){
					res.render('box',{'connected':true,'box':box});
				}
			});

		} else {
			res.redirect('/');
		}
	});

	

	console.log('Connection à la bdd effectuée');

});

app.listen(port);