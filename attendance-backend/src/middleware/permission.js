const User = require("../models/User");

module.exports =
(requiredPermission) =>
{
    return async (
        req,
        res,
        next
    ) => {

        const user =
        await User.findById(
            req.user.id
        )
        .populate({
            path: "roleId",
            populate: {
                path: "permissions"
            }
        });

        const permissions =
        user.roleId.permissions.map(
            p => p.name
        );

        if(
            !permissions.includes(
                requiredPermission
            )
        ){

            return res.status(403)
            .json({
                success:false,
                message:
                "Permission Denied"
            });
        }

        next();
    };
};