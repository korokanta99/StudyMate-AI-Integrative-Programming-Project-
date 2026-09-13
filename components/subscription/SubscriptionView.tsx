"use client";

import { useState } from "react";

import Icon from "@/components/ui/Icon";

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

export default function SubscriptionView() {
  const [plan, setPlan] =
    useState<BillingPlan>("yearly");

  const [method, setMethod] =
    useState("Credit Card");

  const isYearly = plan === "yearly";

  const monthlyPrice = 250;
  const yearlyPrice = 650;

  const selectedPrice = isYearly
    ? yearlyPrice
    : monthlyPrice;

  const billingLabel = isYearly
    ? "₱650/year"
    : "₱250/month";

  function handleStartTrial() {
    // Stripe Sandbox integration will be added later.
    console.log(
      `Starting 7-day Pro trial with ${plan} plan`
    );
  }

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
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isYearly
                ? "bg-white text-[#2d6a1b] shadow"
                : "text-[#41493c]"
            }`}
          >
            Yearly · ₱650
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

            {/* Payment options */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["Credit Card", "Mastercard"].map(
                (paymentMethod) => (
                  <button
                    type="button"
                    key={paymentMethod}
                    onClick={() =>
                      setMethod(paymentMethod)
                    }
                    className={`rounded-xl p-3 text-xs font-semibold ${
                      method === paymentMethod
                        ? "bg-[#f5f3ee] text-[#2d6a1b] shadow-sm"
                        : "bg-white text-[#41493c]"
                    }`}
                  >
                    {paymentMethod}
                  </button>
                )
              )}
            </div>

            {/* Card details */}
            <div className="mt-5 space-y-3">
              <label className="block text-sm font-semibold">
                Cardholder Name

                <input
                  defaultValue="Alex Student"
                  className="mt-1 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                />
              </label>

              <label className="block text-sm font-semibold">
                Card Number

                <input
                  placeholder="•••• •••• •••• ••••"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-semibold">
                  Expiration

                  <input
                    placeholder="MM/YY"
                    className="mt-1 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  CVC / CVV

                  <input
                    placeholder="•••"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right column — checkout summary */}
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

          {/* Trial button */}
          <button
            type="button"
            onClick={handleStartTrial}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#468432] py-3 font-semibold text-white transition hover:bg-[#2d6a1b]"
          >
            Start 7-Day Free Trial

            <Icon
              name="arrow"
              className="size-4"
            />
          </button>

          {/* Trial terms */}
          <p className="mt-3 text-center text-xs leading-5 text-[#717a6b]">
            You will not be charged today. Cancel
            anytime during your 7-day trial to avoid
            being charged. Your selected{" "}
            {isYearly
              ? "₱650/year"
              : "₱250/month"}{" "}
            plan starts after the trial if you do not
            cancel.
          </p>
        </aside>
      </div>
    </div>
  );
}