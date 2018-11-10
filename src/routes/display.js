module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    let tri; //var pour le tri des prestations
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

    app.get("/catalog/:category", function (req, res) {

        let connected = false;
        if (req.session.email) {
            User.findOne({
                email: req.session.email
            }, function (err, user) {
                req.session.isAdmin = user.isAdmin;
            });
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
                        'connected': connected,
                        'admin': req.session.isAdmin
                    });

                });
            });
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

    app.get("/triPrest", function (req, res) {
        tri = !tri;
        res.redirect('back');
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
            req.session.currentBox = req.params.id;
            res.redirect('/profile');
        });
    });

    app.get("/current", function (req, res) {
        if (req.session.currentBox) {
            res.redirect('/box/' + req.session.currentBox);
        } else {
            res.redirect('/');
        }

    });
}