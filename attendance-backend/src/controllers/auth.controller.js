const User = require("../models/User");
const Company = require("../models/Company");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");

const { generateToken } = require("../utils/jwt");
const { getUserPermissions, getCurrentPlan } = require("../utils/helper");
const Role = require("../models/Role");
const Captcha = require("../models/Captcha");
const transporter = require("../config/mail");
const Lead = require("../models/Lead");

const fs = require('fs');
const Handlebars = require("handlebars");


const path = require("path");
const crypto = require("crypto");



exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const user = await User.findOne({ email })
            .populate({
                path: "roleId",
                populate: {
                    path: "permissions"
                }
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        const isEmployee = user.employeeId !== null;

        if (isEmployee) {
            const employee = await Employee.findById(user.employeeId)

            const isLoginEnabled = employee.isLoginEnabled;

            if (!isLoginEnabled) {
                return res.status(403).json({
                    success: false,
                    message: 'Login is disabled, contact your branch manager'
                });
            }
        }

        const matched = await bcrypt.compare(
            password,
            user.password
        );

        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        user.lastLogin = new Date();

        await user.save();

        // return;
        const token = generateToken(user);

        const permissions = await getUserPermissions(user);
        const plan = await getCurrentPlan(user);


        // res.cookie(
        //     "accessToken",
        //     token,
        //     {
        //         httpOnly: true,
        //         secure: false,
        //         sameSite: "lax",
        //         maxAge: 7 * 24 * 60 * 60 * 1000
        //     }
        // )

        return res.status(200).json({
            success: true,
            token,
            user,
            permissions,
            plan
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.me = async (req, res) => {

    const user = await User.findById(req.user.id)
        .populate({
            path: "role",
            populate: {
                path: "permissions",
                select: "name"
            }
        });

    const role = await Role.findOne({
        name: user.role
    }).populate(
        "permissions",
        "name"
    );

    const permissions =
        role.permissions.map(
            p => p.name
        );

    const plan = await getCurrentPlan(user);
    return res.json({
        success: true,
        user,
        permissions,
        plan
    });
};

exports.initiate = async (req, res) => {
    try {
        const { companyName, email, phone } = req.body;

        // 6 digit otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedOTP = await bcrypt.hash(otp, 10);


        // send mail on email

        const filePath = path.join(__dirname, "../templates/otp-email.html");
        let source = fs.readFileSync(filePath, "utf8");

        const template = Handlebars.compile(source);

        const html = template({
            otp
        });
        // html = html.replace("{{otp}}", otp);


        const leadEmail = 'sahilkhan05861@gmail.com';

        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: leadEmail,
            subject: "Email Verification",
            html,
        });

        // create lead
        const lead = await Lead.create({
            companyName, email, phone, status: 'pending', otp: hashedOTP, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        return res.status(200).json({
            success: true,
            message: 'OTP Send Successfully !'
        })


    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, message: error.message
        });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const lead = await Lead.findOne({ email, status: "pending" });

        if (!lead) {
            return res.status(400).json({
                success: false,
                message: "No pending signup found for this email. Please sign up again.",
            });
        }

        if (lead.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        const isValid = await bcrypt.compare(otp, lead.otp);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP",
            });
        }

        // Double-check no account slipped in between initiate & verify
        const existingUser = await User.findOne({ email: lead.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please login instead.",
            });
        }

        // ── Create the actual account ──
        // A temporary password is generated since the signup form only collected
        // company name/email/phone — the user resets/uses this on first login.
        // (If you'd rather collect a password on this same page, let me know and
        // I'll wire that in instead of generating one.)
        const tempPassword = crypto.randomBytes(4).toString("hex"); // 8-char temp password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // ⚠️ Adjust this block to your actual Company/Role/User creation logic
        const company = await Company.create({
            companyName: lead.companyName,
            ownerName: lead.companyName,
            companyCode: code,
            email: lead.email,
            phone: lead.phone,
        });

        const adminRole = await Role.findOne({ name: "COMPANY_ADMIN" });

        const user = await User.create({
            email: lead.email,
            password: hashedPassword,
            realPassword: tempPassword,
            name: lead.companyName,

            companyId: company._id,
            roleId: adminRole?._id,
            role: "COMPANY_ADMIN",
        });

        lead.status = "completed";
        await lead.save();

        // ── Send success email ──
        const filePath = path.join(__dirname, "../templates/registration-success.html");
        const source = fs.readFileSync(filePath, "utf8");
        const template = Handlebars.compile(source);
        const html = template({
            companyName: lead.companyName,
            email: lead.email,
            tempPassword,
        });


        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: lead.email,
            subject: "Welcome to AttendSaaS — your account is ready",
            html,
        });

        const token = generateToken(user);
        const permissions = await getUserPermissions(user);
        const plan = await getCurrentPlan(user);


        return res.status(200).json({
            success: true,
            message: "Account created successfully",
            token,
            user,
            permissions,
            plan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const lead = await Lead.findOne({
            email: email,
            status: 'pending',
        });

        if (!lead) {

            return res.status(200).json({
                success: false, message: 'No pending signup found for this email. Please sign up again.'
            })
        }

        const otp = generateOtp();
        lead.otp = await bcrypt.hash(otp, 10);
        lead.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await lead.save();


        const filePath = path.join(__dirname, "../templates/otp-email.html");
        const source = fs.readFileSync(filePath, "utf8");
        const template = Handlebars.compile(source);
        const html = template({ otp });

        const leademail = 'sahilkhan05861@gmail.com';

        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: leademail,
            subject: "Your new verification code",
            html,
        });


        return res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.getCaptcha = async (req, res) => {
    try {
        const { length } = req.params;

        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let text = "";
        for (let i = 0; i < length; i++) {
            text += chars[Math.floor(Math.random() * chars.length)];
        }

        const captcha = await Captcha.create({
            text,
        });


        return res.status(200).json({
            success: true,
            data: {
                captcha: text,
                captchaId: captcha._id
            }
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, message: error.message,
        });
    }
}


