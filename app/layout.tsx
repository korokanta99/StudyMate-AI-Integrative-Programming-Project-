import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MockAuthProvider } from "@/components/auth/MockAuth";
import { AdminAuthProvider } from "@/components/auth/AdminAuth";

const studyFont = Plus_Jakarta_Sans({
  variable: "--font-study",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "StudyMate AI",
  description: "AI-powered study assistant and active recall.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${studyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full"><AdminAuthProvider><MockAuthProvider>{children}</MockAuthProvider></AdminAuthProvider></body>
    </html>
  );
}
