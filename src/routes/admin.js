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
        Category.findOne({
            _id: req.params.id
        }, function (err, cat) {
            /* let img="";
             if(req.body.image!=null)
                 img = "animateur.jpg";
                 else*/
            console.log(req.params.id);
            console.log(cat);
            let prest = new Prestation({
                title: req.body.title,
                description: req.body.description,
                image: "animateur.jpg",
                price: req.body.price,
                isVisible: true
            });

            cat.prestations.push(prest);
            cat.save();
            res.redirect('/');

        });
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