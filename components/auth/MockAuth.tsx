"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type SubscriptionStatus =
  | "free"
  | "trial"
  | "trial_cancelled"
  | "premium_monthly"
  | "premium_yearly";

type State = {
  loggedIn: boolean;
  pro: boolean;
  name: string;
  email: string;
  studentInfo: string;

  subscriptionStatus: SubscriptionStatus;

  updateProfile: (name: string, studentInfo: string) => void;
  signIn: () => void;
  signOut: () => void;

  startTrial: (plan: "monthly" | "yearly") => void;
  cancelTrial: () => void;
  activatePro: (plan: "monthly" | "yearly") => void;
};

const C = createContext<State | null>(null);

export function MockAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("free");

  const [name, setName] = useState("Alex Student");
  const [studentInfo, setStudentInfo] = useState(
    "Biology · Class of 2027"
  );

  useEffect(() => {
    setLoggedIn(localStorage.getItem("studymate-auth") === "yes");

    const savedSubscription =
      localStorage.getItem(
        "studymate-subscription"
      ) as SubscriptionStatus | null;

    if (savedSubscription) {
      setSubscriptionStatus(savedSubscription);
    }

    setReady(true);
  }, []);

  const pro =
    subscriptionStatus === "trial" ||
    subscriptionStatus === "trial_cancelled" ||
    subscriptionStatus === "premium_monthly" ||
    subscriptionStatus === "premium_yearly";

  const state: State = {
    loggedIn,
    pro,

    name,
    email: "alex.student@example.com",
    studentInfo,

    subscriptionStatus,

    updateProfile: (
      nextName: string,
      nextInfo: string
    ) => {
      setName(nextName);
      setStudentInfo(nextInfo);
    },

    signIn: () => {
      localStorage.setItem("studymate-auth", "yes");
      setLoggedIn(true);
    },

    signOut: () => {
      localStorage.removeItem("studymate-auth");
      setLoggedIn(false);
    },

    startTrial: (
      plan: "monthly" | "yearly"
    ) => {
      // The selected paid plan is remembered for the
      // subscription flow, but the user pays ₱0 during trial.
      localStorage.setItem(
        "studymate-trial-plan",
        plan
      );

      localStorage.setItem(
        "studymate-subscription",
        "trial"
      );

      setSubscriptionStatus("trial");
    },

    cancelTrial: () => {
      localStorage.setItem(
        "studymate-subscription",
        "trial_cancelled"
      );

      setSubscriptionStatus("trial_cancelled");
    },

    activatePro: (
      plan: "monthly" | "yearly"
    ) => {
      const status =
        plan === "monthly"
          ? "premium_monthly"
          : "premium_yearly";

      localStorage.setItem(
        "studymate-subscription",
        status
      );

      setSubscriptionStatus(status);
    },
  };

  return (
    <C.Provider value={state}>
      {ready ? children : null}
    </C.Provider>
  );
}

export function useMockAuth() {
  const v = useContext(C);

  if (!v) {
    throw Error("MockAuthProvider is required");
  }

  return v;
}

export function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedIn } = useMockAuth();
  const r = useRouter();
  const p = usePathname();

  useEffect(() => {
    if (!loggedIn) {
      r.replace(
        `/login?next=${encodeURIComponent(p)}`
      );
    }
  }, [loggedIn, p, r]);

  return loggedIn ? <>{children}</> : null;
}