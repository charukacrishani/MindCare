
import { useRouter } from "next/navigation";
import { useUser } from "../layout";
import Image from "next/image";

export const NAV_CONFIG = [
  {
    label: "Dashboard",
    path: "/",
    roles: ["admin", "user", "counselor"],
  },
  {
    label: "Counselors",
    path: "/counselors",
    roles: ["admin", "user"],
  },
  {
    label: "Appointments",
    path: "/appointments",
    roles: ["admin", "user"],
  },  
  {
    label: "Availability",
    path: "/availability",
    roles: ["admin", "counselor"],
  },
  {
    label: "Chat",
    path: "/chat",
    roles: ["admin", "user"],
    children: [
      {
        label: "Chat History",
        path: "/chat/history",
        roles: ["admin", "user"],
      },
    ],
  },
  {
    label: "Analyze",
    path: "/analyze",
    roles: ["admin", "user"],
    children: [
      {
        label: "Analysis History",
        path: "/analyze/history",
        roles: ["admin", "user"],
      },
    ],
  },
  {
    label: "Profile",
    path: "/profile",
    roles: ["admin", "user", "counselor"],
  },
];

export default function NavBar() {
  const user = useUser();
  const router = useRouter();

  const handleNavigate = (e: any) => {
    e.preventDefault();
    const path = e.currentTarget.getAttribute("href") || e.currentTarget.getAttribute("data-path");
    router.push(path);
  };

  if (!user) return null; // or loading state

  const filteredNav = NAV_CONFIG.filter(item =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="w-full px-8 py-4 flex items-center justify-between">
      <div className="flex flex-row gap-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Image src="/images/logo3.png" alt="MindCare" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-lg font-bold text-gray-900">MindCare.</span>
        </div>
        <ul className="flex space-x-4 justify-center items-center">
          {filteredNav.map((item) => (
            <li key={item.label} onClick={handleNavigate} data-path={item.path} className="relative group hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
              <a
                href={item.path}
                onClick={handleNavigate}
                className="text-gray-700 hover:text-gray-900"
              >
                {item.label}
              </a>

              {/* Dropdown */}
              {item.children && (
                <ul className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {item.children
                    .filter(child => child.roles.includes(user?.role))
                    .map(child => (
                      <li key={child.label} onClick={handleNavigate} data-path={child.path}>
                        <a
                          href={child.path}
                          onClick={handleNavigate}
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                </ul>
              )}

            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => router.push("/profile")}
        className="bg-[#FF96FC] hover:bg-[#f07dec] text-white text-sm font-medium px-5 py-2 rounded-full"
      >
        {user?.first_name}
      </button>
    </nav>
  );
}
