const mongoose = require("mongoose");
const { Schema } = mongoose;


const HolidaySchema = new mongoose.Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: [true, "Holiday title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },

        type: {
            type: String,
            enum: ["national", "festival", "custom"],
            default: "national",
        },

        date: {
            type: Date,
            required: [true, "Holiday date is required"],
        },

        isPaid: {
            type: Boolean,
            default: true,
        },

        isOptional: {
            type: Boolean,
            default: false,
        },

        appliesToAllBranches: {
            type: Boolean,
            default: true,
        },

        branchIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Branch",
            },
        ],

        isRecurring: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);


module.exports =
mongoose.model(
    "Holiday",
    HolidaySchema
);