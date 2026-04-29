'use client';
import { useUser } from "@/app/(application)/layout";
import ProfileSetupForm from "../components/ProfileSetupForm";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function page() {
  const user = useUser();
  const router = useRouter();


  useEffect(() => {
    if (user) {
      if (user.isComplete) {
        router.push("/profile");
      }
    }
  }, [user]);

  return (
    <div
      className="max-w-7xl w-full px-4 mx-auto flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 lg:gap-12 overflow-hidden relative min-h-svh lg:h-svh py-8 lg:py-12"
    >
      <div className="flex flex-col gap-3 w-full lg:w-1/2 text-center lg:text-left">
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
      <div className="w-full lg:w-1/2">
        <ProfileSetupForm role={user?.role ?? ""} />
      </div>
    </div>
  );
}
