const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
//Atlas connection=> mongodb+srv://root:root@pakoppertunityhub.o7g7hv4.mongodb.net/?retryWrites=true&w=majority

const MONGODB_URL = "mongodb://localhost:27017/pakOppertunityHub";

const app = express();

app.use(express.json());
app.use(cors());

app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/user", authRoutes);
app.use("/admin", adminRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    console.log("App is listening at port : 8080");
    console.log("Database is connected");
    app.listen(8080);
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
