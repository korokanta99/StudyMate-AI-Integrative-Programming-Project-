"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export const ADMIN_API_URL =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

const TOKEN_KEY = "studymate_admin_token";
const EMAIL_KEY = "studymate_admin_email";

type AdminAuthState = {
  loggedIn: boolean;
  loading: boolean;
  email: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

// ============================================================
// PROVIDER
//
// Admin sessions are intentionally separate from student auth
// (Cognito / MockAuth): a different token, stored under a
// different key, obtained from POST /admin/login rather than
// Cognito. This is a first-pass assumption — adjust once the
// real admin auth flow is decided.
// ============================================================

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedEmail = localStorage.getItem(EMAIL_KEY);

    if (token) {
      setLoggedIn(true);
      setEmail(savedEmail ?? "");
    }

    setLoading(false);
  }, []);

  async function signIn(identifier: string, password: string) {
    const response = await fetch(`${ADMIN_API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: identifier,
        password,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.message ?? "Invalid admin credentials."
      );
    }

    const data = await response.json();
    const token = data?.token ?? data?.accessToken;

    if (!token) {
      throw new Error("Admin login did not return a token.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, identifier);

    setLoggedIn(true);
    setEmail(identifier);
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);

    setLoggedIn(false);
    setEmail("");
  }

  return (
    <AdminAuthContext.Provider
      value={{ loggedIn, loading, email, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("AdminAuthProvider is required");
  }

  return context;
}

// ============================================================
// ROUTE GATE
// ============================================================

export function AdminAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedIn, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !loggedIn) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }, [loading, loggedIn, pathname, router]);

  if (loading || !loggedIn) {
    return null;
  }

  return <>{children}</>;
}

// ============================================================
// AUTHENTICATED FETCH HELPER
// ============================================================

export function getAdminToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export async function adminFetch(
  path: string,
  init?: RequestInit
) {
  const token = getAdminToken();

  const response = await fetch(`${ADMIN_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }

  return response;
}
