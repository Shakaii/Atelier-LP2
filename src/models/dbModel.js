module.exports = function(mongoose, app){
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
            amount: Number,
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

        require('../routes/routes')(app, Box, User, Category, Contribution);
    });
}