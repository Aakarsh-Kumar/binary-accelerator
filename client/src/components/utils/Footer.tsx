"use client";

import { useIsMobile } from "@/hooks/use-mobile";

const footerLinks = {
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer>

    </footer>
  );
}
