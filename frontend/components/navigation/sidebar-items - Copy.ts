import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  Building,
  User,
  Briefcase,
} from "lucide-react";

export const sidebarItems = [
  // Super Admin
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutDashboard,
    permission: null,
    panel: "SUPER_ADMIN",
  },
  {
    title: "Companies",
    href: "/super-admin/companies",
    icon: Building2,
    permission: "company.view",
    panel: "SUPER_ADMIN",
  },  
  
  // {
  //   title: "Branches",
  //   href: "/super-admin/branches",
  //   icon: Building,
  //   permission: 'branch.view',
  //   panel: "SUPER_ADMIN",
  // }, 
  {
    title: "Plans",
    href: "/super-admin/plans",
    icon: ShieldCheck,
    permission: "plan.view",
    panel: "SUPER_ADMIN",
  },

  {
    title: "Roles",
    href: "/super-admin/roles",
    icon: User,
    permission: "plan.view",
    panel: "SUPER_ADMIN",
  },

  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users,
    permission: "plan.view",
    panel: "SUPER_ADMIN",
  },

  // Company Admin
  {
    title: "Dashboard",
    href: "/company/dashboard",
    icon: LayoutDashboard,
    permission: null,
    panel: "COMPANY_ADMIN",
  },
  {
    title: "Branches",
    href: "/company/branches",
    icon: Building,
    permission: null,
    panel: "COMPANY_ADMIN",
  },



  {
    title: "Roles",
    href: "/company/roles",
    icon: Users,
    permission: "role.view",
    panel: "COMPANY_ADMIN",
  },


  {
    title: "Dashboard",
    href: "/branch/dashboard",
    icon: LayoutDashboard,
    permission: null,
    panel: "BRANCH_MANAGER",
  },
  {
    title: "Employees",
    href: "/branch/employees",
    icon: Users,
    permission: 'employee.view',
    panel: "BRANCH_MANAGER",
    hasAccess : "manage-employees"
  },

  {
    title: "Manage Designation",
    href: "/branch/designation",
    icon: Briefcase,
    permission: null,
    panel: "BRANCH_MANAGER",
    hasAccess : "manage-employees"
  },

  {
    title: "Manage Department",
    href: "/branch/department",
    icon: Briefcase,
    permission: null,
    panel: "BRANCH_MANAGER",
    hasAccess : "manage-employees"
  },


  {
    title: "Manage Attendance",
    href: "/branch/attendance",
    icon: Users,
    permission: null,
    panel: "BRANCH_MANAGER",
    hasAccess: "manage-employees"
  },


  // {
  //   title: "Manage Salary",
  //   href: "/branch/salary",
  //   icon: Users,
  //   permission: null,
  //   panel: "BRANCH_MANAGER",
  // },

  {
    title: "Plans",
    href: "/branch/plans",
    icon: Users,
    permission: null,
    panel: "BRANCH_MANAGER",
  },


  // Employee Dashboard 

  {
    title: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
    permission: null,
    panel: "EMPLOYEE",
  },
];