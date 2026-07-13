const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");

const auth = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/allowRoles");

const branchController = require("../controllers/super-admin/branches.controller");
const roleController = require("../controllers/super-admin/role.controller");
const permissionController = require("../controllers/super-admin/permission.controller");
const featureController = require("../controllers/super-admin/feature.controller");
const planController = require("../controllers/super-admin/plan.controller");
const employeeController = require("../controllers/super-admin/employee.controller");

const dashboardController = require("../controllers/super-admin/dashboard.controller");
const leaveController = require("../controllers/super-admin/leave.controller")


router.use(auth);

router.use(
    allowRoles([      
        "BRANCH_MANAGER",
        "SUPER_ADMIN",  
        "COMPANY_ADMIN"
    ])
);


router.get('/data/:id', dashboardController.getBranchsData);

// attendance
router.post('/update-attendance', employeeController.updateAttendance);
router.get('/:id/attendance', employeeController.getEmployeeAttendance);



router.get("/employees/:id", employeeController.getEmployeeById);
router.get("/employees", employeeController.getEmployees);



router.post("/employees", upload.single("image"), employeeController.createEmployees);
router.put("/employees/:id", upload.single("image"), employeeController.updateEmployees);



router.patch("/employee/:id/status", employeeController.updateEmployeeStatus);




router.delete("/employees/:id", employeeController.deleteEmployee);


// plans
router.get("/plans", branchController.getPlans);
router.get("/:id/active-plan", branchController.getBranchActivePlan );
router.post("/assign-plan", branchController.assignPlanToBranch);


// designations
router.get("/departments", branchController.getDepartments);
router.post("/departments", branchController.createDepartments);
router.put("/departments/:id", branchController.updateDepartments);
router.delete("/departments/:id", branchController.deleteDepartments);

// designations
router.get("/designations", branchController.getDesignations);
router.post("/designations", branchController.createDesignations);
router.put("/designations/:id", branchController.updateDesignations);
router.delete("/designations/:id", branchController.deleteDesignations);


// teams
router.get("/teams", branchController.getTeams);
router.post("/teams", branchController.createTeams);
router.put("/teams/:id", branchController.createTeams);
router.delete("/teams/:id", branchController.deleteTeams);


// Leaves
router.get('/leaves', leaveController.getLeavesForBranches);
router.put('/leaves/:id/:status', leaveController.updateLeaveStatus);



module.exports = router;