exports.sendForgotPasswordOtp = async (req, res) => {

    try {
        console.log('body : ', req.body);


        const { email } = req.body;

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(400).json({
                success: false, message: ' User not found'
            });
        }

        const otp = generateOtp();

        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        const filePath = path.join(__dirname, "../templates/forgot-otp.html");
        const source = fs.readFileSync(filePath, "utf8");
        const template = Handlebars.compile(source);
        const html = template({ otp });

        const leademail = 'sahilkhan05861@gmail.com';

        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: leademail,
            subject: "Your new verification code to reset password",
            html,
        });

        return res.status(200).json({
            success: true,
            message: "OTP has been sent to youe email",
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json(error.message);
    }
}


exports.verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;


        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                messahe: 'Invalid User'
            });
        }
        else if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        const isValid = await bcrypt.compare(otp, user.otp);

        if (isValid) {
            return res.status(200).json({
                success: true, messahe: 'OTP verifies successfully !'
            })
        }
        else {
            return res.status(400).json({
                success: false, message: 'Invalid OTP'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false, message: error.message
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false, message: 'Passord is required'
            })
        }

        if (!confirmPassword) {            
            return res.status(400).json({
                success: false, message: 'Confirm Passord is required'
            })

        }


        if (password !== confirmPassword) {
            return res.status(400).json({
                success: fale, message: 'Pasword and confirm password is not match'
            })
        }


        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                messahe: 'User not found'
            })
        }

        
        const hashedPassword =await bcrypt.hash(password,10);
        
        user.realPassword = password;
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            success: true, message: 'Password resets successfully !'
        });

    }


    catch (error) {
            return res.status(500).json({
                success: false, message: error.message
            })
        }
}