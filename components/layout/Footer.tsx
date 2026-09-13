import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#f5f3ee] py-8 text-sm text-[#41493c]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        {/* Copyright */}
        <span>
          © 2026 StudyMate AI. All rights reserved.
        </span>

        {/* Footer navigation */}
        <div className="flex gap-6">
          <Link
            href="/help"
            className="transition hover:text-[#2d6a1b]"
          >
            Help & Resources
          </Link>

          <Link
            href="/privacy"
            className="transition hover:text-[#2d6a1b]"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-[#2d6a1b]"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}