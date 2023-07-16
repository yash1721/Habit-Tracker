require("dotenv").config();
const mongoose = require("mongoose");
// connecting to mongoose
// add your mongodb
mongoose.connect('mongodb://0.0.0.0:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var db = mongoose.connection;

// check connect

db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));

module.exports = db;
