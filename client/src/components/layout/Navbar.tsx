"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/authApi";
import toast from "react-hot-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header >
    </header>
  );
}
