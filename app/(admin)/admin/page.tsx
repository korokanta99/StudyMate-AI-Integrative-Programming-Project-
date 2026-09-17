import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1000px]">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#2d6a1b]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#263021]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-[#697064]">
          Manage users, materials, and platform activity.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm transition hover:border-[#468432]"
        >
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
            👥
          </div>

          <h2 className="text-lg font-bold text-[#263021]">
            Users
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#697064]">
            View registered users, inspect activity, and disable
            or re-enable accounts.
          </p>
        </Link>

        <Link
          href="/admin/materials"
          className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm transition hover:border-[#468432]"
        >
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
            📄
          </div>

          <h2 className="text-lg font-bold text-[#263021]">
            Materials
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#697064]">
            Review study materials stored across all users for
            moderation and storage oversight.
          </p>
        </Link>

        <Link
          href="/admin/billing"
          className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm transition hover:border-[#468432]"
        >
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
            💳
          </div>

          <h2 className="text-lg font-bold text-[#263021]">
            Billing
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#697064]">
            View subscription and billing status across users.
          </p>
        </Link>
      </div>
    </div>
  );
}
