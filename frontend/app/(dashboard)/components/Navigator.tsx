import { apiClient } from "@/lib/apiClient";
import Image from "next/image";


export default function NavBar() {
  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/login/revoke-session");
      if (response.success) {
        window.location.href = "/signin";
      } else {
        console.error("Logout failed:", response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
            <a href="/" className="text-gray-700 hover:text-gray-900">Dashboard</a>
          </li>
          <li>
            <a href="/chat" className="text-gray-700 hover:text-gray-900">Chat</a>
          </li>
          <li>
            <a href="/analyze" className="text-gray-700 hover:text-gray-900">Analyze</a>
          </li>
          <li>
            <a href="/profile" className="text-gray-700 hover:text-gray-900">Profile</a>
          </li>
        </ul>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="bg-[#FF96FC] hover:bg-[#f07dec] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200"
        >
          Logout
        </button>
      </div>

    </nav>
  );
}

