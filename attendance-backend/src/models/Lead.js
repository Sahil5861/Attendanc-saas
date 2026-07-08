const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        status:{
            type: String,
            default: 'pending'
        },        
        otp: {
            type:String,            
        },
        otpExpiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    },
);

module.exports = mongoose.model('Lead', LeadSchema);