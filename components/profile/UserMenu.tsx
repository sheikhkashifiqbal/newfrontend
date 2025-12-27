"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const UserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setOpen(!open);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Determine display name from localStorage
  useEffect(() => {
    try {
      const authData = localStorage.getItem("auth_response");
      if (authData) {
        const parsed = JSON.parse(authData);
        const fullName = parsed?.full_name || parsed?.company_name || parsed?.branch_name;

        if (typeof fullName === "string" && fullName.trim().length > 0) {
          const firstName = fullName.split(" ")[0];
          setDisplayName(firstName);
        }
      }
    } catch (err) {
      console.error("Error parsing auth_response:", err);
    }
  }, []);

  // ✅ Profile Click Handler — NEW REQUIREMENT
  const handleProfileClick = () => {
    try {
      const authData = localStorage.getItem("auth_response");
      if (authData) {
        const parsed = JSON.parse(authData);

        // Check for branch_id inside auth_response
        if (parsed?.branch_id) {
          window.location.href = "/services/branch-bookings";
          return;
        }
      }

      // If branch_id not found → redirect to user profile
      window.location.href = "/services/customer-bookings";
    } catch (err) {
      console.error("Profile redirect error:", err);
      window.location.href = "/profile/user";
    }
  };

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        localStorage.clear();
        toast.success("Logged out successfully");
        window.location.href = "/"; // redirect to home after logout
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout request failed");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 text-steel-blue font-medium"
      >
        <div className="w-9 h-9 rounded-full bg-white" />
        <span>{displayName}</span>
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border z-50">
          <ul className="text-sm text-gray-700">
            {/* Updated Profile Menu */}
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleProfileClick}
            >
              My Bookings
            </li>

           
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
