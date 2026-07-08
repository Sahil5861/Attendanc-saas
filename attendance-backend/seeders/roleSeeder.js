require("dotenv").config();

const mongoose = require("mongoose");

const Role =
require("../src/models/Role");

const Permission =
require("../src/models/Permission");

mongoose.connect(
    process.env.MONGO_URI
);

async function seedRoles() {

    try {

        const allPermissions =
        await Permission.find();

        const getIds = (names) =>
            allPermissions
            .filter(p =>
                names.includes(p.name)
            )
            .map(p => p._id);

        // SUPER ADMIN

        await Role.updateOne(
            {
                name: "SUPER_ADMIN"
            },
            {
                $set: {
                    name: "SUPER_ADMIN",
                    isSystemRole: true,
                    permissions:
                    allPermissions.map(
                        p => p._id
                    )
                }
            },
            {
                upsert: true
            }
        );

        // COMPANY ADMIN

        await Role.updateOne(
            {
                name: "COMPANY_ADMIN"
            },
            {
                $set: {
                    isSystemRole: true,
                    permissions: getIds([
                        "branch.create",
                        "branch.view",
                        "branch.edit",

                        "employee.create",
                        "employee.view",
                        "employee.edit",

                        "attendance.view",

                        "salary.view"
                    ])
                }
            },
            {
                upsert: true
            }
        );

        // BRANCH MANAGER

        await Role.updateOne(
            {
                name: "BRANCH_MANAGER"
            },
            {
                $set: {
                    isSystemRole: true,
                    permissions: getIds([
                        "employee.create",
                        "employee.view",
                        "employee.edit",

                        "attendance.create",
                        "attendance.view",
                        "attendance.edit",

                        "salary.manage",

                        "ledger.manage"
                    ])
                }
            },
            {
                upsert: true
            }
        );

        // EMPLOYEE

        await Role.updateOne(
            {
                name: "EMPLOYEE"
            },
            {
                $set: {
                    isSystemRole: true,
                    permissions: getIds([
                        "attendance.view",
                        "salary.view"
                    ])
                }
            },
            {
                upsert: true
            }
        );

        console.log(
          "Roles Seeded Successfully"
        );

        process.exit();

    } catch(error){

        console.log(error);

        process.exit(1);
    }
}

seedRoles();