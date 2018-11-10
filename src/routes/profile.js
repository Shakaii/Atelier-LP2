module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    let bcrypt = require('bcryptjs');
    let tri; //var pour le tri des prestations
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

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        user.password = hash;
                        user.save(function (err) {
                            if (err) return handleError(err)
                            res.redirect('/profile');
                        });
                    });
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
}