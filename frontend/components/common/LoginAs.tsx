"use client";

import { ShieldAlert, LogOut } from "lucide-react";
import Button from "./Button";

interface LoginAsProps {
  adminName: string;
  userName: string;
  role: string;
  onExit?: () => void;
}

export default function LoginAs({
  adminName,
  userName,
  role,
  onExit,
}: LoginAsProps) {
  return (
    <div className="w-full border-b border-amber-300 bg-amber-50">
      <div className="flex items-center justify-between gap-4 px-6 py-2">

        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />

          <p className="text-sm text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="font-semibold text-slate-900">
              Login As Mode
            </span>

            <span className="mx-2 text-slate-400">•</span>

            You are currently accessing the account of{" "}
            <span className="font-semibold text-slate-900">
              {userName}
            </span>

            <span className="text-amber-700">
              {" "}
              ({role.replaceAll("_", " ")})
            </span>

            <span className="mx-2 text-slate-400">•</span>

            Logged in by{" "}
            <span className="font-semibold text-slate-900">
              {adminName}
            </span>
          </p>
        </div>

        {/* Right */}
        {onExit && (
        //   <button
        //     onClick={onExit}
        //     className="flex-shrink-0 inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
        //   >
        //     <LogOut size={16} />
        //     Exit
        //   </button>

        <Button
            title="Exit"
            type="danger"
            onClick={onExit}
            icon={<LogOut size={16}/>}
        />
        )}
      </div>
    </div>
  );
}