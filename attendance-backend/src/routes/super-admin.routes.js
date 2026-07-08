const express = require("express");

const router = express.Router();
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/allowRoles");


const commonController = require("../controllers/super-admin/common.controller");


const companyController = require("../controllers/super-admin/company.controller");
const branchController = require("../controllers/super-admin/branches.controller");
// const companyController = require("../controllers/super-admin/company.controller");
const roleController = require("../controllers/super-admin/role.controller");
const usersController = require("../controllers/super-admin/user.controller");
const dashboardController = require("../controllers/super-admin/dashboard.controller");


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



router.get('/states', commonController.getStates);
router.get('/state-cities/:id', commonController.getCitiesByState);

router.get('/states/:id', commonController.getStateById);
router.get('/cities/:id', commonController.getCityById);


// dashboard

router.get('/data', dashboardController.getSuperAdminData);


// companies
router.post(
    "/companies",
    companyController.createCompany
);

router.get(
    "/companies",
    companyController.getCompanies
);

router.get(
    "/companies/:id",
    companyController.getCompany
);

router.put(
    "/companies/:id",
    companyController.updateCompany
);

router.delete(
    "/companies/:id",
    companyController.deleteCompany
);

router.patch(
    "/companies/:id/status",
    companyController.changeStatus
);


router.get(
    "/getBranchesByCompany/:id",
    companyController.getBranchesByCompany
);


// company branches
router.get("/branches", branchController.getCompanyBranches);
router.post("/branches", branchController.createCompanyBranches);
router.put("/branches/:id", branchController.updateCompanyBranches);
router.delete("/branches/:id", branchController.deleteCompanyBranches);


// users

router.get('/users', usersController.getUsers);
router.post('/update-user-status/:id', usersController.updateStatus);


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
router.delete("/plans/:id", planController.deletePlan);



// features
router.get("/features", featureController.getFeatures);
router.post("/features", featureController.createFeature);
router.put("/features/:id", featureController.updateFeature);
router.delete("/features/:id", featureController.deleteFeature);


// permisions

router.get("/permissions", permissionController.getAllPermissions);
router.post("/permissions", permissionController.createPermissions);
module.exports = router;