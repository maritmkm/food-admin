import type { Metadata } from "next";
import "./globals.css";
import RootLayoutContent from "./RootLayoutContent";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "serveflow.in — Food & Meal Subscription SaaS Platform",
  description: "Enterprise SaaS Platform for Cloud Kitchens, Meal Prep, and Daily Food Delivery Services by serveflow.in",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FBE7]">
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
