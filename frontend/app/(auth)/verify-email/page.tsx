'use client';
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/dist/client/components/navigation";
import React, { useState } from "react";

export default function page() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResendEmail = async () => {
        try {
            setLoading(true)
            const response = await apiClient.post("/register/send-verification")
            if(response.success) {
                setMessage("Verification email sent successfully.");
            } else {
                setError("Failed to send verification email. Please try again.");
            }
        } catch (error) {
            setError("An error occurred while sending the verification email. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEmail = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get("/register/verify", { token: verificationCode })
            if(response.success) {
                setMessage("Email verified successfully. You can now log in.");
                router.push("/dashboard");
            } else {
                setError("Invalid verification code. Please try again.");
            }
        } catch (error) {
            setError("An error occurred while verifying your email. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-7xl w-full px-4 mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            <div className="flex flex-col gap-2 w-full max-w-xl text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter text-black">
                    Your <br />
                    <span className="text-[#980194]">Mental Wellbeing</span>
                    <br />
                    Starts Here.
                </h1>
                <p className="text-base sm:text-lg text-gray-400">
                    Smart questions. Meaningful support
                </p>
            </div>
            <div className="w-full max-w-md">
                {message && <div className="text-green-500">{message}</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="text-sm sm:text-base">
                    Check your email for a verification code to complete your registration.
                </div>
                <input
                    className="mt-4 px-4 py-2 border rounded w-full"
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        className="mt-4 px-4 py-2 bg-[#980194] text-white rounded hover:bg-[#7a0175] transition-colors w-full sm:w-auto"
                        onClick={handleVerifyEmail}
                        disabled={loading || verificationCode.trim() === ""}
                    >
                        Verify
                    </button>
                    <button
                        className="mt-4 px-4 py-2 bg-[#980194] text-white rounded hover:bg-[#7a0175] transition-colors w-full sm:w-auto"
                        onClick={handleResendEmail}
                        disabled={loading}
                    >
                        Resend
                    </button>
                </div>
            </div>
        </div>
    );
}