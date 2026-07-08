import {
  LayoutDashboard,
  Building,
  Building2,
  Users,
  User,
  ShieldCheck,
  Briefcase,
  CalendarDays,
  Clock3,
  Wallet,
  FileBarChart2,
  CreditCard,
  Settings,
  FileText,
} from "lucide-react";

export const sidebarItems = {

  SUPER_ADMIN: [

    {
      title: "Dashboard",
      href: "/super-admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Management",
      icon: Building2,
      children: [
        {
          title: "Companies",
          href: "/super-admin/companies",
          permission: "company.view",
          icon: Building2,
        },
        {
          title: "Plans",
          href: "/super-admin/plans",
          permission: "plan.view",
          icon: ShieldCheck,
        },
      ],
    },

    {
      title: "Access Control",
      icon: User,
      children: [
        {
          title: "Roles",
          href: "/super-admin/roles",
          permission: "role.view",
          icon: User,
        },
        {
          title: "Users",
          href: "/super-admin/users",
          permission: "user.view",
          icon: Users,
        },
      ],
    },
  ],

  COMPANY_ADMIN: [

    {
      title: "Dashboard",
      href: "/company/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Organization",
      icon: Building,
      children: [
        {
          title: "Branches",
          href: "/company/branches",
          icon: Building,
        },
      ],
    },

    {
      title: "Access Control",
      icon: Users,
      children: [
        {
          title: "Roles",
          href: "/company/roles",
          permission: "role.view",
          icon: Users,
        },
      ],
    },
  ],

  BRANCH_MANAGER: [

    {
      title: "Dashboard",
      href: "/branch/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Organization",
      icon: Building,
      children: [
        {
          title: "Departments",
          href: "/branch/department",
          icon: Building,
          hasAccess: "manage-employees",
        },
        {
          title: "Designations",
          href: "/branch/designation",
          icon: Briefcase,
          hasAccess: "manage-employees",
        },
        {
          title: "Teams",
          href: "/branch/teams",
          icon: Users,
          hasAccess: "manage-teams",
        },
        {
          title: "Shifts",
          href: "/branch/shifts",
          icon: Clock3,
          hasAccess: "manage-employees",
        },
      ],
    },

    {
      title: "Employees",
      icon: Users,
      children: [
        {
          title: "Employee List",
          href: "/branch/employees",
          permission: "employee.view",
          icon: Users,
          hasAccess: "manage-employees",
        },
        {
          title: "Attendance",
          href: "/branch/attendance",
          icon: CalendarDays,
          hasAccess: "manage-employees",
        },
        {
          title: "Leaves",
          href: "/branch/leaves",
          icon: CalendarDays,
          hasAccess: "manage-employees",
        },
      ],
    },

    {
      title: "Payroll",
      icon: Wallet,
      children: [
        {
          title: "Salary",
          href: "/branch/salary",
          icon: Wallet,
          hasAccess: "manage-payroll",
        },
        {
          title: "Payslips",
          href: "/branch/payslips",
          icon: FileText,
          hasAccess: "manage-payroll",
        },
      ],
    },

    {
      title: "Reports",
      href: "/branch/reports",
      icon: FileBarChart2,
      hasAccess: "reports",
    },

    {
      title: "Plans & Billing",
      href: "/branch/plans",
      icon: CreditCard,
    },

    {
      title: "Settings",
      href: "/branch/settings",
      icon: Settings,
    },
  ],

  EMPLOYEE: [

    {
      title: "Dashboard",
      href: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    
    {
      title: "Leaves",
      href: "/employee/leaves",
      icon: CalendarDays,
    },

    {
      title: "Payslips",
      href: "/employee/payslips",
      icon: Wallet,
    },

    {
      title: "Documents",
      href: "/employee/documents",
      icon: FileText,
    },

    {
      title: "Profile",
      href: "/employee/profile",
      icon: User,
    }
  ],
};