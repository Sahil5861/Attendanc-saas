const jwt = require("jsonwebtoken");

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            companyId: user.companyId,
            branchId: user.branchId,
            employeeId: user.employeeId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

module.exports = {
    generateToken
};
