"use client";

import { Calendar, Users, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";


const navItems = [
  { label: "Appointments", href: "/", icon: Calendar },
  { label: "Patients", href: "/", icon: Users },
];

export function Sidebar( { onTabChange, activeTab }: { onTabChange: (tab: string) => void; activeTab?: string }) {
  return (
    <aside className="w-[220px] h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = activeTab === label.toLowerCase();
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(label.toLowerCase());
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
