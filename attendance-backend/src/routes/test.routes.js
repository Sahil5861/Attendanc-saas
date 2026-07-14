const express = require("express");

const router = express.Router();
const State = require("../models/State");
const City = require("../models/City");

const auth =
    require("../middleware/auth.middleware");

router.get(
    "/profile",
    auth,
    async (req, res) => {

        return res.json({
            success: true,
            user: req.user
        });

    }
);


router.get("/", async (req, res) => {
    return res.status(200).json({
        success: true, message: 'Testing is working withut user login !',
    });
})



router.get("/states", async (req, res) => {
    try {
        const data = await State.find({
            countryId: 101
        }).sort({ craeteAt: -1 });

        return res.status(200).json({
            success: true, data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: errro.message
        });
    }
});


router.get("/cities-by-state/:id", async (req, res) => {

    try {
        const { id } = req.params;


        const data = await City.find({
            stateId: id
        }).sort({ craeteAt: -1 });

        return res.status(200).json({
            success: true, data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: errro.message
        });
    }



});

module.exports = router;