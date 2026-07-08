const bcrypt = require("bcryptjs");

const Role = require("../../models/Role");
const Permission = require("../../models/Permission");

const User = require("../../models/User");



exports.getRoles = async (req,res)=>{

    try {

        const roles = await Role.find()
            .sort({ createdAt: -1 });

        const data = await Promise.all(
            roles.map(async (role) => {

                const permissions = await Permission.find({
                    _id: { $in: role.permissions }
                });

                return {
                    ...role.toObject(),
                    permissions
                };
            })
        );

        return res.json({
            success: true,
            data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.getRole = async (req,res)=>{

    try{

        const role =
        await Role.findById(
            req.params.id
        )
        .populate(
            "adminUserId",
            "name email phone"
        );

        if(!role){

            return res.status(404)
            .json({
                success:false,
                message:
                "Company not found"
            });
        }

        return res.json({
            success:true,
            data:role
        });

    }
    catch(error){

        return res.status(500)
        .json({
            success:false
        });
    }
};

exports.createRoles = async (req, res) => {

    try {

        const {
            companyName,
            companyCode,
            ownerName,
            email,
            phone,
            gstNumber,
            address,

            adminName,
            adminEmail,
            adminPhone,

            password
        } = req.body;

        const companyExists =
            await Company.findOne({
                $or: [
                    {
                        email
                    },
                    {
                        companyCode
                    }
                ]
            });

        if (companyExists) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Company already exists"
                });
        }

        const userExists =
            await User.findOne({
                email: adminEmail
            });

        if (userExists) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Admin email already exists"
                });
        }

        const companyAdminRole =
            await Role.findOne({
                name: "COMPANY_ADMIN"
            });
            
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const adminUser =
            await User.create({

                name: adminName,

                email: adminEmail,

                phone: adminPhone,

                password: hashedPassword,

                role: 'COMPANY_ADMIN',

                roleId:
                    companyAdminRole._id
            });

        const gst = gstNumber;

        const role =
            await Company.create({

                companyName,

                companyCode,

                ownerName,

                email,

                phone,

                gst,

                address,

                adminUserId:
                    adminUser._id,

                createdBy:
                    req.user.id
            });

        adminUser.companyId =
            role._id;

        await adminUser.save();

        return res.status(201)
            .json({

                success: true,

                message:
                    "Company created successfully",

                role,

                credentials: {
                    email:
                        adminEmail,

                    password
                }
            });

    }
    catch (error) {

        console.log(error);

        return res.status(500)
            .json({
                success: false,
                message: "Server Error"
            });
    }
};


exports.updateRolePermissions = async (req, res)=>{

    try {
        const { id } = req.params;
        
        console.log(req.body, 'id : ', id);

        // return false;
        
        const {
            permissions
        } = req.body;


        const role = await Role.findByIdAndUpdate(
            id, 
            {
                permissions: permissions
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!role) {
            return res.status(400).json({
                status: false,
                message: "Role Not found"
            });
        }
        else{

            
            const new_permissions = await Permission.find({
                _id : {$in: role.permissions}
            }).select('name');
    
            return res.status(200).json({
                status: true,
                data:{
                    role: role,
                    permissions: new_permissions.map((permission) => {
                        return permission.name;
                    }),
                },
            });
        }

        
    } catch (error) {
        return res.status(500).json({
            status: false,          
        });
    }
     
}


