import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function page() {
  return (
    <div
      className="max-w-7xl w-full px-4 mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16"
    >
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
      <ForgotPasswordForm />
    </div>
  );
}