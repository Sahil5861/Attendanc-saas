// hooks/usePermission.ts

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const usePermission = () => {
  let permissions = useSelector((state: RootState) => state.auth.permissions);

  const perms = typeof window !== 'undefined' ? localStorage.getItem('activeBranch') || '' : "";

  if (perms) {
    const parsed = JSON.parse(perms);

    permissions = parsed?.permissions;
  }

  const initialized = useSelector(
    (state: RootState) => perms ? true :  state.auth.initialized 
  )

  const plan = useSelector(
    (state: RootState) => state.auth.plan 
  )

  return {
    initialized,
    plan,
    can: (permission: string) =>
      permissions?.includes(permission),
  };
};