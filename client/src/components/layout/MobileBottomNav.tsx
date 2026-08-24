"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home} from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav></nav>
  );
}
