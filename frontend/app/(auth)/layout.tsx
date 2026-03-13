"use client";
import { apiClient } from '@/lib/apiClient';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect if on verify-email page
    if (pathname === "/verify-email") {
      return;
    }

    const checkLogin = async () => {
      try {
        const response = await apiClient.get("/user/me");
        if (response.success) {
          // User is logged in, redirect to dashboard
          router.push('/');
        }
        // If not logged in, stay on the page
      } catch (error) {
        // User is not logged in, stay on the page
        console.log("User not logged in, staying on auth page");
      }
    };

    checkLogin();
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}