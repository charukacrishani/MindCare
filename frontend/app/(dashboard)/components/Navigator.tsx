import { apiClient } from "@/lib/apiClient";

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
    <nav>
      <ul className="flex space-x-4">
        <li>
          <a href="/" className="text-gray-700 hover:text-gray-900">
            Dashboard
          </a>
        </li>
        <li>
          <a href="/chat" className="text-gray-700 hover:text-gray-900">
            Chat
          </a>
        </li>
        <li>
          <a href="/analyze" className="text-gray-700 hover:text-gray-900">
            Analyze
          </a>
        </li>
        <li>
          <a href="/profile" className="text-gray-700 hover:text-gray-900">
            Profile
          </a>
        </li>
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}
