module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    var sanitizer = require('sanitizer');
    let tri; //var pour le tri des prestations
    app.get("/validate/:id", function (req, res) {
        if (!req.session.email) {
            res.redirect('/catalog');
        } else {


            User.findOne({
                email: req.session.email
            }, function (err, user) {

                let nbCateg = 0;

                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();



                    Category.find(function (err, categories) {



                        //pour chaques catégories
                        for (let indexCateg = 0; indexCateg < categories.length; indexCateg++) {

                            let isInCateg = false;

                            //pour chaques prestations de la box
                            for (let indexPrest = 0; indexPrest < box.prestations.length; indexPrest++) {

                                //pour chaques prest je check si elle existe dans la categ
                                let presta = categories[indexCateg].prestations.filter(function (presta) {
                                    return presta.id === box.prestations[indexPrest].id
                                }).pop();

                                if (presta) {
                                    isInCateg = true
                                }
                            }
                            if (isInCateg == true) {
                                nbCateg++;
                            }

                            if (indexCateg == categories.length - 1) {
                                if (box.prestations.length >= 2 && nbCateg >= 2) {
                                    res.render('validate', {
                                        connected: true
                                    });
                                } else {
                                    res.render('profile', {
                                        'connected': true,
                                        'user': user,
                                        'host': req.hostname,
                                        'validationRefused': true
                                    });
                                }
                            }

                        }
                    })




                };
            });



        }
    });

    app.post("/validate/:id", function (req, res) {

        let validated = true;
        let dateIsSet = true;
        let messageIsSet = true;
        let nameIsSet = true;
        let saveName = '';
        let saveDate = "";
        let saveMessage = "";

        if (!req.body.name.length) {
            validated = false;
            nameIsSet = false;
        } else {
            saveName = req.body.name
        }

        if (!req.body.dateouverture.length) {
            validated = false;
            dateIsSet = false;
        } else {
            saveDate = req.body.dateouverture
        }

        if (!req.body.message.length) {
            validated = false;
            messageIsSet = false;
        } else {
            saveMessage = req.body.message
        }

        //if okay just set the box as Paid
        if (validated) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    box.recipientName = sanitizer.escape(req.body.name);
                    box.message = sanitizer.escape(req.body.message);
                    box.date = sanitizer.escape(req.body.dateouverture);

                    if (req.body.paiement == "c") {
                        box.urlFund = box.id + "/" + user.id
                    }

                    user.save();

                    res.redirect('/profile/')
                };
            });
        } else { //else resend the view

            res.render('validate', {
                "dateIsSet": !dateIsSet,
                "nameIsSet": !nameIsSet,
                "messageIsSet": !messageIsSet,
                "dateWarning": !dateIsSet,
                "nameWarning": !nameIsSet,
                "messageWarning": !messageIsSet,
                "saveDate": saveDate,
                "saveName": saveName,
                "saveMessage": saveMessage
            })

        }
    });

    app.get("/validation/:id", function (req, res) {
        if (!req.session.email) {
            res.redirect('/catalog');
        } else {
            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    let priceTotal = 0;
                    let index = 0;
                    for (index = 0; index < box.prestations.length; index++) {
                        priceTotal += box.prestations[index].price;
                    }

                    res.render('validation', {
                        "connected": true,
                        "price": priceTotal,
                        "box": box
                    });

                }
            });

        }
    });

    app.post("/validation/:id", function (req, res) {

        let validated = true;
        let numberIsSet = true;
        let dateIsSet = true;
        let cryptIsSet = true;
        let nameIsSet = true;
        let saveNumber = "";
        let saveName = "";
        let saveCrypt = "";
        let saveDate = ""

        if (!req.body.numcarte) {
            validated = false;
            numberIsSet = false
        } else {
            saveNumber = req.body.numcarte
        }

        if (!req.body.name) {
            validated = false;
            nameIsSet = false
        } else {
            saveName = req.body.name
        }

        if (!req.body.dateexpi) {
            validated = false;
            dateIsSet = false
        } else {
            saveDate = req.body.dateexpi
        }

        if (!req.body.crypt) {
            validated = false;
            cryptIsSet = false
        } else {
            saveCrypt = req.body.crypt
        }

        //if okay just set the box as Paid
        if (validated) {

            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    box.isPaid = true;

                    user.save();

                    res.redirect('/profile/')
                };
            });
        } else { //else resend the view

            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    let priceTotal = 0;
                    let index = 0;
                    for (index = 0; index < box.prestations.length; index++) {
                        priceTotal += box.prestations[index].price;
                    }
                }
            });

            res.render('validation', {
                "numberIsSet": !numberIsSet,
                "dateIsSet": !dateIsSet,
                "cryptIsSet": !cryptIsSet,
                "nameIsSet": !nameIsSet,
                "numberWarning": !numberIsSet,
                "dateWarning": !dateIsSet,
                "cryptWarning": !cryptIsSet,
                "nameWarning": !nameIsSet,
                "saveNumber": saveNumber,
                "saveCrypt": saveCrypt,
                "saveName": saveName,
                "saveDate": saveDate,
                "price": priceTotal,
                "box": box
            })

        }
    });
}