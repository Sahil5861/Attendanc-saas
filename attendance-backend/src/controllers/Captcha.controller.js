// controllers/captcha.controller.js
// npm install svg-captcha

const svgCaptcha = require("svg-captcha");
const Captcha = require("../models/Captcha");

// GET /api/captcha
// Generates a new captcha, stores its text in the DB (expires in 5 min via TTL index),
// and returns the captchaId + SVG markup to render on the frontend.
exports.generateCaptcha = async (req, res) => {
    try {
        const captcha = svgCaptcha.create({
            size: 6,
            noise: 3,
            color: true,
            background: "#f0fdf4",
            ignoreChars: "0oO1ilI", // avoid visually-confusing characters
            width: 180,
            height: 48,
        });

        const saved = await Captcha.create({ text: captcha.text.toUpperCase() });

        return res.status(200).json({
            success: true,
            captchaId: saved._id,
            image: captcha.data, // raw SVG markup
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate captcha",
        });
    }
};

// Reusable helper — call this from login/register controllers before
// proceeding with the actual login/signup logic.
// Returns true/false. Always deletes the record after one check (one-time use),
// whether it matched or not — prevents brute-force guessing against the same captcha.
exports.verifyCaptcha = async (captchaId, userInput) => {
    if (!captchaId || !userInput) return false;

    const record = await Captcha.findById(captchaId);
    if (!record) return false; // not found or already expired/used

    const isValid = record.text === String(userInput).trim().toUpperCase();

    await Captcha.findByIdAndDelete(captchaId);

    return isValid;
};

// Optional standalone endpoint: POST /api/captcha/verify
// Useful if you want to validate the captcha as its own step before
// showing the rest of a multi-step form.
exports.verifyCaptchaEndpoint = async (req, res) => {
    try {
        const { captchaId, text } = req.body;

        const isValid = await exports.verifyCaptcha(captchaId, text);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Incorrect or expired security code",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Captcha verified",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};