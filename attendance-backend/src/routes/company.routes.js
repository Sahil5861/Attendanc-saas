const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth.middleware");

const allowRoles =
require("../middleware/allowRoles");

const dashboardController = require("../controllers/super-admin/dashboard.controller");


const companyController = require("../controllers/super-admin/company.controller");
const roleController = require("../controllers/super-admin/role.controller");
const permissionController = require("../controllers/super-admin/permission.controller");
const featureController = require("../controllers/super-admin/feature.controller");
const planController = require("../controllers/super-admin/plan.controller");

router.use(auth);

router.use(
    allowRoles([      
        "SUPER_ADMIN",  
        "COMPANY_ADMIN"
    ])
);

router.get('/data/:id', dashboardController.getCompanyData);


// company branches
router.get("/branches", companyController.getCompanyBranches);
router.get("/branches/:id", companyController.getBranchById);

router.post("/branches", companyController.createCompanyBranches);
router.put("/branches/:id", companyController.updateCompanyBranches);
router.delete("/branches/:id", companyController.deleteCompanyBranches);



// roles

router.post(
    "/roles",
    roleController.createRoles
);

router.get(
    "/roles",
    roleController.getRoles
);

// role permissions
router.put("/roles/:id/permissions", roleController.updateRolePermissions);


// plans
router.get("/plans", planController.getPlans);
router.post("/plans", planController.createPlan);
router.put("/plans/:id", planController.updatePlan);



// features
router.get("/features", featureController.getFeatures);
router.post("/features", featureController.createFeature);
router.put("/features/:id", featureController.updateFeature);
router.delete("/features/:id", featureController.deleteFeature);


// permisions

router.get("/permissions", permissionController.getAllPermissions);
router.post("/permissions", permissionController.createPermissions);
module.exports = router;