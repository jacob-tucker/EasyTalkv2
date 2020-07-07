require('dotenv').config()

const http = require('http');

const cors = require('cors');
const hostname = '127.0.0.1';
const port = process.env.PORT || 5000;
const express = require('express');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {AddUser, FindUser, RemoveUser, FindId} = require('./users.js')


var corsOptions = {
    origin: ['http://localhost:3000', 'https://easytalkv2.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'] };
app.use(cors(corsOptions));

app.use(express.json())

app.use(cookieParser());

//Tells the server what port to listen to and can add a function to talk to command line
server.listen(port, () => {
  console.log("Server is up!");
});

//This is required to send something to the server or an error will pop up, we put '/' for that specific link
//app.get means “Run this on a GET request, for the given URL”
//Necessary for express and socket.io

//sendFile just sends the index.html file and displays it on the server's screen
app.get('/', (req, res) => {
  res.send('Server is up and running!' + port);
});

/****** ^^ BASIC SETUP ^^ ******/

/****** MongoDB Connection ******/
const ObjectId = require('mongodb').ObjectId;

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://tsnakejake:test1234@cluster0-ycsen.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  database = client.db("message_app")
  profiles = database.collection('profiles')
  console.log("Hello Connected to Mongodb...!")

  // perform actions on the collection object

});

/****** Logout ******/
app.get('/logout', async (req, res) => {
  res.clearCookie('token')
  res.send("Logged out!")
})

/****** Sign Up Post Request ******/

app.post('/signup', async (req, res) => {
  const matches = await profiles.findOne({username: req.body.username})
  if(matches){
    res.send("You have already signed up! :)")
    console.log("Already signed up!")
  }else{
    profiles.insertOne({name: req.body.name, username: req.body.username, password: req.body.password, chats: ["All Chat"]}, async function(err, resp) {
      if (err) throw err;

      console.log(resp.insertedId)
      const user = {id: resp.insertedId}
      const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

      res.cookie('token', accessToken)

      res.send("Signup!")
      console.log("1 document inserted");
      console.log("Signup success")
    })
  }
});

/****** Sign In Post Request ******/

app.post('/signin', async (req, res) => {
  /* Authentication */
  console.log(req.body.username)
  console.log('sign  in ^^')
  const matches = await profiles.findOne({username: req.body.username, password: req.body.password})
  if(matches){
    const user = {id: matches._id}
    const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    res.cookie('token', accessToken)
    res.send({accessToken})
    console.log("Login success")
  }else{
    res.send("Please review.")
    console.log("Login failure")
  }

})

/****** Authentication ******/
/* This makes sure that the token we are getting from our cookies is valid so we can get all of our information
from the user object (that we added in the signin/signup) inside the token */
async function authenticateToken(req, res, next) {

  /* This would be used if you were passing it through props and made a post request with a header: {Bearer (key)}
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] //this returns the access token
  */

  const token = await req.cookies['token']

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    req.user = user
    next()
  })

}

app.post('/getRooms', authenticateToken, async (req, res) => {
  console.log(req.user.id)
  console.log("Hello!!")
  const matches = await profiles.findOne({_id: ObjectId(req.user.id)})

  if (matches){
    let displayers = []
    let holder
    for(let i = 0; i < matches.chats.length; i++){
      let arraySplit = matches.chats[i].split('-')
      if(matches.chats[i] == 'All Chat'){
        displayers.push({chat: matches.chats[i], initials: 'AC'})
      } else if(arraySplit[0] == matches.username) {
        holder = await profiles.findOne({username: arraySplit[1]})
        let arrayInit = holder.name.split(' ')
        console.log(arrayInit[0])
        displayers.push({chat: holder.name, initials: arrayInit[0][0] + arrayInit[1][0]})
      } else if(arraySplit[1] == matches.username) {
        holder = await profiles.findOne({username: arraySplit[0]})
        let arrayInit = holder.name.split(' ')
        console.log("Holder is: " + holder.name)
        displayers.push({chat: holder.name, initials: arrayInit[0][0] + arrayInit[1][0]})
      }
    }
    res.send({chats: matches.chats, displayChats: displayers})
  }else{
    res.send("None")
  }
})

app.post('/getMessages', authenticateToken, async (req, res) => {
  let messageTaker = await database.collection(req.body.room).findOne()

  if (messageTaker){
    res.send(messageTaker.messages)
  }else{
    res.send("None")
  }
})

