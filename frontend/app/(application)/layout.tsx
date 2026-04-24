"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import NavBar from "./components/Navigator";
import { apiClient } from "@/lib/apiClient";
import { usePathname, useRouter } from "next/navigation";
import Footer from "./components/Footer";

export interface User {
  userid: string;
  username: string;
  first_name: string;
  email: string;
  role: string;
  isComplete: boolean;
}

export const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);

const ROLE_ACCESS: Record<string, string[]> = {
  "/counselors": ["admin", "user"],
  "/chat": ["admin", "user"],
  "/analyze": ["admin", "user"],
  "/profile": ["admin", "user", "counselor"],
  "/patient": ["admin", "counselor"],
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // 1. Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await apiClient.get<User>("/user/me");

        if (!res.success) {
          router.replace("/signin");
          return;
        }

        setUser(res.data);
        setAuthReady(true);

        if (!res.data.isComplete) {
          router.replace("/complete-profile");
          return;
        }

      } catch (error) {
        console.error("Auth failed:", error);
        router.replace("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user || !authReady) return;

    const protectedRoutes = Object.keys(ROLE_ACCESS);

    const matchedRoute = protectedRoutes.find((route) =>
      pathname.startsWith(route)
    );

    if (!matchedRoute) return;

    const allowedRoles = ROLE_ACCESS[matchedRoute];

    if (!allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [pathname, user, authReady]);

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full"><NavBar /></div>
        <div className="w-full flex-1">{children}</div>
        <div className="w-full"><Footer /></div>
      </div>
    </UserContext.Provider>
  );
}