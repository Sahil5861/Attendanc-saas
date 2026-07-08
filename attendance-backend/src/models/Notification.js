const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },

    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "senderType",
    },

    senderType: {
        type: String,
        enum: ["Employee", "User"],
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    receiverType: {
        type: String,
        enum: ["Employee", "User"],
        required: true,
    },

    type: {
        type: String,
        enum: [
            "LEAVE_REQUEST",
            "LEAVE_APPROVED",
            "LEAVE_REJECTED",
            "ATTENDANCE",
            "ANNOUNCEMENT",
            "SALARY",
            "GENERAL",
        ],
        default: "GENERAL",
    },

    title: String,

    message: String,

    referenceId: mongoose.Schema.Types.ObjectId,

    referenceModel: String,

    isRead: {
        type: Boolean,
        default: false,
    },

    actionUrl: String,
},
{
    timestamps: true,
});

module.exports = mongoose.model("Notification", notificationSchema);