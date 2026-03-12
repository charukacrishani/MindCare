"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/dist/client/components/navigation";


const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least one number (0–9)", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "At least one special character (*, &, _, %, $, #, @)",
    test: (p: string) => /[*&_%$#@]/.test(p),
  },
];

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "User" as "User" | "counselor",
    password: "",
    agreedToTerms: false,
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: "User" | "counselor") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const isPasswordValid = passwordRules.every((r) => r.test(formData.password));

  // Replace your existing handleSubmit with this:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isPasswordValid || !formData.agreedToTerms) return;

    try {
      const response = await apiClient.post("/register/", {
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      });

      if (response.success) {
        router.push('/verify-email');
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      const e = error as Error;
      setError(e.message || "An unexpected error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google");
  };

  return (
    <div className="min-h-screen flex items-center p-4 w-full">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-12 -translate-y-12 blur-2xl" />

        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <img
              src="/images/logo3.png"
              alt="Logo"
              className="w-10 h-10 mr-2 opacity-20"
            />
            <h1 className="text-4xl font-medium text-[#980194] text-right">
              Sign up
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto px-6">
          {error && (<div className="text-sm p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>)}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
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

            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
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

            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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

            {/* Role Selection */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.role === "User" ? "default" : "outline"}
                  onClick={() => handleRoleChange("User")}
                  className={
                    formData.role === "User"
                      ? "bg-gradient-to-r from-purple-300 to-purple-400 text-purple-900 hover:from-purple-400 hover:to-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-300 hover:bg-white"
                  }
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={formData.role === "counselor" ? "default" : "outline"}
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
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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

              {/* Password Rules — disappears once all are green */}
              {formData.password.length > 0 && !isPasswordValid && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(formData.password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        {passed ? (
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-xs transition-colors ${passed ? "text-green-600" : "text-gray-400"}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="agreedToTerms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }))
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
              disabled={!isPasswordValid || !formData.agreedToTerms}
              className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              className="w-full bg-white border-gray-200 hover:bg-gray-50"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </Button> */}

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
