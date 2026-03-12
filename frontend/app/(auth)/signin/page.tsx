import SignInForm from "../components/SignInForm";

export default function page() {
  return (
    <div
      className="max-w-7xl w-full px-4 mx-auto flex justify-between items-center overflow-hidden relative min-h-svh h-svh
    "
    >
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-6xl font-semibold tracking-tighter text-black">
          Your <br />
          <span className=" text-[#980194]">Mental Wellbeing</span>
          <br />
          Starts Here.
        </h1>
        <p className="text-lg text-gray-400">
          Smart questions. Meaningful support
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
