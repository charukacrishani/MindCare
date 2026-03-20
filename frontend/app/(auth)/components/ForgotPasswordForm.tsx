"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";

type Step = "request" | "verify" | "reset" | "done";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });

 const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/forgot-password", { email });
      if (response.success) {
        setStep("verify");
      } else {
        setError(response.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/forgot-password/verify-code", { email, code });
      if (response.success) {
        setStep("reset");
      } else {
        setError(response.message || "Invalid or expired code.");
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwords.password !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (passwords.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/forgot-password/reset", {
  email,
  code,
  password: passwords.password,
});
      if (response.success) {
        setStep("done");
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center p-4 w-full">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-12 -translate-y-12 blur-2xl" />

        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <img src="/images/logo3.png" alt="Logo" className="w-10 h-10 mr-2 opacity-20" />
            <h1 className="text-4xl font-medium text-[#980194] text-right">
              {step === "request" && "Forgot password"}
              {step === "verify" && "Enter code"}
              {step === "reset" && "New password"}
              {step === "done" && "All done!"}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-8">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>
          )}

          {/* Step 1 — Email */}
          {step === "request" && (
            <form onSubmit={handleRequest} className="space-y-4">
              <p className="text-sm text-gray-500">
                Enter your email and we&apos;ll send you a reset code.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-white border-gray-200 focus-visible:ring-purple-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg"
                size="lg"
              >
                {loading ? "Sending..." : "Send reset code"}
              </Button>
              <p className="text-center text-sm text-gray-400 pt-1">
                Remember it?{" "}
                <a href="/signin" className="text-blue-500 hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          )}

          {/* Step 2 — Verification code */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-500">
                We sent a code to{" "}
                <span className="font-medium text-gray-700">{email}</span>.
                Check your inbox and enter it below.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Reset code
                </Label>
                <Input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. 123456"
                  className="bg-white border-gray-200 focus-visible:ring-purple-400 tracking-widest text-center"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg"
                size="lg"
              >
                {loading ? "Verifying..." : "Verify code"}
              </Button>
              <p className="text-center text-sm text-gray-400 pt-1">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-blue-500 hover:underline"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* Step 3 — New password */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-gray-500">Choose a strong new password.</p>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={passwords.password}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={loading}
                  className="bg-white border-gray-200 focus-visible:ring-purple-400"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-medium text-gray-700">
                  Confirm password
                </Label>
                <Input
                  type="password"
                  id="confirm"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, confirm: e.target.value }))
                  }
                  disabled={loading}
                  className="bg-white border-gray-200 focus-visible:ring-purple-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg"
                size="lg"
              >
                {loading ? "Saving..." : "Reset password"}
              </Button>
            </form>
          )}

          {/* Step 4 — Success */}
          {step === "done" && (
            <div className="space-y-4 text-center py-4">
              <div className="text-5xl">🎉</div>
              <p className="text-gray-700 font-medium">Password updated successfully!</p>
              <p className="text-sm text-gray-400">
                You can now sign in with your new password.
              </p>
              <a href="/signin">
                <Button
                  className="w-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 text-white hover:from-purple-500 hover:via-pink-500 hover:to-pink-600 shadow-lg mt-2"
                  size="lg"
                >
                  Go to sign in
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}