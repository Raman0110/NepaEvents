const express = require("express");
const { sendContactForm } = require("../controller/contact-controller");
const router = express.Router();


router.post("/", sendContactForm);

module.exports = router;
