module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    let tri; //var pour le tri des prestations
    app.get("/newPrestation/:id", function (req, res) {
        if (req.session.email) {
            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user.isAdmin) {
                    res.render('newPrestation', {
                        connected: true
                    });
                } else {
                    res.redirect("/");
                }
            });
        }


    });

    app.post("/newPrestation/:id", function (req, res) {



        let validated = true;

        let saveDesc = "";
        let saveTitle = "";
        let savePrice = "";
        let descIsSet = true;
        let titleIsSet = true;
        let priceIsSet = true;
        let imageIsSet = true;




        if (!req.body.image) {
            validated = false;
            imageIsSet = false
        }

        console.log(req.body.image);

        if (!req.body.description) {
            validated = false;
            descIsSet = false
        } else {
            saveDesc = req.body.description
        }

        if (!req.body.price) {
            validated = false;
            priceIsSet = false
        } else {
            savePrice = req.body.price
        }

        if (!req.body.title) {
            validated = false;
            titleIsSet = false
        } else {
            saveTitle = req.body.title
        }

        if (validated) {

            console.log("test");

            Category.findOne({
                _id: req.params.id
            }, function (err, cat) {

                let prest = new Prestation({
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    price: req.body.price,
                    isVisible: true
                });

                cat.prestations.push(prest);
                cat.save();
                res.redirect('/');
            });
        } else {
            res.render('newPrestation', {
                "connected": true,

                "titleIsSet": !titleIsSet,
                "imageIsSet": !imageIsSet,
                "descIsSet": !descIsSet,
                "priceIsSet": !priceIsSet,

                "titleWarning": !titleIsSet,
                "priceWarning": !priceIsSet,
                "descWarning": !descIsSet,
                "imageWarning": !imageIsSet,

                "savePrice": savePrice,
                "saveTitle": saveTitle,
                "saveDesc": saveDesc
            });
        }
    });
    app.get("/deleteprest/:idcat/:idprest", function (req, res) {
        if (req.session.email) {
            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let pos;
                if (user.isAdmin) {
                    Category.findOne({
                        _id: req.params.idcat
                    }, function (err, cat) {
                        cat.prestations.forEach(function (prest) {
                            if (prest._id == req.params.idprest) {
                                pos = cat.prestations.indexOf(prest);
                            }
                        });
                        cat.prestations.splice(pos, 1);
                        cat.save();
                        res.redirect('/catalog/' + cat.title);
                    });

                }
            });

        }
    });

    app.get("/deleteprest/:idcat/:idprest", function (req, res) {
        if (req.session.email) {
            User.findOne({
                email: req.session.email
            }, function (err, user) {
                let pos;
                if (user.isAdmin) {
                    Category.findOne({
                        _id: req.params.idcat
                    }, function (err, cat) {
                        cat.prestations.forEach(function (prest) {
                            if (prest._id == req.params.idprest) {
                                pos = cat.prestations.indexOf(prest);
                            }
                        });
                        cat.prestations.splice(pos, 1);
                        cat.save();
                        res.redirect('/catalog/' + cat.title);
                    });

                }
            });

        }
    });
    app.get("/disabledprest/:idcat/:idprest", function (req, res) {
        if (req.session.email) {
            User.findOne({
                email: req.session.email
            }, function (err, user) {

                if (user.isAdmin) {
                    Category.findOne({
                        _id: req.params.idcat
                    }, function (err, cat) {
                        cat.prestations.forEach(function (prest) {
                            if (prest._id == req.params.idprest) {
                                if (prest.isVisible) {
                                    prest.isVisible = false;

                                } else {
                                    prest.isVisible = true;

                                }
                            }
                        });

                        cat.save();
                        res.redirect('/catalog/' + cat.title);
                    });

                }
            });

        }
    });
}