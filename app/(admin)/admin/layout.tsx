"use client";

import { usePathname } from "next/navigation";

import { AdminAuthGate } from "@/components/auth/AdminAuth";
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  const pathname = usePathname();

  // The login page has no session yet, so it renders outside the gate/header.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-[#fbf9f3] text-[#1b1c19]">
        <AdminHeader />

        <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-4 pb-10 pt-24 md:px-8">
          {children}
        </main>
      </div>
    </AdminAuthGate>
  );
}
