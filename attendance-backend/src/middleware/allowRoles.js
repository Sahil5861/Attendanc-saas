module.exports = (roles = []) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userRole = req.user.role;

        if (!roles.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        next();
    };
};