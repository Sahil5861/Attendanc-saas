import { Mail, MapPin, Phone } from "lucide-react";

interface Branch {
  _id: string;
  branchName: string;
  branchOwnerName: string;
  location: string;
  city: any;
  state: any;
  mobileNumber: string;
  email: string;
  status?: boolean;
  companyId?: string;
}

export default function BranchCard({
  branch,
  onClick
}: {
  branch: Branch;
  onClick : (b:Branch) => void;
}) {
  const initials = branch.branchName?.slice(0, 1).toUpperCase() ?? "B";
  const isActive = branch.status !== false;

  return (
    <div onClick={() => onClick(branch)} className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md shadow-sm transition-all duration-200 overflow-hidden flex flex-col cursor-pointer">

      {/* Top accent line */}
      <div className={`h-1 w-full ${isActive ? "bg-emerald-400" : "bg-slate-200"}`} />

      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* Header: avatar + name + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-base flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{branch.branchName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{branch.branchOwnerName}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${isActive
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2 flex-1">
          {(branch.city || branch.state || branch.location) && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={12} className="text-slate-300 flex-shrink-0" />
              <span className="truncate">
                {[branch.location, branch.city, branch.state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {branch.mobileNumber && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone size={12} className="text-slate-300 flex-shrink-0" />
              <span>{branch.mobileNumber}</span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail size={12} className="text-slate-300 flex-shrink-0" />
              <span className="truncate">{branch.email}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">          
        </div>

      </div>
    </div>
  );
}