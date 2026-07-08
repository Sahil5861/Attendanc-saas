const bcrypt = require("bcryptjs");
const razorpay = require("../../config/razorpay");
const crypto = require("crypto");
const Branch = require('../../models/Branch');

const Payment = require("../../models/Payment");
const BranchPlanRelation = require("../../models/BranchPlanRelation");
const User = require("../../models/User");
const Role = require("../../models/Role");
const Permission = require("../../models/Permission");


exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            orderId: order.id,
            amount,
            currency: order.currency,
            receipt: order.receipt,
            status: "created",
            razorpayResponse: order,
        });

        res.json(order);

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


exports.createOrderForPlan = async (req, res) => {
    try {
        const { branch_id, plan_id, billingCycle, amount } = req.body;


        if (!branch_id || !plan_id) {
            return res.status(400).json({ status: false, message: "branch_id and plan_id are required" });
        }

        // 1. Expire existing active plan(s) for this branch
        await BranchPlanRelation.updateMany(
            { branch_id, status: "active" },
            { $set: { status: "expired" } }
        );


        const options = {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };


        const order = await razorpay.orders.create(options);
        const paymentId = 'payment_' + Math.floor(100000 + Math.random() * 900000).toString();

        const payment = await Payment.create({
            orderId: order.id,
            paymentId: paymentId,
            amount,
            currency: order.currency,
            receipt: order.receipt,
            status: "created",
            razorpayResponse: order,
        });

        // 2. Create new active relation
        const newRelation = await BranchPlanRelation.create({
            branch_id,
            plan_id,
            payment_id: payment._id,
            billingCycle,
            status: "active",
        });


        const branch = await Branch.findById(branch_id);


        
        const relation = await BranchPlanRelation.findOne({
            branch_id: branch._id,
            status: 'active'
        }).populate({
            path: 'plan_id',
            populate: {
                path: 'features.feature_id',
                model: 'Feature'
            },
        });

        const user = await User.findOne({
            branchId: branch._id
        });



        const role = await Role.findById(
            user.roleId
        );


        const permissions = await Permission.find({
            _id: { $in: role.permissions }
        }).select('name');

        const permission_names = permissions.map((permission) => {
            return permission.name;
        });


        return res.json({
            data: {
                order: order,
                branch: { ...branch.toObject(), plan: relation, permissions: permission_names }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


exports.verifyPayment = async (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
            razorpay_order_id + "|" + razorpay_payment_id
        )
        .digest("hex");

    if (generatedSignature === razorpay_signature) {


        await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: "paid",
                isVerified: true,
                paidAt: new Date(),
            }
        );

        return res.json({
            success: true,
            message: "Payment Verified"
        });

    }

    res.status(400).json({
        success: false,
        message: "Invalid Signature"
    });
}