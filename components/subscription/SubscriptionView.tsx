"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

import Icon from "@/components/ui/Icon";

const API_URL =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

const features = [
  {
    title: "Unlimited Vault (2GB)",
    description: "Multi-PDF grounding with instant document indexing",
    icon: "▣",
  },
  {
    title: "Timed Exam Drills",
    description: "Practice under realistic exam conditions",
    icon: "◷",
  },
  {
    title: "Verbatim Citations",
    description: "Get answers grounded directly in your study materials",
    icon: "▤",
  },
  {
    title: "Spaced Repetition AI",
    description: "Review cards based on your learning progress",
    icon: "✦",
  },
];

type BillingPlan = "monthly" | "yearly";

type SubscriptionData = {
  pro?: boolean;
  status?: string;
  plan?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export default function SubscriptionView() {
  const [plan, setPlan] = useState<BillingPlan>("yearly");
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [error, setError] = useState("");

  const isYearly = plan === "yearly";

  const monthlyPrice = 250;
  const yearlyPrice = 600;

  const billingLabel = isYearly
    ? `₱${yearlyPrice}/year`
    : `₱${monthlyPrice}/month`;

  useEffect(() => {
    async function loadSubscription() {
      try {
        setCheckingSubscription(true);
        setError("");

        const session = await fetchAuthSession();

        const token = session.tokens?.idToken?.toString();

        if (!token) {
          setIsPro(false);
          return;
        }

        const response = await fetch(`${API_URL}/subscription`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log(
          "SUBSCRIPTION RESPONSE:",
          response.status,
          JSON.stringify(data, null, 2)
        );

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to check subscription."
          );
        }

        const subscriptionData =
          data?.subscription &&
          typeof data.subscription === "object"
            ? data.subscription
            : data;

        setSubscription(subscriptionData);

        const backendPro =
          subscriptionData?.pro === true ||
          subscriptionData?.status === "active" ||
          subscriptionData?.status === "trialing";

        console.log("PRO STATUS:", backendPro);

        setIsPro(backendPro);
      } catch (err) {
        console.error("Subscription check failed:", err);
        setIsPro(false);
      } finally {
        setCheckingSubscription(false);
      }
    }

    loadSubscription();
  }, []);

  useEffect(() => {
    if (!subscription?.trialEnd) {
      setTimeRemaining("");
      return;
    }

    function updateTimer() {
      const end = new Date(
        subscription!.trialEnd!
      ).getTime();

      const now = Date.now();

      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining("Trial ended");
        return;
      }

      const totalSeconds = Math.floor(
        difference / 1000
      );

      const days = Math.floor(
        totalSeconds / 86400
      );

      const hours = Math.floor(
        (totalSeconds % 86400) / 3600
      );

      const minutes = Math.floor(
        (totalSeconds % 3600) / 60
      );

      const seconds = totalSeconds % 60;

      setTimeRemaining(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    }

    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [subscription?.trialEnd]);

  async function handleStartTrial() {
    try {
      setLoading(true);
      setError("");

      const session = await fetchAuthSession();

      const token = session.tokens?.idToken?.toString();

      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/billing/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CHECKOUT RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to start your Pro trial."
        );
      }

      if (!data?.checkoutUrl) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      window.location.href =
        data.checkoutUrl;
    } catch (err) {
      console.error(
        "Stripe checkout failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleManageMembership() {
    try {
      setLoading(true);
      setError("");

      const session = await fetchAuthSession();

      const token = session.tokens?.idToken?.toString();

      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/billing/portal`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "PORTAL RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to open membership management."
        );
      }

      if (!data?.portalUrl) {
        throw new Error(
          "Stripe Customer Portal URL was not returned."
        );
      }

      window.location.href =
        data.portalUrl;
    } catch (err) {
      console.error(
        "Stripe portal failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to open membership management."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSubscription) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(70,132,50,.08)] sm:p-8">
        <div className="absolute -right-36 -top-36 size-96 rounded-full bg-[#aff594]/20 blur-3xl" />

        <div className="relative flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[#d8e8d0] border-t-[#468432]" />

            <p className="mt-4 text-sm text-[#717a6b]">
              Checking your membership...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * PRO MEMBER
   */
  if (isPro) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(70,132,50,.08)] sm:p-8">
        <div className="absolute -right-36 -top-36 size-96 rounded-full bg-[#aff594]/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Status */}
          <span className="rounded-full bg-[#b4f48a]/50 px-3 py-1 text-sm font-semibold text-[#215100]">
            ✦ StudyMate AI Pro Member
          </span>

          {/* Pro icon */}
          <div className="mx-auto mt-8 grid size-20 place-items-center rounded-full bg-[#468432] text-3xl font-bold text-white">
            ✓
          </div>

          {/* Heading */}
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-[40px]">
            You&apos;re already{" "}
            <span className="text-[#2d6a1b]">
              Pro
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-lg text-[#41493c]">
            Your StudyMate AI Pro membership is active.
            You already have access to all Pro study
            features.
          </p>

          {/* Membership */}
          <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-[#f5f3ee] p-6 text-left">
            <div className="flex items-center justify-between border-b border-[#c1c9b8]/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-[#468432] text-white">
                  ★
                </span>

                <div>
                  <p className="font-semibold">
                    StudyMate Pro
                  </p>

                  <p className="text-sm text-[#717a6b]">
                    Premium membership
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#b4f48a] px-3 py-1 text-[11px] font-bold text-[#215100]">
                {subscription?.cancelAtPeriodEnd
                  ? "CANCELING"
                  : "PRO ACTIVE"}
              </span>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#717a6b]">
                  Plan
                </span>

                <span className="font-semibold capitalize">
                  {subscription?.plan ||
                    "Pro"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#717a6b]">
                  Status
                </span>

                <span className="font-semibold capitalize text-[#2d6a1b]">
                  {subscription?.status ||
                    "Active"}
                </span>
              </div>

              {subscription?.trialEnd && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#717a6b]">
                      Trial ends
                    </span>

                    <span className="font-semibold">
                      {new Date(
                        subscription.trialEnd
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {!subscription.cancelAtPeriodEnd &&
                    timeRemaining && (
                      <div className="mt-4 rounded-xl bg-[#b4f48a]/30 p-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#356b10]">
                          ⏳ Trial time remaining
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#215100]">
                          {timeRemaining}
                        </p>
                      </div>
                    )}
                </>
              )}

              {subscription?.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-[#717a6b]">
                    Current period ends
                  </span>

                  <span className="font-semibold">
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {subscription?.cancelAtPeriodEnd && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <p className="font-semibold text-amber-800">
                  ⚠️ Cancellation scheduled
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  Your Pro membership will remain
                  available until the end of your
                  current trial or billing period.
                </p>

                {subscription.currentPeriodEnd && (
                  <p className="mt-2 text-sm font-semibold text-amber-800">
                    Access ends{" "}
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pro features */}
          <div className="mt-8 rounded-2xl bg-[#f5f3ee] p-6 text-left">
            <h2 className="text-lg font-semibold">
              Your Pro features
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="text-[#2d6a1b]">
                    {feature.icon}
                  </span>

                  <b className="ml-2 text-sm">
                    {feature.title}
                  </b>

                  <p className="mt-1 text-sm text-[#41493c]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-xl bg-red-50 p-3 text-left text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Manage membership */}
          <button
            type="button"
            onClick={handleManageMembership}
            disabled={loading}
            className="mt-8 rounded-xl bg-[#f0eee8] px-5 py-3 text-sm font-semibold text-[#1b1c19] transition hover:bg-[#e5e2d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Opening membership..."
              : "Manage Membership"}
          </button>

          <p className="mt-3 text-xs text-[#717a6b]">
            Update your plan, payment method, or
            subscription through Stripe.
          </p>
        </div>
      </div>
    );
  }

  /*
   * FREE MEMBER
   */
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(70,132,50,.08)] sm:p-8">
      {/* Decorative background */}
      <div className="absolute -right-36 -top-36 size-96 rounded-full bg-[#aff594]/20 blur-3xl" />

      <div className="relative mx-auto mb-8 max-w-2xl text-center">
        {/* Trial badge */}
        <span className="rounded-full bg-[#b4f48a]/50 px-3 py-1 text-sm font-semibold text-[#215100]">
          ✦ Study Smarter · Stress Less
        </span>

        {/* Heading */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-[40px]">
          Upgrade to{" "}
          <span className="text-[#2d6a1b] underline decoration-wavy decoration-[#99d771]">
            StudyMate AI Pro
          </span>
        </h1>

        <p className="mt-3 text-lg text-[#41493c]">
          Supercharge your studying with unlimited
          AI-powered study tools, grounded answers,
          and active recall.
        </p>

        {/* Billing selector */}
        <div className="mx-auto mt-5 inline-flex rounded-full bg-[#f0eee8] p-1">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm ${
              !isYearly
                ? "bg-white text-[#2d6a1b] shadow"
                : "text-[#41493c]"
            }`}
          >
            Monthly · ₱250
          </button>

          <button
            type="button"
            onClick={() => setPlan("yearly")}
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isYearly
                ? "bg-white text-[#2d6a1b] shadow"
                : "text-[#41493c]"
            }`}
          >
            Yearly · ₱600
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative grid gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Pro features */}
          <section className="rounded-2xl bg-[#f5f3ee] p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <h2 className="text-lg font-semibold">
                Pro Academic Features
              </h2>

              <span className="text-[11px] font-bold text-[#356b10]">
                INCLUDED WITH PRO
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <span className="text-[#2d6a1b]">
                    {feature.icon}
                  </span>

                  <b className="ml-2 text-sm">
                    {feature.title}
                  </b>

                  <p className="mt-1 text-sm text-[#41493c]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">
                Payment Method
              </h2>

              <span className="text-xs text-[#717a6b]">
                🔒 Secure checkout
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-[#f5f3ee] p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-white font-bold shadow-sm">
                  💳
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Credit or Debit Card
                  </p>

                  <p className="text-xs text-[#717a6b]">
                    Securely processed by Stripe
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#717a6b]">
              Your card details are entered securely on
              Stripe Checkout. StudyMate does not store
              your card number, expiration date, or CVC.
            </p>
          </section>
        </div>

        {/* Right column */}
        <aside className="h-fit rounded-2xl bg-[#f5f3ee] p-6 shadow-sm lg:col-span-5">
          {/* Plan summary */}
          <div className="flex gap-3 border-b border-[#c1c9b8]/30 pb-4">
            <span className="grid size-12 place-items-center rounded-xl bg-[#468432] text-white">
              ★
            </span>

            <div>
              <b>
                StudyMate Pro{" "}
                {isYearly
                  ? "Yearly"
                  : "Monthly"}
              </b>

              <p className="text-sm text-[#41493c]">
                Full access to Pro study features
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 py-5 text-sm">
            <div className="flex justify-between">
              <span>Selected plan</span>

              <b>{billingLabel}</b>
            </div>

            <div className="flex justify-between text-[#2d6a1b]">
              <span>7-day Pro trial</span>

              <b>₱0</b>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between border-t border-[#c1c9b8]/30 pt-4 text-xl font-bold">
            <span>Total today</span>

            <span>₱0</span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Trial button */}
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#468432] py-3 font-semibold text-white transition hover:bg-[#2d6a1b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Opening secure checkout..."
              : "Start 7-Day Free Trial"}

            {!loading && (
              <Icon
                name="arrow"
                className="size-4"
              />
            )}
          </button>

          {/* Trial terms */}
          <p className="mt-3 text-center text-xs leading-5 text-[#717a6b]">
            You will not be charged today. Cancel
            anytime during your 7-day trial to avoid
            being charged. Your selected{" "}
            {isYearly
              ? "₱600/year"
              : "₱250/month"}{" "}
            plan starts after the trial if you do not
            cancel.
          </p>
        </aside>
      </div>
    </div>
  );
}