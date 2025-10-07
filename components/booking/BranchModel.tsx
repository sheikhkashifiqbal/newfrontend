import React, { useEffect, useMemo, useState, ChangeEvent } from "react";

// ---- API types (edit response & cities) ----
type BranchEdit = {
  branchId: number;
  companyId: number;
  branchName: string;
  branchCode: string;
  branchManagerName: string;
  branchManagerSurname: string;
  branchAddress: string;
  location: string;
  loginEmail: string;
  password?: string;
  logoImg?: string;
  branchCoverImg?: string;
  city: string;
  from?: string;
  to?: string;
  workDays?: string[];
};

type CityItem = { id: number; city: string };

type Props = {
  branchId?: number;
  mode?: "edit" | "create";
  onSaved?: () => void;
  onClose?: () => void;
  // NEW: toast callback (so we don't use alert)
  onToast?: (msg: string, variant?: "success" | "error") => void;
};

const required = (v: string | undefined | null) => String(v ?? "").trim().length > 0;

export default function BranchModel({ branchId, mode = "edit", onSaved, onClose, onToast }: Props) {
  const isEdit = mode === "edit" && !!branchId;

  const [form, setForm] = useState<BranchEdit>({
    branchId: 0,
    companyId: 0,
    branchName: "",
    branchCode: "",
    branchManagerName: "",
    branchManagerSurname: "",
    branchAddress: "",
    location: "",
    loginEmail: "",
    password: "",
    logoImg: "",
    branchCoverImg: "",
    city: "",
  });

  const [cities, setCities] = useState<CityItem[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // load cities
    (async () => {
      try {
        const resp = await fetch(`${BASE_URL}/api/cities`);
        if (resp.ok) {
          const data = await resp.json();
          const arr: CityItem[] = Array.isArray(data) ? data : [data];
          setCities(arr);
        }
      } catch {
        // ignore silently
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const resp = await fetch(`${BASE_URL}/api/branches/${branchId}`);
        if (!resp.ok) throw new Error("Failed to fetch branch");
        const data: BranchEdit = await resp.json();
        setForm({ ...data });
      } catch (e: any) {
        console.error(e);
        onToast?.(e?.message || "Failed to fetch branch", "error");
      }
    })();
  }, [branchId, isEdit]);

  const onInput = (field: keyof BranchEdit) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [field]: v }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const timestampName = (file: File) => {
    const name = file.name;
    const dot = name.lastIndexOf(".");
    const base = dot > -1 ? name.slice(0, dot) : name;
    const ext = dot > -1 ? name.slice(dot) : "";
    return `${base}${Date.now()}${ext}`; // filename + timestamp + ext
  };

  const uploadIfAny = async (file: File | null) => {
    if (!file) return undefined;
    const filename = timestampName(file);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("filename", filename);
    const resp = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: fd });
    if (!resp.ok) throw new Error("Upload failed");
    return filename;
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!required(form.branchName)) e.branchName = "Branch name is required";
    if (!required(form.branchCode)) e.branchCode = "Branch code is required";
    if (!required(form.branchManagerName)) e.branchManagerName = "Manager name is required";
    if (!required(form.branchManagerSurname)) e.branchManagerSurname = "Manager surname is required";
    if (!required(form.branchAddress)) e.branchAddress = "Address is required";
    if (!required(form.city)) e.city = "City is required";
    if (!required(form.location)) e.location = "Location map is required";
    if (!required(form.loginEmail)) e.loginEmail = "Login email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = async () => {
    if (!validate()) {
      onToast?.("Please fill all required fields", "error");
      return;
    }
    try {
      setSaving(true);
      const uploadedLogo = await uploadIfAny(logoFile);
      const uploadedCover = await uploadIfAny(coverFile);

      const body = {
        branchName: form.branchName,
        branchCode: form.branchCode,
        branchManagerName: form.branchManagerName,
        branchManagerSurname: form.branchManagerSurname,
        branchAddress: form.branchAddress,
        location: form.location,
        loginEmail: form.loginEmail,
        password: form.password,
        logoImg: uploadedLogo ?? form.logoImg, // keep old if not replaced
        branchCoverImg: uploadedCover ?? form.branchCoverImg,
        city: form.city,
      };

      const id = isEdit ? form.branchId || branchId : form.branchId;
      if (!id) {
        onToast?.("Create flow is not implemented yet. Switch to Edit from the card menu.", "error");
        return;
      }

      const resp = await fetch(`${BASE_URL}/api/branches/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error("Failed to update");

      onToast?.("Saved successfully", "success");
      onSaved?.();
    } catch (e: any) {
      onToast?.(e?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const cityOptions = useMemo(() => cities.map((c) => c.city), [cities]);

  return (
    <div className="max-w-5xl mx-auto pb-6">
      <h2 className="text-blue-400 font-semibold mb-4">{isEdit ? "Edit branch" : "Add branch"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branch Name */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-gray-600">Branch name *</label>
          <input className="w-full p-3 border rounded-[12px]" value={form.branchName} onChange={onInput("branchName")} />
          {errors.branchName && <p className="text-xs text-red-600 mt-1">{errors.branchName}</p>}
        </div>

        {/* Branch Code */}
        <div>
          <label className="block mb-2 text-gray-600">Branch code *</label>
          <input className="w-full p-3 border rounded-[12px]" value={form.branchCode} onChange={onInput("branchCode")} />
          {errors.branchCode && <p className="text-xs text-red-600 mt-1">{errors.branchCode}</p>}
        </div>

        {/* Manager Name */}
        <div>
          <label className="block mb-2 text-gray-600">Branch manager's name *</label>
          <input className="w-full p-3 border rounded-[12px]" value={form.branchManagerName} onChange={onInput("branchManagerName")} />
          {errors.branchManagerName && <p className="text-xs text-red-600 mt-1">{errors.branchManagerName}</p>}
        </div>

        {/* Manager Surname */}
        <div>
          <label className="block mb-2 text-gray-600">Branch manager's surname *</label>
          <input className="w-full p-3 border rounded-[12px]" value={form.branchManagerSurname} onChange={onInput("branchManagerSurname")} />
          {errors.branchManagerSurname && <p className="text-xs text-red-600 mt-1">{errors.branchManagerSurname}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-2 text-gray-600">Address *</label>
        <input className="w-full p-3 border rounded-[12px]" value={form.branchAddress} onChange={onInput("branchAddress")} />
          {errors.branchAddress && <p className="text-xs text-red-600 mt-1">{errors.branchAddress}</p>}
        </div>

        {/* City selector */}
        <div>
          <label className="block mb-2 text-gray-600">City *</label>
          <select className="w-full p-3 border rounded-[12px]" value={form.city} onChange={onInput("city")}>
            <option value="">Select city</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>

        {/* Location Map */}
        <div>
          <label className="block mb-2 text-gray-600">Location Map *</label>
          <input className="w-full p-3 border rounded-[12px]" placeholder="https://maps.app.goo.gl/..." value={form.location} onChange={onInput("location")} />
          {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
        </div>

        {/* Login Email */}
        <div>
          <label className="block mb-2 text-gray-600">Login e-mail for branch *</label>
          <input type="email" className="w-full p-3 border rounded-[12px]" value={form.loginEmail} onChange={onInput("loginEmail")} />
          {errors.loginEmail && <p className="text-xs text-red-600 mt-1">{errors.loginEmail}</p>}
        </div>

        {/* Password (optional) */}
        <div>
          <label className="block mb-2 text-gray-600">Password</label>
          <input type="password" className="w-full p-3 border rounded-[12px]" value={form.password ?? ""} onChange={onInput("password")} />
        </div>

        {/* Upload logo */}
        <div>
          <label className="block mb-2 text-gray-600">Upload branch logo</label>
          <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setLogoFile(e.currentTarget.files?.[0] ?? null)} />
          {form.logoImg && !logoFile && <p className="text-xs text-gray-500 mt-1">Current: {form.logoImg}</p>}
        </div>

        {/* Upload cover */}
        <div>
          <label className="block mb-2 text-gray-600">Upload branch cover</label>
          <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setCoverFile(e.currentTarget.files?.[0] ?? null)} />
          {form.branchCoverImg && !coverFile && <p className="text-xs text-gray-500 mt-1">Current: {form.branchCoverImg}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button disabled={saving} onClick={onSave} className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white disabled:opacity-70">{saving ? "Saving..." : "Save"}</button>
        <button disabled={saving} onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
      </div>
    </div>
  );
}