app.post('/addRoom', authenticateToken, async (req, res) => {
  const matches = await profiles.findOne({username: req.body.newRoom})
  console.log("Hi")
  if(req.body.newRoom == req.body.username){
    res.send('You cannot send messages to yourself, silly!')
  }else{
    if (matches) {
      if(req.body.newRoom < req.body.username) {
        const exists = await database.collection(req.body.newRoom + '-' + req.body.username).findOne()
        if (!exists){
          database.createCollection(req.body.newRoom + '-' + req.body.username, function(err, collection) {
            if(err){
              res.send("There was an error.")
            }else{
              collection.insertOne({messages: [{message: "Welcome to your new room!", sender: "Admin"}]})
              profiles.updateOne(
                {username: req.body.username},
                { $push: {chats: req.body.newRoom + '-' + req.body.username}}
              )
              profiles.updateOne(
                {username: req.body.newRoom},
                { $push: {chats: req.body.newRoom + '-' + req.body.username}}
              )
              res.send('Created! Woop woop!')
            }
          })
        } else{
          res.send('This conversation already exists!')
        }
      } else if(req.body.username < req.body.newRoom){
        const exists = await database.collection(req.body.username + '-' + req.body.newRoom).findOne()
        console.log(exists)
        if (!exists) {
          database.createCollection(req.body.username + '-' + req.body.newRoom, function(err, collection) {
            if(err){
              res.send("There was an error.")
            } else {
              collection.insertOne({messages: [{message: "Welcome to your new room!", sender: "Admin"}]})
              profiles.updateOne(
                {username: req.body.username},
                { $push: {chats: req.body.username + '-' + req.body.newRoom}}
              )
              profiles.updateOne(
                {username: req.body.newRoom},
                { $push: {chats: req.body.username + '-' + req.body.newRoom}}
              )
              res.send('Created! Woop woop!')
            }
          })
        } else {
          res.send('This conversation already exists!')
        }
      }
    } else {
      res.send('User does not exist.')
    }
  }
})


/******** socket.io :D ********/

//For socket.io
io.on('connection', (socket) => {
  socket.on('join', ({name, room}, callback) => {
    socket.join(room);
    AddUser(name, room, socket.id);
    console.log("Joined a socket room!")
    socket.broadcast.emit('message', {message: `${name} has joined the room!`, name: name});
  })

  socket.on('rejoin', ({name, room}, callback) => {
    let id = socket.id
    let user = FindUser(id)
    RemoveUser(id)

    socket.leave(user.room)
    console.log("Joining new room... " + room)
    socket.join(room)
    AddUser(name, room, socket.id)
  })

  socket.on('disconnect', () => {
    let id = socket.id
    let user = FindUser(id)
    if(user){
      let name = user.name;

      io.to(user.room).emit('message', {message: `${name} has left the room!`, name: name});

      RemoveUser(id)
    }

  })

  //Remember the only reason we can just write message, name is because of ES6 syntax because theyre the same name and their
  //variable names
  socket.on('sendMessage', async ({room, message, sender}, callback) => {
    let theCollection = await database.collection(room)

    if(theCollection){
      theCollection.updateOne(
        {},
        { $push: {messages: {message: message, sender: sender}}}
      ).then(
        console.log("Sent the message.")
      ).catch((err) => {
        console.log('Error: ' + err);
      })
      io.to(room).emit('message', {message: message, sender: sender})
      callback()
    }
  });

  socket.on('newChat', async ({updatePerson, sender}, callback) => {
    let room

    if(updatePerson < sender){
      room = updatePerson + '-' + sender
    }else if (sender < updatePerson) {
      room = sender + '-' + updatePerson
    }
    let getName = await profiles.findOne({username: updatePerson})
    let arraySplit1 = getName.name.split(' ')
    let getNameSender = await profiles.findOne({username: sender})
    let arraySplit2 = getNameSender.name.split(' ')

    io.emit('updateYourRooms', {person: updatePerson, sender: sender, roomAdd: room, displayroomAdd: {chat: getName.name, initials: arraySplit1[0][0] + arraySplit1[1][0]}, displayroomAddSender: {chat: getNameSender.name, initials: arraySplit2[0][0] + arraySplit2[1][0]}})

    callback()
  })

});
