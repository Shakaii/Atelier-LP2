module.exports = function (app, Box, User, Category) {
    let bcrypt = require('bcryptjs');
    let validator = require('validator');
    let uuid4 = require('uuid/v4');

    let tri; //var pour le tri des prestations
    let currentBox;

    app.get('/signup', function (req, res) {
        if (req.session.email) {
            res.redirect('/catalog');
        } else {
            res.render('signup', {});
        }

    });

    app.get("/login", function (req, res) {
        if (req.session.email) {
            res.redirect('/catalog');
        } else {
            res.render('login', {});
        }

    });

    app.get("/logout", function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    app.get('/', function (req, res) {
        let connected = false;
        if (req.session.email) {
            connected = true;
            User.findOne({
                email: req.session.email
            }, function (err, user) {
                if (err) return handleError(err)
                user.boxes.forEach(function (element) {

                    if (element.isCurrent) {
                        currentBox = element.id;
                    }
                });
            });
        }
        res.redirect('/catalog');
    });

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
        if (req.body.mail.length > 5) {

            if (!validator.isEmail(req.body.mail)) {
                validated = false;
                emailIsValid = false;
            }

            User.findOne({
                email: req.body.mail
            }, function (err, user) {
                if (err) return handleError(err)
                if (user) {
                    validated = false;
                    emailIsNotInDb = false;
                }

            });
        } else {
            validate = false;
            emailIsSet = false
        }

        if (req.body.password.length > 1) {

        } else {
            passwordIsSet = false;
            validated = false;
        }

        //if lazy checking passed
        if (validated) {

            let salt = "salty";
            let passwordHashed;
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {

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
        } else {

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
                "saveEmail": saveEmail
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

        if (req.body.mail.length <= 5) {
            emailIsSet = false;
            validate = false;
        }
        if (req.body.password.length <= 1) {
            passwordIsSet = false;
            validate = false;
        }

        //if lazy checking passed
        if (validate) {

            User.findOne({
                email: req.body.mail
            }, function (err, user) {
                if (err) return handleError(err)
                //if user is found
                if (user) {
                    //if the passwords match
                    if (bcrypt.compare(req.body.password, user.password)) {
                        req.session.email = user.email;
                        res.redirect('/');
                    } else {
                        res.render('login', {
                            "connectionRefused": true,
                            "saveEmail": saveEmail
                        });
                    }
                } else {
                    res.render('login', {
                        "connectionRefused": true,
                        "saveEmail": saveEmail
                    });
                }
                //Only telling the user the connection is refused, not why to allow account guessing




            });
        } else {

            let passwordWarning = passwordIsSet;
            let emailWarning = emailIsSet;

            res.render('login', {
                "emailIsSet": !emailIsSet,
                "passwordIsSet": !passwordIsSet,
                "passwordWarning": !passwordWarning,
                "emailWarning": !emailWarning,
                "saveEmail": saveEmail
            });
        }
    });

    app.get("/catalog", function (req, res) {
        let connected = false;
        if (req.session.email) {
            connected = true;
        }
        Category.find(function (err, categories) {
            if (err) return console.error(err);
            res.render('catalog', {
                'categories': categories,
                'connected': connected
            });
        });

    });

    app.get("/addPrest/:idCat/:id", function (req, res) {
        User.findOne({
            email: req.session.email
        }, function (err, user) {
            user.boxes.forEach(function (element) {
                if (element.isCurrent) {
                    Category.findById(req.params.idCat, function (err, res) {
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
                if (element._id == req.params.idBox) {
                    let found = false;
                    element.prestations.forEach(function (prest) {
                        if (prest._id == req.params.id && !found) {
                            found = true;
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
            if (user.boxes.length > 0) {
                user.boxes.forEach(function (element) {
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
            }, {
                boxes: user.boxes
            }, function (err, doc) {
                currentBox = nBox.id;
                res.redirect('/');
            });
        });
    });

    app.get("/changeCurr/:id", function (req, res) {
        //getcurrent user
        User.findOne({
            email: req.session.email
        }, function (err, user) {
            if (err) return handleError(err)
            //reset every boxes to not current except the one that matches the id
            user.boxes.forEach(function (element) {
                element.isCurrent = false;
                if (element._id == req.params.id) {
                    element.isCurrent = true;
                }
            });
            user.save();
            currentBox = req.params.id;
            res.redirect('/profile');
        });
    });

    app.get("/catalog/:category", function (req, res) {
        let connected = false;
        if (req.session.email) {
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
                    if (tri) {
                        category.prestations.sort(function (a, b) {
                            return b.price - a.price
                        }); //+ vers -
                    } else {
                        category.prestations.sort(function (a, b) {
                            return a.price - b.price
                        });
                    } //- vers +

                    res.render('prestations', {
                        'categories': categories,
                        'category': category,
                        'prestations': category.prestations,
                        'connected': connected
                    });
                });
            });
    });

    app.get("/triPrest", function (req, res) {
        tri = !tri;
        res.redirect('back');
    });

    app.get("/catalog/:category/:prestation", function (req, res) {

        let connected = false;
        if (req.session.email) {
            connected = true;
        }

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
                        'prestation': prestation,
                        'connected': connected
                    });
                });

            } else {
                res.redirect('/catalog', {
                    "connected": connected
                });
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
                    'host': req.hostname
                });
            });
        }
        //sinon accueil
        else {
            res.redirect('/');
        }
    });

    app.get("/current", function (req, res) {
        if (currentBox) {
            res.redirect('/box/' + currentBox);
        } else {
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

            //lazy checking
            let validated = true;
            let passwordMatch = true;
            let passwordIsSet = true;

            if (req.body.password.length <= 1) {
                validated = false;
                passwordIsSet = false;
            }

            if (req.body.passwordCheck != req.body.password) {
                passwordMatch = false;
                validated = false;
            }

            if (validated) {

                user.password = req.body.password;

                user.save(function (err) {
                    if (err) return handleError(err)
                    res.redirect('/profile');
                });
            } else {
                res.render('modify', {
                    "passwordMatch": !passwordMatch,
                    "passwordIsSet": !passwordIsSet,
                    "passwordWarning": !passwordIsSet,
                })
            }



        });

    });

    app.get("/box/:id", function (req, res) {
        if (req.session.email) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let box;
                let found = false;
                user.boxes.forEach(function (element) {
                    if (element._id == req.params.id) {
                        box = element;
                        found = true;
                    }
                });
                if (found) {
                    res.render('box', {
                        'connected': true,
                        'box': box
                    });
                }
            });

        } else {
            res.redirect('/');
        }
    });

    app.get("/box/:id/suivi", function (req, res) {
        if (req.session.email) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let box;
                let found = false;
                user.boxes.forEach(function (element) {
                    if (element._id == req.params.id) {
                        box = element;
                        found = true;
                    }
                });
                if (found) {
                    res.render('suivi', {
                        'connected': true,
                        'box': box
                    });
                }
            });

        } else {
            res.redirect('/');
        }
    });


    app.get("/box/gift/:iduser/:id", function (req, res) {

        User.findById(req.params.iduser, function (err, user) {
            let box;
            let auj = new Date();
            let block = false;
            let found = false;
            user.boxes.forEach(function (element) {

                if (element.urlGift == req.params.id) {
                    box = element;
                    found = true;
                }
            });
            if (box.date > auj) {
                block = true;
            }
            if (found) {
                res.render('gift', {
                    'box': box,
                    'block': block,
                    'date': box.date
                });
            }



        });
    });


    app.get("/box/giftGenerate/:id", function (req, res) {
        if (req.session.email) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let box;
                let found = false;
                user.boxes.forEach(function (element) {
                    if (element._id == req.params.id) {
                        box = element;
                        found = true;
                        if (!box.urlGift) {
                            box.urlGift = uuid4();
                            //Date pour l'instant
                            box.date = new Date();
                        }
                    }
                });
                user.save();


                if (!found) {
                    res.redirect('/');
                } else
                    res.redirect('/profile');
            });

        }
    });

    app.get("/box/:boxId/:id", function (req, res) {
        if (req.session.email) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let box;
                let found = false;
                user.boxes.forEach(function (element) {
                    if (element._id == req.params.boxId) {
                        box = element;
                        found = true;
                    }
                });
                if (found) {
                    let prest;
                    let foundPrest = false;
                    box.prestations.forEach(function (element) {
                        if (element._id == req.params.id) {
                            prest = element;
                            foundPrest = true;
                        }
                    });
                    if (foundPrest) {
                        console.log(box);
                        res.render('profil_prestation', {
                            'connected': true,
                            'box': box,
                            'prestation': prest
                        });
                    }
                    //si on ne trouve pas la prest on redirige vers la boite (pour le rmPrest)
                    else {
                        res.render('box', {
                            'connected': true,
                            'box': box
                        });
                    }
                }
            });

        } else {
            res.redirect('/');
        }
    });


    app.get("/delete/:id", function (req, res) {
        User.findOne({
            email: req.session.email
        }, function (err, user) {
            let pos;
            let found = false;
            //on verifie si on supprime le coffret courant
            let curr = false;
            user.boxes.forEach(function (element) {
                if (element._id == req.params.id) {
                    pos = user.boxes.indexOf(element);
                    found = true;
                    curr = element.isCurrent;
                }
            });
            if (found) {
                user.boxes.splice(pos, 1);
                //si courant, on met par de faut le premier coffret en courant
                if (curr && user.boxes.length > 0) {
                    user.boxes[0].isCurrent = true;
                    currentBox = user.boxes[0].id;
                }
                if (user.boxes.length == 0) {
                    currentBox = null;
                }
                user.save();
            }
        });
        res.redirect('/profile');
    });
}