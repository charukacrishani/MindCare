import Footer from "@/app/(application)/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col justify-between">
            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center px-6">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-10 w-full justify-center">

                    {/* Text Section */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl font-bold text-purple-700 mb-4">
                            Your Mental Wellness,
                        </h1>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Nurtured Every Day
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0">
                            Track your emotions, manage stress, and build healthier habits with Mind Care — your supportive mental health companion designed for peace, growth, and self-care.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a
                                href="/signup"
                                className="rounded-lg bg-[#980194] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a0177] hover:shadow-md active:scale-95"
                            >
                                Get Started
                            </a>

                            {/* <a
                                href="/learn-more"
                                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md active:scale-95"
                            >
                                Learn More
                            </a> */}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="flex justify-center">
                        <img
                            src="/images/home_logo.png"
                            alt="MindCare"
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}