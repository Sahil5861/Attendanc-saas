export interface Plan {
  _id: string;
  name: string;
  isCustom: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  status: boolean;
}

export interface Holiday {
    _id: string;
    companyId: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    date: string;
    isPaid: boolean;
    isOptional: boolean;
    appliesToAllBranches: boolean;
    branchIds: string[];
    isRecurring: boolean;
    status: boolean;
    createdBy: string;
    notes: string;
}

export interface Branch {
    _id: string;
    branchOwnerName: string;
    branchName: string;
    location: string;
    city: string;
    state: string;
    mobileNumber: string;
    email: string;
    password: string;
    status?: boolean;
}


export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  image: File | null | string;

  designation: {
    _id: string;
    name: string;
  };
  department: {
    _id: string;
    name: string;
  };
  joiningDate: string;
  employmentType: string;

  basicSalary: number;
  salaryType: string;

  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;

  password: string;
  isLoginEnabled: boolean;
  status: boolean;
}


export interface BranchSubscription {
  _id: string;

  branch_id: string | Branch;
  company_id?: string;
  plan_id: string | Plan;

  razorpaySubscriptionId: string;
  razorpayPlanId: string;
  razorpayCustomerId?: string;

  billingCycle: "monthly" | "quarterly" | "halfYearly" | "yearly";

  amount: number;
  currency: string;

  totalCount?: number;
  paidCount: number;

  status:
    | "created"
    | "authenticated"
    | "active"
    | "pending"
    | "halted"
    | "cancelled"
    | "completed"
    | "expired";

  currentStart?: string;
  currentEnd?: string;

  startedAt?: string;
  endedAt?: string;

  isActive: boolean;

  lastPaymentId?: string;
  lastVerifiedAt?: string;

  notes?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}
