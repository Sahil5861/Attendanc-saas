const mongoose = require("mongoose");

const salaryLineItemSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

const employeeSalarySchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        branchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
            index: true,
        },

        basicSalary: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        earnings: {
            type: [salaryLineItemSchema],
            default: [],
        },

        deductions: {
            type: [salaryLineItemSchema],
            default: [],
        },

        fines: {
            type: [salaryLineItemSchema],
            default: [],
        },

        note: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "EmployeeSalary",
    employeeSalarySchema
);