const express = require('express') ;
const getAllUser  = require("../controllers/user-controller.js");

const router = express.Router();

router.get("/", getAllUser);

module.exports =router;