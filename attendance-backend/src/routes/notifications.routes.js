const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const allowRoles = require("../middleware/allowRoles");


const notificationController = require("../controllers/super-admin/notification.controller");


router.use(auth);

router.use(
    allowRoles([      
        "BRANCH_MANAGER",
        "SUPER_ADMIN",  
        "COMPANY_ADMIN",
        "EMPLOYEE"
    ])
);


router.get('/unread-count', notificationController.getUnreadCount);
router.get('/', notificationController.getNotifications);
router.get('/getNotifications', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.get('/markAsRead', notificationController.markAsRead);

module.exports = router;
