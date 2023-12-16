const express = require('express');
const mongoose = require('mongoose');



const app = express();
app.use(express.json());
mongoose
  .connect(
    "mongodb+srv://admin:divya@cluster0.utimwbh.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => app.listen(5000))
  .then(() =>
    console.log("Connected TO Database and Listening TO Localhost 5000")
  )
  .catch((err) => console.log(err));