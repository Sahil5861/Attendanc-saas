const bcrypt = require("bcryptjs");
const razorpay = require("../../config/razorpay");
const crypto = require("crypto");
const Branch = require('../../models/Branch');
const BranchSubscription = require("../../models/BranchSubscription");

const Payment = require("../../models/Payment");

const Plan = require("../../models/Plan");
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


// new subscription functions


exports.createSubscription = async (req, res) => {
    try {
        const { branch_id, plan_id, billingCycle } = req.body;

        const plan = await Plan.findById(plan_id);
        if (!plan || !plan.razorpayPlans?.[billingCycle]) {
            return res.status(400).json({ success: false, message: "Invalid plan/cycle" });
        }

        const branch = await Branch.findById(branch_id);
        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }

        const razorpayPlanId = plan.razorpayPlans[billingCycle];

        const totalCountMap = { monthly: 12, quarterly: 4, halfYearly: 2, yearly: 1 };

        // update many

        const updateMany = await BranchSubscription.updateMany(
            {
                plan_id: plan_id,
                branch_id: branch_id,
                status: 'created'
            },
            { $set: { status: "expired" } }
        )

        const priceMap = {
            monthly: plan.monthlyPrice,
            quarterly: plan.quarterlyPrice,
            halfYearly: plan.halfYearlyPrice,
            yearly: plan.yearlyPrice,
        };

        // Razorpay se subscription create karo
        const rzpSubscription = await razorpay.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_notify: 1,
            total_count: totalCountMap[billingCycle],
            notes: {
                branch_id,
                plan_id,
                billingCycle,
            },
        });

        // DB me record banao (status abhi 'created' hai — payment hone ke baad 'active' hoga)
        const branchSubscription = await BranchSubscription.create({
            branch_id,
            company_id: branch.company_id, // agar branch model me hai
            plan_id,
            razorpaySubscriptionId: rzpSubscription.id,
            razorpayPlanId,
            billingCycle,
            amount: priceMap[billingCycle],
            currency: "INR",
            totalCount: totalCountMap[billingCycle],
            status: rzpSubscription.status, // usually 'created'
            notes: { branch_id, plan_id, billingCycle },
        });



        const relation = await BranchSubscription.findOne({
            branch_id: branch._id,
            status: 'created'
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

        res.json({
            success: true,
            data: {
                subscription: rzpSubscription,
                branchSubscriptionId: branchSubscription._id,
                branch : {...branch.toObject(), plan: relation, permissions: permission_names},
            },
        });
    } catch (error) {
        console.error("Subscription create error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ---------------- Verify Subscription (post-checkout) ---------------- */

exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Matching record dhundo
        const branchSubscription = await BranchSubscription.findOne({
            razorpaySubscriptionId: razorpay_subscription_id,
        });

        if (!branchSubscription) {
            return res.status(404).json({ success: false, message: "Subscription record not found" });
        }

        // Latest status Razorpay se fetch karo (source of truth)
        const rzpSubscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

        branchSubscription.status = rzpSubscription.status;
        branchSubscription.isActive = rzpSubscription.status === "active";
        branchSubscription.lastPaymentId = razorpay_payment_id;
        branchSubscription.lastVerifiedAt = new Date();

        if (rzpSubscription.current_start) {
            branchSubscription.currentStart = new Date(rzpSubscription.current_start * 1000);
        }
        if (rzpSubscription.current_end) {
            branchSubscription.currentEnd = new Date(rzpSubscription.current_end * 1000);
        }
        if (!branchSubscription.startedAt && branchSubscription.isActive) {
            branchSubscription.startedAt = new Date();
        }

        await branchSubscription.save();

        // Optional: purani active subscriptions isi branch ki deactivate karo (agar upgrade/renew flow hai)
        if (branchSubscription.isActive) {
            await BranchSubscription.updateMany(
                {
                    branch_id: branchSubscription.branch_id,
                    _id: { $ne: branchSubscription._id },
                    isActive: true,
                },
                { $set: { isActive: false, status: "cancelled", endedAt: new Date() } }
            );
        }

        res.json({
            success: true,
            message: "Subscription verified",
            data: branchSubscription,
        });
    } catch (error) {
        console.error("Verify subscription error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
