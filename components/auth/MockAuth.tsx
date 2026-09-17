"use client";

import {
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
} from "aws-amplify/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./amplify-config";

type AuthState = {
  loggedIn: boolean;
  loading: boolean;
  pro: boolean;
  name: string;
  email: string;
  username: string;
  studentInfo: string;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, studentInfo: string) => void;
  activatePro: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function MockAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pro, setPro] = useState(false);

  const [name, setName] = useState("Alex Student");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [studentInfo, setStudentInfo] = useState(
    "Biology · Class of 2027"
  );

  // Controls the inactivity warning modal
  const [showInactivityWarning, setShowInactivityWarning] =
    useState(false);

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();

        setLoggedIn(true);
        setUsername(user.username);
        setEmail(attributes.email ?? "");
        setName(attributes.name ?? "Alex Student");
      } catch {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // ============================================================
  // SIGN IN
  // ============================================================

  async function signIn(identifier: string, password: string) {
    const result = await cognitoSignIn({
      username: identifier,
      password,
    });

    if (result.isSignedIn) {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      setLoggedIn(true);
      setUsername(user.username);
      setEmail(attributes.email ?? "");
      setName(attributes.name ?? "Alex Student");
    }
  }

  // ============================================================
  // SIGN OUT
  // ============================================================

  async function signOut() {
    try {
      await cognitoSignOut();
    } finally {
      setLoggedIn(false);
      setUsername("");
      setEmail("");
      setShowInactivityWarning(false);
    }
  }

  // ============================================================
  // PROFILE
  // ============================================================

  function updateProfile(
    nextName: string,
    nextStudentInfo: string
  ) {
    setName(nextName);
    setStudentInfo(nextStudentInfo);
  }

  function activatePro() {
    setPro(true);
  }

  // ============================================================
  // INACTIVITY AUTO-LOGOUT
  //
  // 30 minutes without activity:
  // → Show warning
  //
  // Additional 3 minutes without activity:
  // → Automatically sign out
  //
  // Any activity during the warning:
  // → Cancel warning
  // → Restart 30-minute timer
  // ============================================================

  useEffect(() => {
    if (!loggedIn) {
      setShowInactivityWarning(false);
      return;
    }

    const WARNING_TIME = 30 * 60 * 1000; // 30 minutes
    const LOGOUT_TIME = 3 * 60 * 1000; // 3 additional minutes

    let warningTimer: ReturnType<typeof setTimeout>;
    let logoutTimer: ReturnType<typeof setTimeout>;

    // Automatically sign the user out
    const logoutDueToInactivity = async () => {
      try {
        await cognitoSignOut();
      } catch (error) {
        console.error(
          "Automatic logout failed:",
          error
        );
      } finally {
        setLoggedIn(false);
        setUsername("");
        setEmail("");
        setShowInactivityWarning(false);
      }
    };

    // Start/restart inactivity timers
    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      setShowInactivityWarning(false);

      // Show warning after 30 minutes
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);

        // Sign out after another 3 minutes
        logoutTimer = setTimeout(() => {
          logoutDueToInactivity();
        }, LOGOUT_TIME);
      }, WARNING_TIME);
    };

    // Any user activity resets the timer
    const handleActivity = () => {
      resetTimers();
    };

    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetTimers();

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [loggedIn]);

  // ============================================================
  // TEST STUDYMATE API
  // ============================================================

  async function testStudyMateApi() {
    try {
      const session = await fetchAuthSession();

      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error("No Cognito ID token found.");
        return;
      }

      const response = await fetch(
        "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com/materials/upload-url",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: "test-lecture.pdf",
            contentType: "application/pdf",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "StudyMate upload URL response:",
        {
          status: response.status,
          data,
        }
      );
    } catch (error) {
      console.error(
        "StudyMate upload URL test failed:",
        error
      );
    }
  }

  // ============================================================
  // EXPOSE API TEST TO BROWSER CONSOLE
  // ============================================================

  if (typeof window !== "undefined") {
    (
      window as Window & {
        testStudyMateApi?: () => Promise<void>;
      }
    ).testStudyMateApi = testStudyMateApi;
  }

  // ============================================================
  // AUTH STATE
  // ============================================================

  const state: AuthState = {
    loggedIn,
    loading,
    pro,
    name,
    email,
    username,
    studentInfo,
    signIn,
    signOut,
    updateProfile,
    activatePro,
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <AuthContext.Provider value={state}>
      {children}

      {/* ======================================================
          INACTIVITY WARNING
          ====================================================== */}

      {showInactivityWarning && loggedIn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "32px",
              textAlign: "center",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              🌱
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              Taking a little break?
            </h2>

            <p
              style={{
                margin: "0",
                color: "#666666",
                lineHeight: 1.6,
              }}
            >
              You've been inactive for a while.
              We'll sign you out soon to keep your
              account secure.
            </p>

            <p
              style={{
                margin: "16px 0 0",
                color: "#666666",
                lineHeight: 1.6,
              }}
            >
              Move your mouse or press any key to
              stay signed in.
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// ============================================================
// AUTH HOOK
// ============================================================

export function useMockAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "MockAuthProvider is required"
    );
  }

  return context;
}

// ============================================================
// AUTH GATE
// ============================================================

export function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedIn, loading } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !loggedIn) {
      router.replace(
        `/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }, [
    loading,
    loggedIn,
    pathname,
    router,
  ]);

  if (loading || !loggedIn) {
    return null;
  }

  return <>{children}</>;
}