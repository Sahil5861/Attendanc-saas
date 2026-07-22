const Notification = require("../models/Notification");
const { getIO } = require("../socket");
const admin = require("../config/firebase"); // your firebase-admin instance
const User = require("../models/User");       // ya Employee, jahan fcmToken store hai
const { messaging } = require("../config/firebase"); // adjust path

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

        console.log('payload : ', payload);
        console.log('receiver ID : ', receiverId);

        // ---------------- Socket emit (existing) ----------------
        try {
            const io = getIO();

            if (receiverType === "Employee" && receiverId) {
                const room = `employee:${receiverId}`;
                io.to(room).emit("notification:new", payload);
                console.log(`Socket message sent to room: ${room}`);
            } else if (branchId) {
                const room = `branch:${branchId}`;
                io.to(room).emit("notification:new", payload);
                console.log(`Socket message sent to room: ${room}`);
            }
        } catch (socketError) {
            console.error('Socket emit failed : ', socketError.message);
        }

        // ---------------- FCM Push (new) ----------------
        try {
            if (receiverId) {
                // const receiverModel = receiverType === "Employee" ? require("../models/Employee") : User;
                // const receiver = await receiverModel.findById(receiverId).select("fcmToken");

                const user = await User.findOne({
                    employeeId: receiverId
                });

                if(!user){
                    console.error('User not found !');
                }

                console.log('user : ', user);



                if (user?.fcmToken && user?.notificationStatus === true) {
                    const fcmMessage = {
                        notification: {
                            title: title,
                            body: message,
                        },
                        token: user.fcmToken,
                    };

                    await messaging.send(fcmMessage);
                    console.log(`FCM push sent to receiver: ${receiverId}`);
                }
                else{
                    console.error('FCM roken not found !');
                }
            }
            else{
                console.error('Error : Reciver id not found !');
            }
        } catch (fcmError) {
            console.error('FCM push failed : ', fcmError.message);

            // Optional: agar token expire/invalid ho gaya to DB se clean kar do
            if (fcmError.code === 'messaging/registration-token-not-registered') {
                // await receiverModel.findByIdAndUpdate(receiverId, { fcmToken: null });
            }
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