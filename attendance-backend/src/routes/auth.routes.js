const express = require("express");

const router = express.Router();

const {login, logout, getCaptcha, initiate, verifyOtp, resendOtp, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword, saveToken } = require("../controllers/auth.controller");
const {me} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/logout", logout);
router.post("/initiate", initiate);

router.post('/saveToken', saveToken);


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