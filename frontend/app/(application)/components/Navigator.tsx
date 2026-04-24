import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { User, useUser } from "../layout";
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const user = useUser() as User | null;
  const router = useRouter();

  const handleNavigate = (e:any) => {
    e.preventDefault();
    const path = e.currentTarget.getAttribute("href");
    router.push(path);
  }

  return (
    <nav className="w-full px-8 py-4 flex items-center justify-between">

      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Image src="/images/logo3.png" alt="MindCare" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-gray-900">MindCare.</span>
        </div>

        <ul className="flex space-x-4">

          <li>
            <a href="/" className="text-gray-700 hover:text-gray-900" onClick={handleNavigate}>
              Dashboard
            </a>
          </li>
          <li>
            <a href="/counselors" className="text-gray-700 hover:text-gray-900" onClick={handleNavigate}>
              Counselors
            </a>
          </li>

          {/* Chat dropdown */}
          <li className="relative group">
            <a href="/chat" className="text-gray-700 hover:text-gray-900" onClick={handleNavigate}>
              Chat
            </a>

            <ul className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <li>
                <a href="/chat/history" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={handleNavigate}>
                  Chat History
                </a>
              </li>
            </ul>
          </li>

          {/* Analyze dropdown */}
          <li className="relative group">
            <a href="/analyze" className="text-gray-700 hover:text-gray-900" onClick={handleNavigate}>
              Analyze
            </a>

            <ul className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <li>
                <a href="/analyze/history" className="block px-4 py-2 text-sm hover:bg-gray-100" onClick={handleNavigate}>
                  Analysis History
                </a>
              </li>
            </ul>
          </li>

          <li>
            <a href="/profile" className="text-gray-700 hover:text-gray-900" onClick={handleNavigate}>
              Profile
            </a>
          </li>

        </ul>
      </div >

      <div>
        <button
          onClick={() => router.push("/profile")}
          className="bg-[#FF96FC] hover:bg-[#f07dec] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
        >
          {user?.first_name}
        </button>
      </div>

    </nav >
  );
}

