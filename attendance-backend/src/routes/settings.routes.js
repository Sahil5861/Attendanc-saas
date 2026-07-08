const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/allowRoles");


router.use(auth);

router.use(
    allowRoles([      
        "BRANCH_MANAGER",
        "SUPER_ADMIN",  
        "COMPANY_ADMIN"
    ])
);



const {
    saveBranchSettings,
    getBranchSettings,
} = require("../controllers/super-admin/settings.controller");

router.put("/branch", saveBranchSettings);

router.get("/branch", getBranchSettings);

module.exports = router;