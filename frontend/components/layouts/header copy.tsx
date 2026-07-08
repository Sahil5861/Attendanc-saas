"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBranches } from "@/services/company.service";

import Cookies from "js-cookie";
import { setActiveBranch, clearActiveBranch } from "@/store/slices/branchSlice";
import LoginAs from "../common/LoginAs";


interface Branch {
  _id: string;
  branchName: string;
}

export default function Header() {

  const user = useSelector(
    (state: RootState) => state.auth.user
  )


  console.log('user : ', user);
  

  const role = user?.role;

  const router = useRouter();


  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  // const [activeBranch, setActiveBranch] = useState<Branch>(null);

  const dispatch = useDispatch();

  const activeBranch = useSelector((state:RootState) => state.branch.activeBranch)


  const fetchBranches = async () => {
    try {

      setLoadingBranches(true);
      const res = await getBranches();

      console.log('res : ', res);


      const data = res?.data?.data || [];

      setBranches(data);      
    } catch (error) {
      console.error(error);
    }

    finally{
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    if(!role) return;
    if(role === 'COMPANY_ADMIN'){
      fetchBranches();
    }
  }, [role])

  useEffect(() => {    
    try {
      const branch = localStorage.getItem('activeBranch');

      console.log('active Branch : ', branch);
      
      if (branch) {
        // setActiveBranch(JSON.parse(branch));
        dispatch(setActiveBranch(JSON.parse(branch)))
      }
    } catch {
        // localStorage.removeItem("activeBranch");
    }
  }, [dispatch]);

  const handleSwitchBranch = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {

    const branchId = e.target.value;

    const branch = branches.find(
      (b) => b._id === branchId
    );

    if (!branch) return;

      localStorage.setItem("activeBranch",JSON.stringify(branch)
    );

    Cookies.set("active_branch_id", branch._id, {expires:7})

    // setActiveBranch(branch);

    dispatch(setActiveBranch(branch));

    router.push('/branch/dashboard');

    // router.replace("/branch/dashboard");
    // router.refresh();
    // window.location.reload();
  };

  const handleExitBranch = () => { localStorage.removeItem('activeBranch');

    Cookies.remove('active_branch_id');

    // setActiveBranch(null);
    dispatch(clearActiveBranch());
    router.push('/company/dashboard')

  }

  const rolesLabel: Record<string, string> = {

    'SUPER_ADMIN': 'Administration',
    'BRANCH_MANAGER': 'Branch Manager',
    'COMPANY_ADMIN': 'Company Administration',
  };



  return (
  
    <>
    {activeBranch && user && (

        <LoginAs
          adminName={user.name}
          userName={activeBranch.branchName}
          role="Branch Manager"
          onExit={handleExitBranch}
        />
    )}
      <header
        className="
          h-16
          bg-white
          backdrop-blur
          border-b
          border-slate-200
          flex
          items-center
          justify-between
          px-6
        "
      >
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              placeholder:text-slate-500
              w-72
              h-10
              pl-10 pr-4
              rounded-lg
              bg-slate-50
              border
              border-slate-200
              text-sm
              outline-none
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
              transition
            "
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">

          {user?.role === "COMPANY_ADMIN" && activeBranch &&
            branches.length > 0 && (

              <div className="flex items-center gap-2">

                <select
                  disabled={loadingBranches}
                  value={activeBranch?._id || ""}
                  onChange={handleSwitchBranch}
                  className="
          h-10
          min-w-[220px]
          px-3
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          text-sm
          font-medium
          text-slate-700
          outline-none
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-100
        "
                >
                  <option value="">
                    Select Branch
                  </option>

                  {branches.map((branch) => (
                    <option
                      key={branch._id}
                      value={branch._id}
                    >
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <button
            className="
              p-2
              rounded-lg
              hover:bg-slate-100
              transition
            "
          >
            <Bell size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-3">
            <UserCircle2
              size={36}
              className="text-emerald-600"
            />

            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </h4>

              <p className="text-xs text-slate-500">
                {rolesLabel[user?.role] || 'Member'}
              </p>
            </div>
          </div>
        </div>
      </header>    
    </>


  );
}