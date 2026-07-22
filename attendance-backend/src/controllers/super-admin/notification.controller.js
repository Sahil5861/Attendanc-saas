const Notification = require("../../models/Notification");
const User = require("../../models/User");

const getNotificationQuery = async (req) => {
    if (req.user.role === "EMPLOYEE") {
        let employeeId = req.user.employeeId;

        if (!employeeId) {
            const user = await User.findById(req.user.id).select("employeeId");
            employeeId = user?.employeeId;
        }

        return {
            receiverType: "Employee",
            receiverId: employeeId,
        };
    }

    const branchId = req.get("X-Branch-Id") || req.user.branchId;

    return { branchId };
};

exports.getUnreadCount = async (req, res) => {
    try {
        const query = await getNotificationQuery(req);

        const count = await Notification.countDocuments({
            ...query,
            isRead: false,
        });

        return res.status(200).json({ success: true, count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const query = await getNotificationQuery(req);

        const notifications = await Notification.find({
            ...query,            
        })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        return res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const branchId = req.get("X-Branch-Id");

        const result = await Notification.updateMany(
            {
                receiverId: branchId,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};