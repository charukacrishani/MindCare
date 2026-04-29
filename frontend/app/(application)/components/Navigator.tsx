
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../layout";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

export const NAV_CONFIG = [
  {
    label: "Dashboard",
    path: "/dashboard",
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
    label: "Study Hub",
    roles: ["admin", "user"],
    children: [
      {
        label: "Study Materials",
        path: "/study-hub/materials",
        roles: ["admin", "user"],
      },
      {
        label: "Video Resources",
        path: "/study-hub/video-resources",
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

const MOBILE_BREAKPOINT = 768;

export default function NavBar() {
  const user = useUser();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
        setExpandedItem(null);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setExpandedItem(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  if (!user) return null;

  const filteredNav = NAV_CONFIG.filter((item) => item.roles.includes(user.role));

  const handleNavigate = (path?: string) => {
    if (path) {
      router.push(path);
      setMobileOpen(false);
      setExpandedItem(null);
    }
  };

  const toggleExpand = (label: string) => {
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────────── */}
      <nav className="w-full px-8 py-4 flex items-center justify-between">

        {/* LEFT: Logo + nav */}
        <div className="flex flex-row gap-12 items-center">

          {/* Logo — identical to original */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { router.push("/dashboard"); setMobileOpen(false); }}
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/images/logo3.png"
                alt="MindCare"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-gray-900">MindCare.</span>
          </div>

          {/* Desktop nav — rendered only when NOT mobile */}
          {!isMobile && (
            <ul className="flex items-center gap-2">
              {filteredNav.map((item) => (
                <li key={item.label} className="relative group">
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2"
                  >
                    {item.label}
                  </button>

                  {item.children && (
                    <ul className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.children
                        .filter((child) => child.roles.includes(user.role))
                        .map((child) => (
                          <li key={child.label}>
                            <button
                              onClick={() => handleNavigate(child.path)}
                              className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              {child.label}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT: Profile button + hamburger (hamburger mobile only) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { router.push("/profile"); setMobileOpen(false); }}
            className="bg-[#FF96FC] hover:bg-[#f07dec] text-white text-sm font-medium px-5 py-2 rounded-full"
          >
            {user.first_name}
          </button>

          {isMobile && (
            <button
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile slide-down menu ───────────────────────────────
          Fixed so it escapes the layout's overflow-hidden.
          Rendered only when isMobile && mobileOpen.               */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => {
              setMobileOpen(false);
              setExpandedItem(null);
            }}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-[4.0625rem] z-50 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">MindCare</span>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setExpandedItem(null);
                }}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <ul className="py-2 px-4 flex flex-col max-h-[calc(100vh-4.0625rem)] overflow-y-auto">
              {filteredNav.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 py-2.5 text-sm font-medium"
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            expandedItem === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expandedItem === item.label && (
                        <ul className="ml-4 mb-1 flex flex-col">
                          {item.path && (
                            <li>
                              <button
                                onClick={() => handleNavigate(item.path)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                              >
                                {item.label}
                              </button>
                            </li>
                          )}
                          {item.children
                            .filter((child) => child.roles.includes(user.role))
                            .map((child) => (
                              <li key={child.label}>
                                <button
                                  onClick={() => handleNavigate(child.path)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                                >
                                  {child.label}
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className="w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 py-2.5 text-sm font-medium"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
