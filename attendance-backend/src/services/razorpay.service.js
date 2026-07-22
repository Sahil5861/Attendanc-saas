const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPlan = async (name, amount, period, interval) => {

    const plan = await razorpay.plans.create({
        period,
        interval,
        item: {
            name,
            amount: amount * 100, // paise
            currency: "INR"
        }
    });

    return plan.id;
};

const createRazorpayPlans = async ({ name, prices }) => {

    return {
        monthly: await createPlan(
            `${name} Monthly`,
            prices.monthlyPrice,
            "monthly",
            1
        ),

        quarterly: await createPlan(
            `${name} Quarterly`,
            prices.quarterlyPrice,
            "monthly",
            3
        ),

        halfYearly: await createPlan(
            `${name} Half Yearly`,
            prices.halfYearlyPrice,
            "monthly",
            6
        ),

        yearly: await createPlan(
            `${name} Yearly`,
            prices.yearlyPrice,
            "yearly",
            1
        )
    };
};

module.exports = {
    createRazorpayPlans
};