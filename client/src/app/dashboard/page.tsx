"use client";

import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const router = useRouter();
  return(<>
    </>
  );
}