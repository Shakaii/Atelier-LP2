module.exports = function (app, Box, User, Category, Contribution, Prestation, currentBox) {
    var sanitizer = require('sanitizer');
    let uuid4 = require('uuid/v4');
    let tri; //var pour le tri des prestations
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
                req.session.currentBox = nBox.id;
                res.redirect('/');
            });
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
                box.isOpened=true;
                user.save();
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
                    req.session.currentBox = user.boxes[0].id;
                }
                if (user.boxes.length == 0) {
                    req.session.currentBox = null;
                }
                user.save();
            }
        });
        res.redirect('/profile');
    });

    app.get("/box/pot/:id/:userId", function (req, res) {

        User.findOne({"_id" : req.params.userId}, function (err, user){

            if (user) {

                let box = user.boxes.filter(function (box) {
                    return box.id === req.params.id;
                }).pop();

                let priceTotal = 0;
                let paid = 0;
                let index = 0;
                for (index = 0; index < box.prestations.length; index ++){
                    priceTotal += box.prestations[index].price;
                }
                for (index = 0; index < box.contributions.length; index ++){
                    paid += Number(box.contributions[index].amount);
                }

                res.render('pot', {
                    "box" : box,
                    "paid" : paid,
                    "price" : priceTotal
                });
            }
            else res.redirect('/catalog');
        });
    });

    app.post("/box/pot/:id/:userId", function (req, res) {
        
        let validated = true;
        let messageIsSet = true;
        let amountIsSet = true;
        let nameIsSet = true;
        let saveAmount = "";
        let saveName = "";
        let saveMessage = "";
        let saveCrypt = "";
        let saveDate = "";
        let saveNumber = "";
        let numberIsSet = true;
        let dateIsSet = true;
        let cryptIsSet = true;
        

        
    
        if(!req.body.message){
            validated = false;
            messageIsSet = false
        }
        else{
            saveMessage = req.body.message
        }
    
        if(!req.body.name){
            validated = false;
            nameIsSet = false
        }
        else{
            saveName = req.body.name
        }
    
        if(!req.body.amount){
            validated = false;
            amountIsSet = false
        }
        else{
            saveAmount = req.body.amount
        }

        if(!req.body.numcarte){
            validated = false;
            numberIsSet = false
        }
        else{
            saveNumber = req.body.numcarte
        }
    
        if(!req.body.dateexpi){
            validated = false;
            dateIsSet = false
        }
        else{
            saveDate = req.body.dateexpi
        }
    
        if(!req.body.crypt){
            validated = false;
            cryptIsSet = false
        }
        else{
            saveCrypt = req.body.crypt
        }
    
        //if okay just set the box as Paid
        if (validated){
            
            User.findOne({"_id" : req.params.userId}, function (err, user){
        
                if (user) {

                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    let contrib = new Contribution({
                        "name": sanitizer.escape(req.body.name),
                        "message": sanitizer.escape(req.body.message),
                        "amount" : sanitizer.escape(req.body.amount)
                    });           

                    box.contributions.push(contrib);

                    let priceTotal = 0;
                    let paid = 0;
                    let index = 0;
                    for (index = 0; index < box.prestations.length; index ++){
                        priceTotal += box.prestations[index].price;
                    }
                    for (index = 0; index < box.contributions.length; index ++){
                        paid += Number(box.contributions[index].amount);
                    }

                    if (paid >= priceTotal){
                        box.isPaid = true;
                    }

                    user.save();

                    res.redirect('/box/pot/'+box.urlFund);
                };
            });
        }
        else{
            User.findOne({_id:req.params.userId}, function (err, user){
        
                if (user) {
                    
                    let box = user.boxes.filter(function (box) {
                        return box.id === req.params.id;
                    }).pop();

                    let priceTotal = 0;
                    let paid = 0;
                    let index = 0;
                    for (index = 0; index < box.prestations.length; index ++){
                        priceTotal += box.prestations[index].price;
                    }
                    for (index = 0; index < box.contributions.length; index ++){
                        paid += box.contributions[index].amount;
                    }

                    res.render('pot', {
                        "box" : box,
                        "paid" : paid,
                        "price" : priceTotal,
                        "messageIsSet" : !messageIsSet,
                        "amountIsSet" : !amountIsSet,
                        "nameIsSet" : !nameIsSet,
                        "nameWarning": !nameIsSet,
                        "amountWarning": !amountIsSet,
                        "messageWarning": !messageIsSet,
                        "saveAmount": saveAmount,
                        "saveName": saveName,
                        "saveMessage": saveMessage,
                        "numberIsSet" : !numberIsSet,
                        "dateIsSet" : !dateIsSet,
                        "cryptIsSet" : !cryptIsSet,
                        "numberWarning" : !numberIsSet,
                        "dateWarning" : !dateIsSet,
                        "cryptWarning" : !cryptIsSet,
                        "saveNumber": saveNumber,
                        "saveCrypt": saveCrypt,
                        "saveDate": saveDate
                    });

                }
            });
        }
    });
}