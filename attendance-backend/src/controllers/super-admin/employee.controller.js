const bcrypt = require("bcryptjs");
const { getDistanceInMeters } = require("../../utils/geo");


const User = require("../../models/User");
const Branch = require("../../models/Branch");
const Employee = require('../../models/Employee');
const Role = require("../../models/Role");
const Attendance = require("../../models/Attendance");


const EmployeeSalary = require("../../models/EmployeeSalary");
const BranchSettings = require("../../models/BranchSettings");

exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;


    const employee = await Employee.findById(id)
        .populate('designation')
        .populate('department')


    if (employee) {
        return res.status(200).json({
            success: true,
            data: employee
        });
    }
    else {
        return res.status(400).json({
            success: false,
            message: 'Employee Not found'
        });
    }

}

exports.getEmployees = async (req, res) => {

    try {

        const branch_id = req.get('X-Branch-Id');
        const employees = await Employee.find({
            branch_id: branch_id
        })
            .populate('designation')
            .populate('department')
            .sort({ createdAt: -1 });

        if (employees) {

            const employeeWithAttendance = await Promise.all(
                employees.map(async (employee) => {
                    const attendance = await Attendance.find({ employeeId: employee._id });
                    const name = `${employee.firstName} ${employee.lastName}`;

                    const user = await User.findOne({
                        employeeId: employee._id
                    });

                    return {
                        ...employee.toObject(), attendance, name, user
                    }
                })
            )

            return res.status(200).json({
                success: true,
                data: employeeWithAttendance
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'No Employees found'
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: 'Server Error hai ye'
        });
    }
}

exports.createEmployees = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, gender, dateOfBirth, designation, department, joiningDate, employmentType, basicSalary, salaryType, address, city,
            state, country, pincode, shiftName, shiftStartTime, shiftEndTime, password, isLoginEnabled, status
        } = req.body;


        console.log('req.body : ', req.body);
        console.log('req.file : ', req.file);


        // return;
        const branchId = req.get('X-Branch-Id');

        const image = req.file ? req.file.filename : null;


        const exists = await User.find({ email });

        if (exists.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this name already exists',
            });
        }

        const branch = await Branch.findById(branchId);




        const employee = await Employee.create({
            branch_id: branchId,
            image: image,
            company_id: branch.companyId, firstName, lastName, email, phone, gender, dateOfBirth, designation,
            department, joiningDate, employmentType, basicSalary, salaryType, address, city, state, country,
            pincode, shiftName, shiftEndTime, shiftStartTime, isLoginEnabled, status
        });


        employee.employeeCode = `EMP-${employee._id.toString().slice(-6).toUpperCase()}`;

        await employee.save();


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        if (employee) {

            const myrole = await Role.findOne({
                name: "EMPLOYEE"
            });
            const user = User.create({
                employeeId: employee._id,
                email,
                name: `${firstName} ${lastName}`,
                phone: phone,
                realPassword: password,
                password: hashedPassword,
                role: "EMPLOYEE",
                roleId: myrole._id,
            })


            return res.status(200).json({
                success: true,
                data: employee,
            });
        }

    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
}

exports.updateEmployees = async (req, res) => {
    try {

        const { id } = req.params;

        const branchId = req.get('X-Branch-Id');

        const {
            firstName, lastName, email, phone, gender, dateOfBirth, designation, department, joiningDate, employmentType, basicSalary, salaryType, address, city,
            state, country, pincode, shiftName, shiftStartTime, shiftEndTime, password, isLoginEnabled, status
        } = req.body;


        const branch = await Branch.findById(branchId);

        const employee = await Employee.findByIdAndUpdate(
            id,
            {
                branch_id: branchId,
                company_id: branch.companyId,
                firstName,
                lastName,
                email,
                phone,
                gender,
                dateOfBirth,
                designation,
                department,
                joiningDate,
                employmentType,
                basicSalary,
                salaryType,
                address,
                city,
                state,
                country,
                pincode,
                shiftName,
                shiftEndTime,
                shiftStartTime,
                isLoginEnabled,
                status,
            });

        if (employee) {

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );
            // const user = await User.findOne({
            //     employeeId: employee._id
            // });

            // if (user) {
            //     user.name = `${firstName} ${lastName}`;
            //     user.email = email;
            //     user.phone = phone;
            //     user.password = hashedPassword;
            //     user.realPassword = password;
            //     user.save();

            // }

            const myrole = await Role.findOne({
                name: "EMPLOYEE"
            });

            const user = User.findOneAndUpdate(
                {
                    employeeId: employee._id
                },

                {
                    email,
                    name: `${firstName} ${lastName}`,
                    phone: phone,
                    realPassword: password,
                    password: hashedPassword,
                    role: "EMPLOYEE",
                    roleId: myrole._id,
                })
            return res.status(200).json({
                success: true,
                data: employee,
            });
        }

    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
}


