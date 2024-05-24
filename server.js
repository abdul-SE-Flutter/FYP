const express = require("express");

const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketio = require("socket.io");
const http = require("http");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const agentRoutes = require("./routes/agetRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const eligibilityCheckerRoutes = require("./routes/eligibility-checker");
const { socketConnection } = require("./services/new-socket-io");

//Atlas connection=> mongodb+srv://root:root@pakoppertunityhub.o7g7hv4.mongodb.net/?retryWrites=true&w=majority

const MONGODB_URL = "mongodb+srv://root:root@pakoppertunityhub.o7g7hv4.mongodb.net/?retryWrites=true&w=majority";

const app = express();
app.use(morgan("dev"));

const serverInstance = http.createServer(app);


app.use(express.json());
app.use(cors());

const io =  socketio(serverInstance , {
  cors : {
    origin : true
  }
});

app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/agent", agentRoutes);
app.use("/chat", chatRoutes);
app.use("/eligibilityChecher", eligibilityCheckerRoutes);
app.use("/review" , reviewRoutes);

app.use("/",(request,response)=>{
  response.send("Welcome to PakOpperTunity Hub");
})

app.use("/stripe/test", (req, res) => {
  res.send(`<h1>Payment Successfull<h1>`);
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data, success: false });
});

socketConnection(io);

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    console.log("App is listening at port : 8080");
    console.log("Database is connected...");
    const server = serverInstance.listen(8080);
  })
  .catch((e) => {
    console.log(e);
  });

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
// app.use("/images", express.static(path.join(__dirname, "images")));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//     next();
// });
