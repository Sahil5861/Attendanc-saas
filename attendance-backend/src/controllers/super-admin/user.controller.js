const bcrypt = require("bcryptjs");
const Role = require("../../models/Role");
const User = require("../../models/User");


exports.getUsers = async (req, res) => {

    try {
        const users = await User.find({}).sort({createdAt : -1});

        if (users){
            return res.status(200).json({
                success: true,
                data:users
            });
        }
        else{
            return res.status(400).json({
                success:false,
                message: 'Something went wrong !'
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
};


exports.updateStatus = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await User.findById(id);

        if (user) {
            user.status = !user.status;

            user.save();


            return res.status(200).json({
                success: true,
                message: 'Status updated successfuly ',
                data: user,
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: 'Something went wrong !'
            })
        }
        
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
        });

    }
}


