"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import NavBar from './components/Navigator';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import Footer from './components/Footer';

interface User {
  id: string;
  first_name: string;
  email: string;
  role: string;
  isComplete: boolean;
}

export const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await apiClient.get<User>("/user/me");
        if (res.success) {
          setUser(res.data);
          if(!res.data.isComplete) {
            router.push("/complete-profile");
          }
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Auth failed:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className='w-full'><NavBar /></div>
        <div className='w-full flex-1'>{children}</div>
        <div className='w-full'><Footer /></div>
      </div>
    </UserContext.Provider>
  );
}