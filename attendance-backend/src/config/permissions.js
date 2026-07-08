module.exports = {

  SUPER_ADMIN: [
    "*"
  ],

  COMPANY_ADMIN: [
    "branch.create",
    "branch.edit",
    "branch.delete",

    "employee.view",
    "employee.create",
    "employee.edit"
  ],

  BRANCH_MANAGER: [
    "employee.create",
    "employee.edit",

    "attendance.create",
    "attendance.edit",

    "salary.manage"
  ],

  EMPLOYEE: [
    "attendance.mark",
    "attendance.view",
    "salary.view"
  ]
};