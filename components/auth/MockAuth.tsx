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

  async function signOut() {
    await cognitoSignOut();

    setLoggedIn(false);
    setUsername("");
    setEmail("");
  }

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

      console.log("StudyMate upload URL response:", {
        status: response.status,
        data,
      });
    } catch (error) {
      console.error(
        "StudyMate upload URL test failed:",
        error
      );
    }
  }

  if (typeof window !== "undefined") {
    (
      window as Window & {
        testStudyMateApi?: () => Promise<void>;
      }
    ).testStudyMateApi = testStudyMateApi;
  }

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

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("MockAuthProvider is required");
  }

  return context;
}

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
  }, [loading, loggedIn, pathname, router]);

  if (loading || !loggedIn) {
    return null;
  }

  return <>{children}</>;
}