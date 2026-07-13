const mongoose = require('mongoose')

const LeaveSchema = new mongoose.Schema({
    reason : {
        type: String,
        required: true,
    },
    daysType :{
        type: String,
        required: true,
    },
    type: {
      type: String,
      enum: ["SICK", "CASUAL", "PAID"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    date :{
        type: Date,
        required: false,
    },
    fromDate :{
        type: Date,
        required: false,
    },
    toDate:{
        type: Date,
        required: false,
    },

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    }
},

{
    timestamps: true,
}
)


module.exports = mongoose.model("Leave", LeaveSchema);