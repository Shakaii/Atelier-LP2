let http = require('http');
let express = require('express');
let mongoose = require('mongoose');
let app = express();
let port = 80;
let mustacheExpress = require('mustache-express');
let uri = 'mongodb://mongo:27017/test';
let session = require('express-session')
let bcrypt = require('bcryptjs');
let validator = require('validator');
let uuid4 = require('uuid/v4');
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

let tri;//var pour le tri des prestations

/* GESTION DES GET */
app.get('/', function (req, res) {
	let connected = false;
	if (req.session.email) {
		connected = true;
	}
	res.redirect('/catalog');
}); 

app.get('/signup', function (req, res) {
	if (req.session.email){
		res.redirect('/catalog');
	}else{
		res.render('signup', {});
	}

});

app.get("/login", function (req, res) {
	if (req.session.email){
		res.redirect('/catalog');
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
		urlGift: String,
		urlFund: String,
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

		let validated = true;
		let passwordMatch = true;
		let emailIsNotInDb = true;
		let emailIsValid = true;
		let emailIsSet = true;
		let passwordIsSet = true;
		let saveEmail = false;

		if (req.body.mail) saveEmail = req.body.mail

		if (req.body.passwordCheck !== req.body.password) {
			validated = false;
			passwordMatch = false;
		}

		//check if mail is set then if it is valid and not already in DB
		if (req.body.mail.length > 5){

			if (!validator.isEmail(req.body.mail)){
				validated = false;
				emailIsValid = false;
			}

			User.findOne({
				email: req.body.mail
			}, function (err, user){
				if (err) return handleError(err)
				if (user){
					validated = false;
					emailIsNotInDb = false;
				}

			});
		}
		else{
			validate = false;
			emailIsSet = false
		}

		if (req.body.password.length > 1){

		}
		else{
			passwordIsSet = false;
			validated = false;
		}

		//if lazy checking passed
		if (validated){

			let salt = "salty";
			let passwordHashed;
			bcrypt.genSalt(10, function(err, salt) {
    			bcrypt.hash(req.body.password, salt, function(err, hash) {
					
					let user = new User({
						password: hash, 
						email: escape(req.body.mail)
					});
		
					user.save(function (err) {
						if (err) return handleError(err)
						req.session.email = user.email;
						res.redirect('/');
					});
				});	

    		}); 
		}
		else{

			let passwordWarning = passwordIsSet
			let checkWarning = passwordMatch
			let emailWarning = true;

			if (!emailIsNotInDb || !emailIsValid || !emailIsSet) emailWarning = false;
			
			res.render('signup', {
				"passwordMatch": !passwordMatch,
				"emailIsNotInDb": !emailIsNotInDb,
				"emailIsValid": !emailIsValid,
				"emailIsSet": !emailIsSet,
				"passwordIsSet": !passwordIsSet,
				"emailWarning": !emailWarning,
				"checkWarning": !checkWarning,
				"passwordWarning": !passwordWarning,
				"saveEmail" : saveEmail
			});
		}
			
	});

	//on login 
	app.post("/login", function (req, res) {

		let validate = true;
		let saveEmail = false;
		let emailIsSet = true;
		let passwordIsSet = true;

		if (req.body.mail) saveEmail = req.body.mail

		if (req.body.mail.length <= 5){
			emailIsSet = false;
			validate = false;
		}
		if (req.body.password.length <= 1){
			passwordIsSet = false;
			validate = false;
		}

		//if lazy checking passed
		if (validate){

			User.findOne({
				email: req.body.mail
			}, function (err, user) {
				if (err) return handleError(err)
					//if user is found
				if (user){
					//if the passwords match
					if (bcrypt.compare(req.body.password, user.password)) {
						req.session.email = user.email;
						res.redirect('/');
					}
					else {
						res.render('login', {
							"connectionRefused": true,
							"saveEmail" : saveEmail
						});
					}
				}
				else {
					res.render('login', {
						"connectionRefused": true,
						"saveEmail" : saveEmail
					});
				}
				//Only telling the user the connection is refused, not why to allow account guessing

				
				
				
			});
		}
		else {

			let passwordWarning = passwordIsSet;
			let emailWarning = emailIsSet;

			res.render('login', {
				"emailIsSet": !emailIsSet,
				"passwordIsSet": !passwordIsSet,
				"passwordWarning": !passwordWarning,
				"emailWarning": !emailWarning,
				"saveEmail" : saveEmail
			});
		}
	});



	//test pour affichage coffrets
	let box1 = new Box({
		recipientName: "jj54",
		recipientEmail: "jj54@yahoo.fr",
		message: "Tiens jj54 le bro",
		isPaid: true,
		isOpened: true
	});

	let box2 = new Box({
		recipientName: "PasGoélise",
		recipientEmail: "papinox@yahoo.fr",
		message: "Pas de chance",
		isPaid: false,
		isOpened : false
	});

	app.get("/catalog", function (req, res)  { 
		let connected = false;
		if (req.session.email){
			connected = true;
		}
		Category.find(function (err, categories) {
			if (err) return console.error(err);
			res.render('catalog', {'categories' : categories,'connected': connected}); 	
		});

	});

	/*
	app.get("/test", function (req, res) {

		Box.findOne({isCurrent:'true'}, function (err, box) {
			if (err) return console.error(err);
			console.log(box);
		});

	});*/

	app.get("/addPrest/:idCat/:id", function (req, res) {
		User.findOne({
			email: req.session.email
		}, function (err, user) {
			user.boxes.forEach(function (element) {
				if (element.isCurrent) {
					Category.findById(req.params.idCat, function(err, res) {
						element.prestations.push(res.prestations.id(req.params.id));
						user.save();
					});
				}
			});
		});
		res.redirect('back');
	});

	app.get("/rmPrest/:idBox/:id", function (req, res) {
		User.findOne({
			email: req.session.email
		}, function (err, user) {
			user.boxes.forEach(function (element) {
				if (element.id == req.params.idBox) {
					element.prestations.forEach(function(prest) {
						if(prest.id == req.params.id) {
							element.prestations.splice(element.prestations.indexOf(prest), 1);
							user.save();
						}
					});
				}
			});
		});
		res.redirect('back');
	});

	app.get("/newBox", function (req, res) {
		User.findOne({
			email: req.session.email
		}, function (err, user) {
			if (err) return handleError(err)
			if (user.boxes.length>0) {
				user.boxes.forEach(function(element) {
					element.isCurrent = false;
				});
				user.save();
			}
			let nBox = new Box({
				recipientName: '',
				recipientEmail: '',
				message: '',
				urlGift: '',
				urlFund: '',
				date: '',
				isPaid: 'false',
				isOpened: 'false',
				isCurrent: 'true',
				prestations: [],
				contributions: []
			});
			user.boxes.push(nBox)
			User.updateOne({
				email: req.session.email
			},{boxes: user.boxes}, function(err, doc) {
				res.redirect('/');
			});
		});
	});

	app.get("/changeCurr/:id", function(req,res){
		//getcurrent user
		User.findOne({
			email: req.session.email
		}, function (err, user) {
			if (err) return handleError(err)
			//reset every boxes to not current except the one that matches the id
			user.boxes.forEach(function(element) {
				element.isCurrent = false;
				if(element._id == req.params.id){
					element.isCurrent = true;
				}
			});
			user.save();
			res.redirect('/profile');
		});
	});

	app.get("/catalog/:category", function (req, res) {
		let connected = false;
		if (req.session.email){
			connected = true;
		}
		Category
			.findOne({
				title: req.params.category
			})
			.populate('prestations')
			.exec(function (err, category) {
				if (err) return console.error(err);
				Category.find(function (err, categories) {
					if (err) return console.error(err);
					if(tri) {
						category.prestations.sort(function(a, b){return b.price - a.price});//+ vers -
					} else {category.prestations.sort(function(a, b){return a.price - b.price});}//- vers +
					
					res.render('prestations', {
						'categories': categories,
						'category': category,
						'prestations': category.prestations,
						'connected': connected
					});
				});
			});
    }); 

	app.get("/triPrest", function(req, res){
		tri = !tri;
		res.redirect('back');
	});

	app.get("/catalog/:category/:prestation", function (req, res) {

		Category.findOne({
			title: req.params.category
		}, function (err, category) {
			if (err) return console.error(err);

			if (category) {

				let prestation = category.prestations.filter(function (prestation) {
					return prestation.title === req.params.prestation;
				}).pop();

				Category.find(function (err, categories) {
					if (err) return console.error(err);
					res.render('prestation', {
						'categories': categories,
						'category': category,
						'prestation': prestation
					});
				});

			} else {
				res.redirect('/catalog');
			}
		});
	});

 
	//profile
	app.get("/profile", function (req, res) {
		//si connectedocker exec -i docker-node_mongo_1 mongo test --eval "db.dropDatabase()"
		if (req.session.email) {
			//renvoie l'user
			User.findOne({
				email: req.session.email
			}, function (err, user) {
				res.render('profile', {
					'connected': true,
					'user': user,
					'host':req.hostname
				});
			});
		}
		//sinon accueil
		else {
			res.redirect('/');
		}
	});

	app.get("/profile/modify", function (req, res) {
		//si connecte
		if (req.session.email) {
			//renvoie l'user
			User.findOne({
				email: req.session.email
			}, function (err, user) {
				res.render('modify', {
					'connected': true,
					'user': user
				});
			});
		}
		//sinon accueil
		else {
			res.redirect('/');
		}
	});

	//modifying password in profile
	app.post("/profile/modify", function (req, res) {
		//get logged in user
		User.findOne({
			email: req.session.email
		}, function (err, user) {
			if (err) return handleError(err)

			//if the passwords match
			if (req.body.passwordCheck == req.body.password) {
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

	app.get("/box/:id/suivi", function (req,res) {
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
					res.render('suivi',{'connected':true,'box':box});
				}
			});

		} else {
			res.redirect('/');
		}
	});


	app.get("/box/gift/:iduser/:id", function (req,res) {
	
		User.findById(req.params.iduser, function (err, user){
			let box;
			let auj = new Date();
			let block=false;
			let found=false;
			console.log(user);
			user.boxes.forEach(function(element) {
				
				if(element.urlGift == req.params.id){
					box=element;
					found=true;
				}
			});
			if( box.date<= auj){
				block = true;
			}
			if(found){
				res.render('gift',{'box':box,'block':block,'date':box.date});
			}
			
					
			
			});
		});
	
	
	app.get("/box/giftGenerate/:id", function(req,res){
		if (req.session.email){

			User.findOne({email:req.session.email}, function (err, user){
				let box;
				let found=false;
				user.boxes.forEach(function(element) {
					if(element._id == req.params.id){
						box=element;
						found=true;
						if(!box.urlGift){
							box.urlGift=uuid4();
							//Date pour l'instant
							box.date = new Date();
						}
					}
				});
				user.save();
			

				if(!found){
					res.redirect('/');
				} else
				res.redirect('/profile');
			});

		}
	});


	app.get("/delete/:id", function (req,res) {
		User.findOne({email:req.session.email}, function (err, user){
			let pos;
			let found=false;
			//on verifie si on supprime le coffret courant
			let curr=false;
			user.boxes.forEach(function(element) {
				if(element._id == req.params.id){
					pos=user.boxes.indexOf(element);
					found=true;
					curr=element.isCurrent;
				}
			});
			if(found){
				user.boxes.splice(pos,1);
				//si courant, on met par de faut le premier coffret en courant
				if(curr){
					user.boxes[0].isCurrent=true;
				}
				user.save();
			}
		});
		res.redirect('/profile');
	});


	console.log('Connection à la bdd effectuée');

});

app.listen(port);