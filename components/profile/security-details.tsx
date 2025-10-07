"use client";

import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type BranchResponse = {
  password?: string;
  branchId?: number;
  companyId?: number;
  branchName?: string;
  branchCode?: string;
  branchManagerName?: string;
  branchManagerSurname?: string;
  branchAddress?: string;
  location?: string;
  loginEmail?: string;
  logoImg?: string;
  branchCoverImg?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  address?: string;
  workDays?: string[];
  from?: string;
  to?: string;
};
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SecurityDetails: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Ensure we have a branch_id in localStorage for now
  useEffect(() => {
    const existing = localStorage.getItem("branch_id");
    if (!existing) {
      localStorage.setItem("branch_id", "1");
    }
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    // Auto-hide after 3s
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const branchId = localStorage.getItem("branch_id") || "1";

    try {
      setLoading(true);

      // 1) Fetch existing branch (to compare the current password)
      //    NOTE: Do not set Content-Type on GET; avoids an unnecessary preflight
      const detailsResp = await fetch(`${BASE_URL}/api/branches/${branchId}`);
      if (!detailsResp.ok) {
        showToast("error", `Failed to fetch branch details (HTTP ${detailsResp.status}).`);
        return;
      }
      const details: BranchResponse = await detailsResp.json();

      if (!details || typeof details.password !== "string") {
        showToast("error", "Could not verify old password (missing password field).");
        return;
      }

      // 2) Validate old password == backend password
      if (oldPassword !== details.password) {
        showToast("error", "Old Password does not match the current password.");
        return;
      }

      // 3) Validate new password & confirm match
      if (!newPassword) {
        showToast("error", "New Password is required.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast("error", "New Password and Retype New Password must match.");
        return;
      }

      // 4) Submit update (PUT) with the new password
      const updateResp = await fetch(`${BASE_URL}/api/branches/update/${branchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!updateResp.ok) {
        const text = await updateResp.text().catch(() => "");
        showToast(
          "error",
          text ? `Update failed: ${text}` : `Update failed (HTTP ${updateResp.status}).`
        );
        return;
      }

      // 5) Success
      showToast("success", "Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast("error", err?.message || "Unexpected error while updating password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "bg-white p-4 border border-[#E9ECEF] rounded-[12px] w-full pr-12 outline-none focus:outline focus:outline-gray-400 active:outline active:outline-gray-400";
  const labelStyle = "block text-sm mb-3 text-[#495057]";
  const inputWrapperStyle = "relative";

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <form className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8" onSubmit={handleSubmit}>
        {/* Old Password */}
        <div>
          <label className={labelStyle}>Old Password *</label>
          <div className={inputWrapperStyle}>
            <input
              className={inputStyle}
              placeholder="**********"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowOldPassword(!showOldPassword)}
              aria-label={showOldPassword ? "Hide old password" : "Show old password"}
            >
              {showOldPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className={labelStyle}>New Password *</label>
          <div className={inputWrapperStyle}>
            <input
              className={inputStyle}
              placeholder="**********"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
            >
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className={labelStyle}>Retype New Password *</label>
          <div className={inputWrapperStyle}>
            <input
              className={inputStyle}
              placeholder="**********"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 rounded-[12px] text-white cursor-pointer ${
              loading ? "bg-[#9AB6DB] cursor-not-allowed" : "bg-[#3F72AF] hover:bg-blue-500"
            }`}
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SecurityDetails;
