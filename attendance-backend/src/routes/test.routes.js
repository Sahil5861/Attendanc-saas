const express = require("express");

const router = express.Router();

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

module.exports = router;