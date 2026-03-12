"use client";
import { apiClient } from '@/lib/apiClient';
import path from 'path';
import React, { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = window.location.pathname;
  useEffect(()=> {
    if(pathName === "/verify-email") {
      return;
    }
    const checkLogin = async () => {
      try {
        const response = await apiClient.get("/user/me")
        if (response.success) {
          window.location.href = "/";
        }
      } catch (error) {
        window.location.href = "/signin";
      }
    }
    checkLogin();
  }, [])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}