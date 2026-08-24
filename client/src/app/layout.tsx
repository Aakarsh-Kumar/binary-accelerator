import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { PwaProvider } from "@/providers/PwaProvider";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google"; // 1. Import the component

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#14B8A6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.template.in"),
  title: {
    default: "Template | Find People For Anything",
    template: "%s | Template",
  },
  description:
    "Template Description",
  keywords: [
    "template",
  ],
  authors: [{ name: "Aakarsh Kumar" }],
  creator: "Aakarsh Kumar",
  publisher: "Template",
  category: "template",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  applicationName: "Template",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Template",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/logo192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Template",
    title: "Template",
    description:
      "Template Description",
    url: "https://www.template.in",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Template",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Template",
    description:
      "Template Description",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Template",
  "url": "https://www.template.in",
  "logo": "https://www.template.in/logo192x192.png",
  "description":
    "Template Description",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Template",
  "url": "https://www.template.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.template.in/dashboard?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased font-sans overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, websiteSchema]),
          }}
        />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "temp-client-id"}>
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <PermissionProvider>
                  <PwaProvider>
                    {children}
                    <Toaster position="top-right" reverseOrder={false} />
                  </PwaProvider>
                </PermissionProvider>
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
        
        {/* 2. Add the component right before the closing body tag */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
      </body>
    </html>
  );
}
