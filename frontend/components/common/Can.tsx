"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface Props {
  permission?: string;
  children: React.ReactNode;
}

export default function Can({ permission, children }: Props) {
  const permissions = useSelector(
    (state: RootState) => state.auth.permissions
  );

  // Permission nahi di gayi to show karo
  if (!permission) {
    return <>{children}</>;
  }

  // Permission di gayi hai to check karo
  if (!permissions?.includes(permission)) {
    return null;
  }

  return <>{children}</>;
}