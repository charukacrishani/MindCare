"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from 'next/navigation'; 

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      const response = await apiClient.post('/login', formData)
      if (response.success) {
        router.push('/');
      }
    } catch (error) {
      // handle errors
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Sign in with Google");
    // Handle Google OAuth logic here
  };

  return (
    <div className="min-h-screen flex items-center  p-4 w-full">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-12 -translate-y-12 blur-2xl" />

        <CardHeader className="space-y-4 pb-4">
          {/* Logo and Title */}
          <div className="flex items-center justify-between">
            <img
              src="/images/logo3.png"
              alt="Logo"
              className="w-10 h-10 mr-2 opacity-20"
            />
            <h1 className="text-4xl font-medium text-[#980194] text-right">
              Sign in
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-6 ">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Email or Username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus-visible:ring-purple-400"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus-visible:ring-purple-400"
                required
              />
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg"
              size="lg"
            >
              Sign in
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-gray-400 text-sm">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-gray-200 hover:bg-gray-50"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-400 pt-1">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
