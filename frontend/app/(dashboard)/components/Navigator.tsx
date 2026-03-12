export default function NavBar() {
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
      </ul>
    </nav>
  );
}
