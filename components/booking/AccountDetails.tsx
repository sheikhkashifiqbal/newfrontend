"use client";

import React, { useEffect, useMemo, useState } from "react";

type CompanyResponse = {
  companyId: number;
  companyName: string;
  brandName: string;
  taxId: string;
  managerName: string;
  managerSurname: string;
  managerPhone: string;
  managerMobile: string;
  managerEmail: string;
  website?: string | null;
  password: string;
  tinPhoto: string;
};

const AccountDetails: React.FC = () => {
  // Ensure we have a company_id in localStorage for now
  useEffect(() => {
    if (!localStorage.getItem("company_id")) {
      localStorage.setItem("company_id", "1");
    }
  }, []);

  const companyId = useMemo(
    () => Number(localStorage.getItem("company_id") || "1"),
    []
  );

  // Form state (editable fields)
  const [formData, setFormData] = useState({
    companyName: "",
    brandName: "",
    taxId: "",
    managerName: "",
    managerSurname: "",
    managerPhone: "",
    managerMobile: "",
    managerEmail: "",
    website: "",
  });

  // Non-edit origins (must be taken from GET response per spec)
  const [serverPassword, setServerPassword] = useState<string>("");
  const [serverTinPhoto, setServerTinPhoto] = useState<string>("");
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // TIN upload (optional new file)
  const [tinPhotoFile, setTinPhotoFile] = useState<File | null>(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Load company when tab/component mounts
  useEffect(() => {
    const load = async () => {
      try {
        // GET without custom headers to avoid preflight
       // const resp = await fetch(`${BASE_URL}/api/companies/${companyId}`);

        const resp = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });



        if (!resp.ok) {
          showToast("error", `Failed to load company (HTTP ${resp.status}).`);
          return;
        }
        const data: CompanyResponse = await resp.json();

        setFormData({
          companyName: data.companyName || "",
          brandName: data.brandName || "",
          taxId: data.taxId || "",
          managerName: data.managerName || "",
          managerSurname: data.managerSurname || "",
          managerPhone: data.managerPhone || "",
          managerMobile: data.managerMobile || "",
          managerEmail: data.managerEmail || "",
          website: data.website || "",
        });
        setServerPassword(data.password || "");
        setServerTinPhoto(data.tinPhoto || "");
      } catch (e: any) {
        showToast("error", e?.message || "Unable to load company.");
      }
    };
    load();
  }, [companyId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const onChooseTin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setTinPhotoFile(f);
  };

  // Basic required validation for all fields except website
  const validate = () => {
    const {
      companyName, brandName, taxId,
      managerName, managerSurname,
      managerPhone, managerMobile, managerEmail,
    } = formData;

    if (!companyName || !brandName || !taxId ||
        !managerName || !managerSurname ||
        !managerPhone || !managerMobile || !managerEmail) {
      showToast("error", "Please fill all required fields (Website is optional).");
      return false;
    }

    // simple email check
    if (!/^\S+@\S+\.\S+$/.test(managerEmail)) {
      showToast("error", "Please enter a valid e-mail address.");
      return false;
    }
    return true;
  };

  // Upload TIN file (if any) before update
  const uploadTinIfNeeded = async (): Promise<string> => {
    if (!tinPhotoFile) return serverTinPhoto; // keep current name from server

    const ext = tinPhotoFile.name.includes(".")
      ? tinPhotoFile.name.substring(tinPhotoFile.name.lastIndexOf("."))
      : "";
    const base = tinPhotoFile.name.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const timestampName = `${base}-${timestamp}${ext}`;
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Use FormData so the browser sets multipart boundary (often avoids extra CORS issues)
    const fd = new FormData();
    fd.append("file", tinPhotoFile);
    fd.append("filename", timestampName);

    const up = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: fd,
      credentials: "include"
      // no Content-Type header on purpose (browser sets it)
    });

    if (!up.ok) {
      const msg = await up.text().catch(() => "");
      throw new Error(msg || `File upload failed (HTTP ${up.status}).`);
    }
    return timestampName; // server saved it using this name
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      // 1) Upload TIN if chosen, get final tinPhoto name
      const tinPhotoName = await uploadTinIfNeeded();

      // 2) Build update body — NOTE: password & tinPhoto from server/spec
      const body: CompanyResponse = {
        companyId,
        companyName: formData.companyName.trim(),
        brandName: formData.brandName.trim(),
        taxId: formData.taxId.trim(),
        managerName: formData.managerName.trim(),
        managerSurname: formData.managerSurname.trim(),
        managerPhone: formData.managerPhone.trim(),
        managerMobile: formData.managerMobile.trim(),
        managerEmail: formData.managerEmail.trim(),
        website: formData.website.trim(),
        password: serverPassword,   // from GET response as required
        tinPhoto: tinPhotoName,     // from upload (or old server value)
      };

      // 3) PUT update
      const put = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      if (!put.ok) {
        const txt = await put.text().catch(() => "");
        showToast("error", txt || `Update failed (HTTP ${put.status}).`);
        return;
        }
      showToast("success", "Company details updated successfully.");
      // if we uploaded a new file, remember new tinPhoto on client too
      setServerTinPhoto(body.tinPhoto);
      setTinPhotoFile(null);
    } catch (err: any) {
      showToast("error", err?.message || "Unexpected error while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full p-3 border border-[#E9ECEF] rounded-[12px] outline-none focus:outline focus:outline-gray-400";
  const label = "block mb-1 text-sm font-medium text-[#495057]";

  return (
    <section className="bg-gray-50 pb-20">
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

      <form className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8" onSubmit={onSubmit}>
        <div>
          <label className={label}>Company name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={onChange}
            placeholder="TechCorp"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Brand name *</label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={onChange}
            placeholder="TechBrand"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Tax ID *</label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={onChange}
            placeholder="TX123456"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Manager's name *</label>
          <input
            type="text"
            name="managerName"
            value={formData.managerName}
            onChange={onChange}
            placeholder="Alice"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Manager's surname *</label>
          <input
            type="text"
            name="managerSurname"
            value={formData.managerSurname}
            onChange={onChange}
            placeholder="Jhon"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Manager’s stationary phone *</label>
          <input
            type="text"
            name="managerPhone"
            value={formData.managerPhone}
            onChange={onChange}
            placeholder="1234567890"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Manager’s mobile number *</label>
          <input
            type="text"
            name="managerMobile"
            value={formData.managerMobile}
            onChange={onChange}
            placeholder="9876543210"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>E-mail address *</label>
          <input
            type="email"
            name="managerEmail"
            value={formData.managerEmail}
            onChange={onChange}
            placeholder="alice@techcorp.com"
            className={input}
            required
          />
        </div>

        <div>
          <label className={label}>Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={onChange}
            placeholder="https://www.techcorp.com"
            className={input}
          />
        </div>

        {/* Upload your TIN Photo */}
        <div>
          <label className={label}>Upload your TIN Photo *</label>
          <div className="relative border p-4 rounded-[12px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-[12px] overflow-hidden">
                {tinPhotoFile ? (
                  <img
                    src={URL.createObjectURL(tinPhotoFile)}
                    alt="tin preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-sm">
                  {tinPhotoFile?.name || serverTinPhoto || "No file selected"}
                </p>
                <p className="text-xs text-gray-500">
                  {tinPhotoFile ? `${(tinPhotoFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              </div>
            </div>
            <label className="text-gray-600 cursor-pointer">
              🔄
              <input
                type="file"
                accept="image/*"
                onChange={onChooseTin}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className={`py-3 px-6 rounded-[12px] text-white ${
              loading ? "bg-[#9AB6DB] cursor-not-allowed" : "bg-[#3F72AF] hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AccountDetails;
