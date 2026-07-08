const express = require("express");
const router = express.Router();


const paymentController = require("../controllers/super-admin/payment.controller");


router.get("/", async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Payment route is working'
    })
})

router.post("/create-order", paymentController.createOrder);
router.post("/verify-payment", paymentController.verifyPayment);


router.post("/create-order-for-plan", paymentController.createOrderForPlan);


module.exports = router;