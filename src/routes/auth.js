module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    let bcrypt = require('bcryptjs');
    let validator = require('validator');
    var sanitizer = require('sanitizer');
    let tri; //var pour le tri des prestation
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
        if (req.body.mail.length > 4) {

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
                        email: sanitizer.escape(req.body.mail),
                        isAdmin: false
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
                    bcrypt.compare(req.body.password, user.password).then(function (result) {
                        //if the passwords match
                        if (result) {
                            req.session.email = user.email;
                            res.redirect('/');
                        } else {
                            res.render('login', {
                                "connectionRefused": true,
                                "saveEmail": saveEmail
                            });
                        }
                    });
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
}