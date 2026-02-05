"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdayDay: "",
    birthdayMonth: "",
    birthdayYear: "",
    role: "user" as "user" | "counselor",
    password: "",
    agreedToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: "user" | "counselor") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google");
    // Handle Google OAuth logic here
  };

  return (
    <div className="min-h-screen flex items-center p-4 w-full">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-12 -translate-y-12 blur-2xl" />

        <CardHeader className="space-y-4 pb-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <img
              src="/images/logo3.png"
              alt="Logo"
              className="w-10 h-10 mr-2 opacity-20"
            />
            {/* Title */}
            <h1 className="text-4xl font-medium text-[#980194] text-right">
              Sign up
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto px-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus-visible:ring-purple-400"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus-visible:ring-purple-400"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus-visible:ring-purple-400"
                required
              />
            </div>

            {/* Birthday */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Birthday
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="text"
                  name="birthdayDay"
                  placeholder="DD"
                  maxLength={2}
                  value={formData.birthdayDay}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 text-center placeholder:text-gray-300 focus-visible:ring-purple-400"
                />
                <Input
                  type="text"
                  name="birthdayMonth"
                  placeholder="MM"
                  maxLength={2}
                  value={formData.birthdayMonth}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 text-center placeholder:text-gray-300 focus-visible:ring-purple-400"
                />
                <Input
                  type="text"
                  name="birthdayYear"
                  placeholder="YYYY"
                  maxLength={4}
                  value={formData.birthdayYear}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 text-center placeholder:text-gray-300 focus-visible:ring-purple-400"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.role === "user" ? "default" : "outline"}
                  onClick={() => handleRoleChange("user")}
                  className={
                    formData.role === "user"
                      ? "bg-gradient-to-r from-purple-300 to-purple-400 text-purple-900 hover:from-purple-400 hover:to-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-300 hover:bg-white"
                  }
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={
                    formData.role === "counselor" ? "default" : "outline"
                  }
                  onClick={() => handleRoleChange("counselor")}
                  className={
                    formData.role === "counselor"
                      ? "bg-gradient-to-r from-purple-300 to-purple-400 text-purple-900 hover:from-purple-400 hover:to-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-300 hover:bg-white"
                  }
                >
                  Counselor
                </Button>
              </div>
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

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="agreedToTerms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    agreedToTerms: checked === true,
                  }))
                }
                className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label
                htmlFor="agreedToTerms"
                className="text-sm text-gray-600 font-normal cursor-pointer"
              >
                I agree to{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  terms & Conditions
                </a>
              </Label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg"
              size="lg"
            >
              Sign up
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

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-400 pt-1">
              Already have an account?{" "}
              <a href="/signin" className="text-blue-500 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
