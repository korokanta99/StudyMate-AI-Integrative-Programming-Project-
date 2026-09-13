import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthGate } from "@/components/auth/MockAuth";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGate><div className="min-h-screen bg-[#fbf9f3] text-[#1b1c19]"><Header /><main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1200px] px-4 pb-4 pt-24 md:px-8">{children}</main><Footer /></div></AuthGate>
  );
}
