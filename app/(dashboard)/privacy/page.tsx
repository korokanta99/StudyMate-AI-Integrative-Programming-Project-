import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fbf9f3] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#2d6a1b] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-8 text-sm font-semibold text-[#2d6a1b]">
            StudyMate AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#263021]">
            Privacy Policy
          </h1>

          <p className="mt-2 text-sm text-[#697064]">
            Last updated: September 2026
          </p>
        </div>

        {/* Policy */}
        <div className="space-y-6 rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              1. Information We Collect
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              StudyMate AI may collect information you provide when creating
              an account, such as your name and email address. Study materials
              and other content you upload may also be stored so that the
              StudyMate AI features can provide study assistance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              2. How We Use Your Information
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              Information may be used to provide, maintain, and improve
              StudyMate AI, including features such as study materials,
              flashcards, and AI-assisted learning.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              3. Study Materials
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              Materials uploaded to StudyMate AI are used to provide study
              features and AI-generated assistance. You should only upload
              materials that you have permission to use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              4. Account Information
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              You are responsible for keeping your account information
              accurate and for maintaining the security of your account
              credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              5. Payments
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              If you subscribe to a paid StudyMate AI plan, payment
              information is handled through our payment provider. StudyMate
              AI does not need to directly store your complete card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              6. Data Security
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              We take reasonable measures to protect account information and
              uploaded content from unauthorized access, alteration, or
              disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              7. Third-Party Services
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              StudyMate AI may use third-party services to provide
              authentication, storage, AI processing, analytics, and payment
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              8. Changes to This Policy
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              This Privacy Policy may be updated as StudyMate AI develops.
              Any updated version will be made available through the
              application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              9. Contact
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              If you have questions about this Privacy Policy, please contact
              the StudyMate AI team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}