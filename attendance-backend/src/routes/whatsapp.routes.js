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



router.post('/flow', async (req, res) => {
    try {

        const { screen } = req.body;

        if (screen === 'course') {

            const courses = [
                {
                    id: 1,
                    name: 'MBA'
                },
                {
                    id: 1,
                    name: 'BBA'
                },
                {
                    id: 1,
                    name: 'BCA'
                },
                {
                    id: 1,
                    name: 'MCA'
                },
                {
                    id: 1,
                    name: 'B.TECH'
                },


            ]
            return res.status(200).json({
                success: true, data: courses
            });
        }
        else if (screen === 'states') {
            const data = await State.find({
                countryId: 101
            }).sort({ craeteAt: -1 });

            return res.status(200).json({
                success: true, data: data
            });
        }
        else{
            return res.status(400).json({
                success: false, message: 'Invalid Screen type !!'
            });
        }

    }
    catch (error) {
        return res.status(500).json({
            success: false, message: error.message
        });
    }
})

module.exports = router;