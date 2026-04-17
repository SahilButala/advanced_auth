const express = require('express');
const router = express.Router();


// ----------------- DECLARE ROUTES -----------------//
const userRoute = require("./user-route")

// ----------------- DECLARE ROUTES -----------------//



// ----------------- ROUTES -----------------//
router.use("/users", userRoute)
// ----------------- ROUTES -----------------//





module.exports = router;