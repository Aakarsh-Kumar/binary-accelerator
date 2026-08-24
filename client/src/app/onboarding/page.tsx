"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Footer from "@/components/utils/Footer";
import { useIsMobile } from "@/hooks/use-mobile";



export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const isMobile = useIsMobile();

  return (
    <div>

      <Footer />
    </div>
  );
}
