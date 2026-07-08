const express = require("express");

const router = express.Router();

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
        "COMPANY_ADMIN",
        "EMPLOYEE"        
    ])
);


router.get('/data/:id', dashboardController.getEmployeeData);

router.post('/checkin/:id', employeeController.chekinEmployee);
router.post('/checkOut/:id', employeeController.chekoutEmployee);


router.get('/employee-salary', employeeController.getEmployeeSalary);
router.post('/employee-salary', employeeController.createEmployeeSalary);
router.put('/employee-salary/:id', employeeController.updateEmployeeSalary);


// Leaves
router.get('/leaves/:id', leaveController.getLeave)
router.post('/leaves', leaveController.createLeave)
router.delete('/leaves/:id', leaveController.deleteLeave)
module.exports = router;