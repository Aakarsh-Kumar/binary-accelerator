"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { usePermissionStore, PermissionState } from "@/store/permissionStore";

export function PermissionProvider({ children }: { children: ReactNode }) {
  const setPermissions = usePermissionStore((state) => state.setPermissions);


  return <>{children}</>;
}
