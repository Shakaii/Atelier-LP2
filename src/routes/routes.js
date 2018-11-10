module.exports = function (app, Box, User, Category, Contribution,Prestation) {
    let bcrypt = require('bcryptjs');
    let validator = require('validator');
    var sanitizer = require('sanitizer');
    let uuid4 = require('uuid/v4');
    let tri; //var pour le tri des prestations
    let currentBox;

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
                        req.session.currentBox = element.id;
                    }
                });
            });
        }
        res.redirect('/catalog');
    });
    
    require('./auth')(app, Box, User, Category, Contribution,Prestation, currentBox);
    require('./admin')(app, Box, User, Category, Contribution,Prestation, currentBox);
    require('./display')(app, Box, User, Category, Contribution,Prestation, currentBox);
    require('./profile')(app, Box, User, Category, Contribution,Prestation, currentBox);
    require('./box')(app, Box, User, Category, Contribution,Prestation, currentBox);
    require('./boxValidate')(app, Box, User, Category, Contribution,Prestation, currentBox);
}