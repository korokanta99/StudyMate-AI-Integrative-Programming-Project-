import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#fbf9f3] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1000px]">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#2d6a1b]">
            Help & Resources
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#263021]">
            How can we help?
          </h1>

          <p className="mt-2 text-[#697064]">
            Find answers and resources to help you get the most out of
            StudyMate AI.
          </p>
        </div>

        {/* Help cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
              📚
            </div>

            <h2 className="text-lg font-bold text-[#263021]">
              Study Materials
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#697064]">
              Upload and organize your study materials so StudyMate AI can
              help you review them.
            </p>

            <Link
              href="/materials"
              className="mt-5 inline-block text-sm font-semibold text-[#2d6a1b] hover:underline"
            >
              Go to Materials →
            </Link>
          </section>

          <section className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
              🤖
            </div>

            <h2 className="text-lg font-bold text-[#263021]">
              Ask AI
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#697064]">
              Ask questions about your uploaded materials and get
              source-grounded answers.
            </p>

            <Link
              href="/ask-ai"
              className="mt-5 inline-block text-sm font-semibold text-[#2d6a1b] hover:underline"
            >
              Ask AI →
            </Link>
          </section>

          <section className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
              🧠
            </div>

            <h2 className="text-lg font-bold text-[#263021]">
              Flashcards
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#697064]">
              Review concepts using active recall and track what you know
              versus what you are still learning.
            </p>

            <Link
              href="/flashcards"
              className="mt-5 inline-block text-sm font-semibold text-[#2d6a1b] hover:underline"
            >
              View Flashcards →
            </Link>
          </section>

          <section className="rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#eaf3e6] text-xl">
              💳
            </div>

            <h2 className="text-lg font-bold text-[#263021]">
              Subscription
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#697064]">
              Learn about your Pro trial, monthly and yearly plans, and
              subscription settings.
            </p>

            <Link
              href="/subscription"
              className="mt-5 inline-block text-sm font-semibold text-[#2d6a1b] hover:underline"
            >
              View Subscription →
            </Link>
          </section>
        </div>

        {/* Contact section */}
        <section className="mt-6 rounded-2xl border border-[#dce8d7] bg-[#eef6eb] p-6">
          <h2 className="text-lg font-bold text-[#263021]">
            Still need help?
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#697064]">
            If you can't find what you're looking for, contact the
            StudyMate AI team for assistance.
          </p>

          <button
            type="button"
            className="mt-4 rounded-xl bg-[#2d6a1b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245616]"
          >
            Contact Support
          </button>
        </section>
      </div>
    </main>
  );
}