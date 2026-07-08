const Notification = require("../models/Notification");

const {getIO} = require("../socket");


const createNotification = async ({
    companyId,
    branchId,
    senderId,
    senderType = "User",
    receiverId,
    receiverType = "User",
    type,
    title,
    message,
    referenceId = null,
    referenceModel = null,
    actionUrl = "",
}) => {
    try {
        const notification = await Notification.create({
            companyId,
            branchId,
            senderId,
            senderType,
            receiverId,
            receiverType,
            type,
            title,
            message,
            referenceId,
            referenceModel,
            actionUrl,
        });

        // emit socket
        try {
            const io = getIO();
            const payload = {
                _id: notification._id,
                companyId: notification.companyId,
                branchId: notification.branchId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                actionUrl: notification.actionUrl,
                createdAt: notification.createdAt,
            };

            if (receiverType === "Employee" && receiverId) {
                const room = `employee:${receiverId}`;
                const sockets = await io.in(room).fetchSockets();

                io.to(room).emit("notification:new", payload);

                console.log(`Socket message sent to room: ${room}`);
                console.log(`Connected sockets in ${room}: ${sockets.length}`);
            } else if (branchId) {
                const room = `branch:${branchId}`;
                const sockets = await io.in(room).fetchSockets();

                io.to(room).emit("notification:new", payload);

                console.log(`Socket message sent to room: ${room}`);
                console.log(`Connected sockets in ${room}: ${sockets.length}`);
            }
        } catch (socketError) {
            console.error('Socket emit failed : ', socketError.message);
        }
        return notification;
    } catch (error) {
        console.error("Notification Service Error:", error);
        throw error;
    }
};

module.exports = {
    createNotification,
};
