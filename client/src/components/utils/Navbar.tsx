"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("");

  // Adjust state during render if screen size switches to desktop
  if (!isMobile && isMobileMenuOpen) {
    setIsMobileMenuOpen(false);
  }
  return (
    <header>
    </header>
  );
}