const ALLOWED_FIELDS = ["status", "isLoginEnabled", "siteCheckinEnabled"];

exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const body = req.body;

        console.log('body : ', body);

        const update = {};

        for (const field of ALLOWED_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                if (typeof body[field] !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be a boolean value`,
                    });
                }
                update[field] = body[field];
            }
        }


        console.log('update : ', update);

        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided to update",
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });

    }

    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, message: error.message
        })
    }

}

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByIdAndDelete(id);

        if (employee) {

            // delete user too
            const user = await User.findOne(
                { employeeId: id }
            );

            if (user) {
                await User.findOneAndDelete(
                    { employeeId: id }
                );
            }

            return res.status(200).json({
                success: true,
                message: 'Employee Deleted successfully'
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Something went wrong'
            })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: true,
            message: 'Server Error'
        })
    }
}


const MAX_ALLOWED_DISTANCE_METERS = 50;

const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: minutes === 0 ? undefined : "2-digit",
        hour12: true,
    });
};

// checn and checkout
exports.chekinEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkin, latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Location (latitude/longitude) is required to check in",
            });
        }

        // Fetch employee FIRST — branchId depends on this.
        const employee = await Employee.findById(id);


        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const branchId = employee.branch_id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const siteCheckinEnabled = employee.siteCheckinEnabled;


        const branchSettings = await BranchSettings.findOne({ branchId });

        if (!siteCheckinEnabled) {

            // check for locatin of employee before proceed


            if (!branchSettings || branchSettings.latitude == null || branchSettings.longitude == null) {
                return res.status(400).json({
                    success: false,
                    message: "Branch location is not configured. Please contact admin.",
                });
            }

            const branchLat = branchSettings.latitude;
            const branchLng = branchSettings.longitude;

            const distance = getDistanceInMeters(
                Number(latitude),
                Number(longitude),
                Number(branchLat),
                Number(branchLng)
            );

            if (distance > MAX_ALLOWED_DISTANCE_METERS) {
                return res.status(200).json({
                    success: false,
                    message: `You are too far from your branch to check in (${Math.round(
                        distance
                    )}m away, must be within ${MAX_ALLOWED_DISTANCE_METERS}m)`,
                });
            }
        }


        if (branchSettings?.startTime) {

            const [startHour, startMinute] = branchSettings.startTime
                .split(":")
                .map(Number);

            const now = new Date();

            const startTime = new Date();

            startTime.setHours(startHour, startMinute, 0, 0);

            if (now < startTime) {
                return res.status(400).json({
                    success: false,
                    message: `Check-in starts at ${ formatTime(branchSettings.startTime)}`,
                });
            }
        }



        const exist = await Attendance.findOne({
            employeeId: id,
            branchId: employee.branch_id,
            status: "present",
            attendanceDate: today,
        });

        if (exist) {
            return res.status(200).json({
                success: true,
                message: "Already Checkedin",
            });
        }

        const attendance = await Attendance.create({
            employeeId: id,
            branchId: employee.branch_id,
            checkin: checkin,
            attendanceDate: today,
            status: "present",
            checkinLatitude: latitude,
            checkinLongitude: longitude,
        });

        if (attendance) {
            return res.status(200).json({
                success: true,
                message: "chekin successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "something went wrong",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
};


exports.chekoutEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkout, latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Location (latitude/longitude) is required to check out",
            });
        }

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const branchId = employee.branch_id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const branchSettings = await BranchSettings.findOne({ branchId });

        if (!branchSettings || branchSettings.latitude == null || branchSettings.longitude == null) {
            return res.status(400).json({
                success: false,
                message: "Branch location is not configured. Please contact admin.",
            });
        }

        const distance = getDistanceInMeters(
            Number(latitude),
            Number(longitude),
            Number(branchSettings.latitude),
            Number(branchSettings.longitude)
        );

        if (distance > MAX_ALLOWED_DISTANCE_METERS) {
            return res.status(200).json({
                success: false,
                message: `You are too far from your branch to check out (${Math.round(
                    distance
                )}m away, must be within ${MAX_ALLOWED_DISTANCE_METERS}m)`,
            });
        }

        const attendance = await Attendance.findOne({
            employeeId: id,
            branchId: employee.branch_id,
            status: "present",
            attendanceDate: today,
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: "No check-in record found for today",
            });
        }

        const checkinTime = new Date(attendance.checkin);
        const checkoutTime = new Date(checkout);

        const diffMs = checkoutTime - checkinTime;

        const workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

        attendance.checkout = checkout;
        attendance.workingHours = workingHours;
        attendance.isAutoCheckout = false;
        attendance.checkoutLatitude = latitude;
        attendance.checkoutLongitude = longitude;

        await attendance.save();

        return res.status(200).json({
            success: true,
            data: attendance,
            message: "Checkout successfully!",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
};



exports.updateAttendance = async (req, res) => {
    try {
        const { id, employeeId, checkIn, checkOut, attendanceDate, status, workingHours } = req.body;


        const employee = await Employee.findById(employeeId);


        const data = {
            employeeId: employeeId,
            branchId: employee.branch_id,
            attendanceDate: attendanceDate,
            checkin: checkIn,
            checkout: checkOut,
            workingHours: workingHours,
            status: status
        };



        const attendance = id !== '' ? await Attendance.findByIdAndUpdate(id, data) : await Attendance.create(data);

        return res.status(200).json({
            success: true, message: 'Attendance Updated successfully !',
            data: attendance
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, message: 'Server Error'
        });
    }
}


const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getMonthRangeUTC(month, year) {
    // Start of `month` (1-12) in IST, converted to UTC
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - IST_OFFSET_MS);
    // Start of the next month in IST, converted to UTC (exclusive upper bound)
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0) - IST_OFFSET_MS);
    return { start, end };
}

exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);


        if (!id || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID, month and year are required'
            });
        }

        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month. Please provide a month between 1 and 12.'
            });
        }

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year is required'
            });
        }


        const { start, end } = getMonthRangeUTC(month, year);

        console.log(`Fetching attendance for employee ${id} from ${start.toISOString()} to ${end.toISOString()}`);



        const record = await Attendance.find({
            employeeId: id,
            attendanceDate: {
                $gte: start,
                $lt: end
            }
        }).sort({ attendanceDate: 1 });

        return res.status(200).json({
            success: true,
            data: record
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}


exports.getEmployeeSalary = async (req, res) => {

    try {
        const branchId = req.get("X-Branch-Id");

        const salaries = await EmployeeSalary.find({
            branchId: branchId
        }).populate('employeeId');


        return res.status(200).json({
            success: true,
            data: salaries,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false
        });

    }
}

exports.createEmployeeSalary = async (req, res) => {
    try {

        const branchId = req.get("X-Branch-Id");

        const {
            employeeId,
            basicSalary,
            earnings,
            deductions,
            fines,
            note,
        } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee is required.",
            });
        }

        const exists = await EmployeeSalary.findOne({
            employeeId,
            branchId,
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Salary already exists for this employee.",
            });
        }

        const salary = await EmployeeSalary.create({
            employeeId,
            branchId,
            basicSalary,
            earnings,
            deductions,
            fines,
            note,
        });

        return res.status(201).json({
            success: true,
            message: "Employee salary created successfully.",
            data: salary,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


exports.updateEmployeeSalary = async (req, res) => {
    try {
        const { id } = req.params;

        const branchId = req.get("X-Branch-Id");

        const {
            employeeId,
            basicSalary,
            earnings,
            deductions,
            fines,
            note,
        } = req.body;

        const salary = await EmployeeSalary.findById(id);

        if (salary) {
            await EmployeeSalary.findByIdAndUpdate(
                id, {
                employeeId,
                branchId,
                basicSalary,
                earnings,
                deductions,
                fines,
                note,
            }
            )

            return res.status(200).json({
                success: true,
                message: 'Salary updated successfully !'
            });
        }

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
}

