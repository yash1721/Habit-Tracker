// first import install libery 

const express = require("express");
var bodyParse = require("body-parser");
var mongoose = require("mongoose");
const e = require("express");
const path = require("path");
const http = require("http");
// var db = require("./config/mongoose");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const expressLayout = require("express-ejs-layouts");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

//create app

const app = express()
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname, "public")));

// chat application


// Set static folder

const botName = "Pikadex Chat";

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("messages", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});


//=================================================

app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended: true
}))

// conect database


mongoose.connect('mongodb://0.0.0.0:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var db = mongoose.connection;

// check connect

db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));


app.get("/", (req, res) => {

    res.set({
        "Allow-access-Allow-Origin": '*'
    })

    return res.redirect('index.html');

});

//=============================================
app.post("/login", async (request, response) => {
    try {
        //adding get data from login_up.html
        const username = request.body.username;
        const password = request.body.password;

        console.log(`${username} and ${password}`);

        const usermail = db.collection('users').findOne({ email: username }, (err, res) => {
            if (res == null) {
                response.send("Invalid information!❌❌❌! Please create account first");
            }
            else if (err) throw err;


            if (res && res.password == password) {
                return response.redirect('index.html');
            }
            else {
                response.send("Invalid Password!❌❌❌");
            }


        });
    }
    catch (error) {
        response.send("Invalid information❌");
    }

})

//Create Object

app.post("/sign_up", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var password = req.body.password;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var aadhar = req.body.aadhar;
    var pancard = req.body.pancard;
    var location = req.body.location;
    var message = req.body.message;
    var address = req.body.address;
    var data = {
        "name": name,
        "email": email,
        "phno": phno,
        "password": password,
        "dob": dob,
        "gender": gender,
        "aadhar": aadhar,
        "pancard": pancard,
        "location": location,
        "message": message,
        "address": address
    }

    //sent database
    db.collection('users').insertOne(data, (err, collection) => {
        if (err) throw err;
        console.log("Record Inserted Successfully");
    });
    return res.redirect('userlogin.html');

})

// ====================================================

// To-Do-List

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParse.urlencoded({extended:true}));

// const mongoose = require("mongoose");

mongoose.connect("mongodb://0.0.0.0:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Meditation"
});
const item2 = new Item({
  name: "Gym"
});
const item3 = new Item({
  name: "Breakfast"
});
const defaultItems = [item1, item2, item3];

// Save default items to the database if there are no items
// Item.countDocuments({}).exec()
//   .then(count => {
//     if (count === 0) {
//       return Item.insertMany(defaultItems);
//     } else {
//       throw new Error("Items already exist in the database.");
//     }
//   })
//   .then(() => {
//     console.log("Successfully saved items to DB");
//   })
//   .catch(err => {
//     console.log(err);
//   });

app.get("/home", function (req, res) {
  Item.find({}).exec()
    .then(foundItems => {
      res.render("list", { newListItems: foundItems });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/home", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { newListItems: foundItems });
    }
  });
});

app.get('/home', async function(req, res) {
  try {
    const newListItems = await Item.find({}).exec();
    res.render('list', { newListItems });
  } catch (error) {
    // Handle the error
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/",function(req,res)
{
     const itemName=req.body.n;
    //console.log(i);
    //i1.push(i);
    //res.render("list",{newListItem:i});
   // res.redirect("/");
   const item=new Item({
       name:itemName
   });
item.save();
res.redirect("/home");
});
// 

app.post("/delete", async function(req, res) {
  try {
    const check = req.body.checkbox;
    await Item.findByIdAndRemove(check);
    res.redirect("/home");
  } catch (error) {
    // Handle the error
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

// ========================================================

//Habit Tracker

// set view engine
app.set("view engine", "ejs");
app.set("views", "./views");
// DB Path
app.set("views", path.join(__dirname, "views"));
// extract style and scripts from subpages to layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
//Use router
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.static("./assets"));
app.use(expressLayout);
// require mongoose

// using router
app.use("/habit", require("./routes/index"));

//==========================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));