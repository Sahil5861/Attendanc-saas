const bcrypt = require("bcryptjs");

const Permission = require("../../models/Permission");

const User = require("../../models/User");



exports.getAllPermissions = async (req,res)=>{

    try {

        const permissions = await Permission.find()
            .sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            data: permissions
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.createPermissions = async (req, res) => {
    try {

        const { name, module, description } = req.body;

        const exist = await Permission.findOne({ name });

        if (exist) {
            return res.status(400).json({
                success: false,
                message: "This permission already exists",
            });
        }

        const permission = await Permission.create({
            name,
            module,
            description,
        });

        return res.status(201).json({
            success: true,
            data: permission,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
