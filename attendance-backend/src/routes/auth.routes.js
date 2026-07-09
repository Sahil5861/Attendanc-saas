const express = require("express");

const router = express.Router();

const {login, getCaptcha, initiate, verifyOtp, resendOtp, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } = require("../controllers/auth.controller");
const {me} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/initiate", initiate);


router.get("/me", authMiddleware, me);

router.get("/getNewCaptcha/:length", getCaptcha);

// routes/auth.routes.js — add these alongside your existing /login, /initiate routes

router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);


// forgot password

router.post("/sendForgotPasswordOtp", sendForgotPasswordOtp);
router.post("/verifyForgotPasswordOtp", verifyForgotPasswordOtp);
router.post("/resetPassword", resetPassword);


module.exports = router;