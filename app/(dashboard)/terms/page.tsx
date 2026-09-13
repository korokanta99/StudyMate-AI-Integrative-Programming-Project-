import Link from "next/link";

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p className="mt-2 text-sm text-[#697064]">
            Last updated: September 2026
          </p>
        </div>

        {/* Terms */}
        <div className="space-y-6 rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm md:p-8">
          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              1. Acceptance of Terms
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              By using StudyMate AI, you agree to these Terms of Service. If
              you do not agree with these terms, please do not use the
              application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              2. Use of StudyMate AI
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              StudyMate AI is designed to help students organize study
              materials, review information, create flashcards, and interact
              with AI-assisted study features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              3. Your Account
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              You are responsible for maintaining the security of your account
              and for the activity performed through your account. You should
              provide accurate account information and keep your login
              credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              4. Uploaded Content
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              You retain responsibility for the study materials and other
              content you upload to StudyMate AI. You must have the appropriate
              rights or permission to use any content you upload.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              5. AI-Generated Content
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              AI-generated responses are intended to support learning and
              studying. AI responses may occasionally contain errors or
              incomplete information and should be reviewed when accuracy is
              important.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              6. Pro Subscription
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              StudyMate AI may offer a 7-day Pro trial. Credit card details are
              required to start the trial. If you cancel during the trial
              period, you will not be charged and your Pro access will remain
              available until the end of the trial period.
            </p>

            <p className="mt-3 leading-7 text-[#697064]">
              If the trial is not cancelled before it ends, the selected
              subscription plan will begin. Available plans may include
              monthly and yearly billing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              7. Prohibited Use
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              You may not use StudyMate AI to violate applicable laws, infringe
              the rights of others, distribute harmful content, or interfere
              with the operation or security of the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              8. Availability
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              We may modify, suspend, or discontinue features of StudyMate AI
              as the application develops. We do not guarantee that every
              feature will always be available without interruption.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              9. Changes to These Terms
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              These Terms of Service may be updated as StudyMate AI develops.
              Updated terms will be made available through the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#263021]">
              10. Contact
            </h2>

            <p className="mt-2 leading-7 text-[#697064]">
              If you have questions about these Terms of Service, please
              contact the StudyMate AI team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}