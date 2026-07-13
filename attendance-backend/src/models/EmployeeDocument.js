const mongoose = require("mongoose");

const employeeDocumentSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        documentName: {
            type: String,
            required: true,
            trim: true,
        },

        documentType: {
            type: String,
            required: true,
            enum: [
                "identity",
                "address",
                "education",
                "experience",
                "bank",
                "medical",
                "other",
            ],
        },

        documentNumber: {
            type: String,
            required: true,
            trim: true,
        },

        issueDate: {
            type: Date,
            required: true,
        },

        expiryDate: {
            type: Date,
            default: null,
        },

        originalName: {
            type: String,
            required: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        file: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "EmployeeDocument",
    employeeDocumentSchema
);