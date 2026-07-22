const express = require("express");

const router = express.Router();
const State = require("../models/State");
const City = require("../models/City");
const User = require("../models/User");

const auth =
    require("../middleware/auth.middleware");

router.get(
    "/profile",
    auth,
    async (req, res) => {

        return res.json({
            success: true,
            user: req.user
        });

    }
);


router.get("/", async (req, res) => {
    return res.status(200).json({
        success: true, message: 'Testing is working withut user login !',
    });
})

router.post("/states", async (req, res) => {
    try {
        const data = await State.find({
            countryId: 101
        }).sort({ craeteAt: -1 });

        return res.status(200).json({
            success: true, data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: errro.message
        });
    }
});


router.post('/courses', async(req, res) =>{
    try{
        const courses = [
            {
                id: 1, 
                name: 'MBA'
            },
            {
                id: 1, 
                name: 'BBA'
            },
            {
                id: 1, 
                name: 'BCA'
            },
            {
                id: 1, 
                name: 'MCA'
            },
            {
                id: 1, 
                name: 'B.TECH'
            },


        ]
        return res.status(200).json({
            success: true, data: courses
        });
    }
    catch(error){
        return res.status(500).json({
            success: false, message: error.message
        });
    }
})


router.post("/cities-by-state/:id", async (req, res) => {

    try {
        const { id } = req.body;


        const data = await City.find({
            stateId: id
        }).sort({ craeteAt: -1 });

        return res.status(200).json({
            success: true, data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: errro.message
        });
    }



});


// send notification api :

// const admin = require("../config/firebase");
const { messaging } = require("../config/firebase"); // adjust path



router.post("/send-notification", async(req,res)=>{

    const token=req.body.token;

    const user = await User.findOne({
        fcmToken : token
    });

    if(user?.notificationStatus === false) {
        return res.status(400).json({
            success: false, message: 'Notificatiosn are disbaled for this user !',
        });
    }


    if (user?.fcmToken && user?.notificationStatus === true) {
        const message={
    
            notification:{
                title:"Attendance",
                body:"You have successfully checked in."
            },
    
            token:token
        };
        await messaging.send(message);
    }


    // await admin.messaging().send(message);

    res.json({
        success:true
    });

});


module.exports = router;