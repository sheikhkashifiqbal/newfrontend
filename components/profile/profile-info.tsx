import React, { useEffect, useMemo, useState } from "react";
import ModalBox from "../model-box";
import AccountDetails from "./account-details";
import SecurityDetails from "./security-details";

// Use a relative API base so your dev server proxy can avoid CORS in dev
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE = `${BASE_URL}/api`;

/* --------------------------- Types --------------------------- */
type CarRow = {
  carId: number;
  userId: number;
  brandId: number;
  carModel: string;
  vinNumber: string;
  plateNumber: string;
  brandName?: string;
};

type Brand = { brandId: number; brandName: string };

type BrandModel = {
  id: number;
  brandId?: number;
  modelName?: string; // some APIs use modelName
  carModel?: string;  // some APIs use carModel
};

// ✅ New: User type for Account/Security tabs
type User = {
  id: number;
  fullName: string;
  birthday: string;  // ISO YYYY-MM-DD
  gender: string;
  email: string;
  password: string;
};

/* ------------------------- Toast UI -------------------------- */
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[1000] rounded-lg bg-black/80 text-white px-4 py-3 shadow-lg">
      {message}
    </div>
  );
};

const ProfileInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState("My Cars");
  const [openModal, setOpenModal] = useState<null | "add" | "edit">(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string>("");

  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ New: User state for Account/Security tabs
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [secError, setSecError] = useState<string | null>(null);

  // ✅ NEW: Get userId strictly from auth_response.id; block access if missing
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("auth_response");
      if (!raw) {
        window.location.href = "/"; // block access
        return;
      }
      const parsed = JSON.parse(raw);
      const id = Number(parsed?.id);
      if (Number.isFinite(id) && id > 0) {
        window.localStorage.setItem("userId", String(id));
        setUserId(id);
      } else {
        window.location.href = "/"; // block access
      }
    } catch {
      window.location.href = "/"; // block access on parse error
    }
  }, []);

  const loadCars = async () => {
    if (userId == null) return; // guard
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/user/${userId}`);
      if (!res.ok) throw new Error("Failed to load cars");
      const data: CarRow[] = await res.json();

      // Enrich each car with brandName
      const withBrands = await Promise.all(
        data.map(async (c) => {
          try {
            const b = await fetch(`${BASE_URL}/api/brands/${c.brandId}`);
            if (b.ok) {
              const brand: Brand = await b.json();
              return { ...c, brandName: brand.brandName };
            }
          } catch {}
          return { ...c, brandName: undefined };
        })
      );

      setCars(withBrands);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load cars once userId is known
  useEffect(() => {
    if (userId == null) return;
    loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleOpenModal = (type: "add" | "edit", carId?: number) => {
    setSelectedCarId(carId ?? null);
    setOpenModal(type);
  };

  const handleSaved = (msg?: string) => {
    if (msg) setToast(msg);
    setOpenModal(null);
    loadCars();
  };

  const requestDelete = (carId: number) => {
    setConfirmDeleteId(carId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/cars/${confirmDeleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setToast("Car deleted");
      await loadCars();
    } catch (e) {
      console.error(e);
      setToast("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setConfirmDeleteId(null);
    }
  };

  const selectedCar = cars.find((c) => c.carId === selectedCarId) || null;
  const carToDelete = useMemo(
    () => (confirmDeleteId ? cars.find((c) => c.carId === confirmDeleteId) ?? null : null),
    [confirmDeleteId, cars]
  );

  /* ----------------------------- Users (Account/Security) ----------------------------- */
  const fetchUser = async () => {
    if (userId == null) return; // guard
    setUserLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load user");
      const data: User = await res.json();
      setUser(data);
      setNewPassword("");
      setRetypeNewPassword("");
      setSecError(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (userId == null) return;
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const postUser = async (payload: User) => {
    const res = await fetch(`${API_BASE}/users/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save user");
    return res;
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    try {
      const payload: User = { ...user, password: user.password };
      await postUser(payload);
      setUser(payload);
      setToast("The record is saved");
    } catch (e) {
      console.error(e);
      setToast("Failed to save user");
    }
  };

  const handleSaveSecurity = async () => {
    if (!user) return;
    if (!newPassword.trim() || !retypeNewPassword.trim()) {
      setSecError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== retypeNewPassword) {
      setSecError("New Password and Retype New Password must be equal.");
      return;
    }
    setSecError(null);
    try {
      const payload: User = { ...user, password: newPassword };
      await postUser(payload);
      setUser(payload);
      setToast("The record is saved");
      setNewPassword("");
      setRetypeNewPassword("");
    } catch (e) {
      console.error(e);
      setToast("Failed to save user");
    }
  };

  // 🔒 Avoid rendering before auth check is complete
  if (userId == null) {
    return null;
  }

  return (
    <>
      {/* Section Title */}
      <section className="max-w-[1120px] mx-auto px-4 mb-8">
        <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">Profile info</h2>
        <p className="text-[#ADB5BD] text-xl md:text-[20px] mt-2">Everything about your profile</p>
      </section>

      {/* Tabs */}
      <section className="border-b border-gray-200 mb-8">
        <div className="flex gap-3 sm:gap-0 max-w-[1120px] mx-auto px-4">
          {["My Cars", "Account details", "Security details"].map((tab) => (
            <button
              key={tab}
              className={`sm:px-[26px] px-0 py-4 font-medium flex gap-1 sm:gap-3 items-center ${
                activeTab === tab ? "text-gray-700 border-b-2 border-gray-700" : "text-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <img
                src={
                  tab === "My Cars"
                    ? "/icons/car-01.svg"
                    : tab === "Account details"
                    ? "/icons/user-edit.svg"
                    : "/icons/shield-zap.svg"
                }
                width={24}
                alt="tab"
              />
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1120px] mx-auto px-4 mb-8 pb-20">
        <div className="mt-6">
          {activeTab === "My Cars" && (
            <div>
              <div className="flex items-center gap-10 mb-6">
                <p className="text-gray-600">Cars</p>
                <button
                  className="flex items-center gap-2 text-[#ADB5BD] font-medium"
                  onClick={() => handleOpenModal("add")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5V19M5 12H19" stroke="#ADB5BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add new
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : cars.length === 0 ? (
                <p className="text-gray-400">No cars added yet.</p>
              ) : (
                <div className="gap-6 grid md:grid-cols-2">
                  {cars.map((car) => (
                    <div key={car.carId} className="border border-[#E9ECEF]/50 bg-white rounded-lg p-6">
                      <h3 className="font-medium mb-2 flex justify-between gap-5">
                        {car.brandName ? `${car.brandName} ${car.carModel}` : car.carModel || "Car Details"}
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleOpenModal("edit", car.carId)} aria-label="Edit">
                            <img src={"/icons/edit-02.svg"} width={18} alt="edit" />
                          </button>
                          <button onClick={() => requestDelete(car.carId)} aria-label="Delete">
                            <img src={"/icons/x-close.svg"} width={22} alt="delete" />
                          </button>
                        </div>
                      </h3>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <p className="text-gray-400 min-w-[96px]">Plate N°:</p>
                          <p className="font-medium">{car.plateNumber}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-gray-400 min-w-[96px]">VIN N°:</p>
                          <p className="font-medium">{car.vinNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ Account details (prefill from GET /api/users/{id}, POST on save) */}
          {activeTab === "Account details" && (
            <div className="max-w-[840px]">
              {userLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : !user ? (
                <p className="text-gray-400">No user loaded.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveAccount();
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Your full name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Your full name</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={user.fullName}
                      onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                    />
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Birthday</label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={user.birthday}
                      onChange={(e) => setUser({ ...user, birthday: e.target.value })}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                    <select
                      className="w-full p-3 pr-10 border rounded-[12px] text-gray-700"
                      value={user.gender}
                      onChange={(e) => setUser({ ...user, gender: e.target.value })}
                    >
                      <option value="">Selection</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* E-mail address */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">E-mail address</label>
                    <input
                      type="email"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-[8px]">
                      Save changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ✅ Security details (Old Password from GET, New/Retype validated, POST on save) */}
          {activeTab === "Security details" && (
            <div className="max-w-[640px]">
              {userLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : !user ? (
                <p className="text-gray-400">No user loaded.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveSecurity();
                  }}
                  className="grid grid-cols-1 gap-6"
                >
                  {/* Old Password (prefilled from API) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Old Password</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={user.password}
                      onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  {/* Retype New Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Retype New Password</label>
                    <input
                      type="password"
                      className="w-full p-3 border rounded-[12px] text-gray-700"
                      value={retypeNewPassword}
                      onChange={(e) => setRetypeNewPassword(e.target.value)}
                    />
                    {secError && <p className="mt-1 text-sm text-red-600">{secError}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-[8px]">
                      Save changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal: Add or Edit */}
        {(openModal === "add" || openModal === "edit") && (
          <ModalBox
            open={true}
            onOpenChange={() => setOpenModal(null)}
            title={openModal === "edit" ? "Edit Vehicle" : "Add New Vehicle"}
            maxWidth="808px"
          >
            <AddCarDetails
              mode={openModal}
              carId={selectedCarId || undefined}
              fallbackSelected={selectedCar || undefined}
              userId={userId}
              onSaved={() => handleSaved("The record is saved")}
              onCancel={() => setOpenModal(null)}
            />
          </ModalBox>
        )}

        {/* Confirm Delete Modal */}
        {confirmOpen && (
          <ModalBox
            open={true}
            onOpenChange={() => {
              setConfirmOpen(false);
              setConfirmDeleteId(null);
            }}
            title="Delete Vehicle"
            maxWidth="560px"
          >
            <div className="p-1">
              <p className="text-gray-600">Are you sure you want to delete this vehicle?</p>

              {carToDelete && (
                <div className="mt-3 rounded-md border border-gray-200 p-3 bg-gray-50">
                  <p className="text-gray-800 font-medium">
                    {(carToDelete.brandName ? `${carToDelete.brandName} ` : "") + carToDelete.carModel}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Plate: <span className="font-medium">{carToDelete.plateNumber}</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    VIN: <span className="font-medium">{carToDelete.vinNumber}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">ID: {carToDelete.carId}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-[8px] text-gray-700"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-[8px] disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </ModalBox>
        )}
      </section>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
};

export default ProfileInfo;

/* ============================================================
   AddCarDetails
   - mode "edit": fetches /api/cars/{carId}, preselects brand & model
   - brand dropdown from /api/brands
   - model dropdown depends on brand: /api/brand-models/{brandId}
   - inline validation (no alerts)
   - PUT /api/cars/{carId} on Save, then notifies parent
   - POST /api/cars on Save when adding
============================================================ */
const AddCarDetails: React.FC<{
  mode: "add" | "edit";
  carId?: number;
  userId: number;
  fallbackSelected?: CarRow;
  onSaved: () => void;
  onCancel: () => void;
}> = ({ mode, carId, userId, fallbackSelected, onSaved, onCancel }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<BrandModel[]>([]);

  const [form, setForm] = useState<{
    carId?: number;
    userId: number;
    brandId: number | null; // number when selected, null when empty
    brandName?: string;
    carModel: string;
    vinNumber: string;
    plateNumber: string;
  }>({
    carId,
    userId,
    brandId: fallbackSelected?.brandId ?? null,
    carModel: fallbackSelected?.carModel ?? "",
    vinNumber: fallbackSelected?.vinNumber ?? "",
    plateNumber: fallbackSelected?.plateNumber ?? "",
  });

  // Inline field errors
  const [errors, setErrors] = useState<{
    brandId?: string;
    carModel?: string;
    vinNumber?: string;
    plateNumber?: string;
  }>({});

  const onChange = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    if (Object.prototype.hasOwnProperty.call(patch, "brandId")) setErrors((e) => ({ ...e, brandId: undefined }));
    if (Object.prototype.hasOwnProperty.call(patch, "carModel")) setErrors((e) => ({ ...e, carModel: undefined }));
    if (Object.prototype.hasOwnProperty.call(patch, "vinNumber")) setErrors((e) => ({ ...e, vinNumber: undefined }));
    if (Object.prototype.hasOwnProperty.call(patch, "plateNumber")) setErrors((e) => ({ ...e, plateNumber: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.brandId) next.brandId = "Brand is required";
    if (!form.carModel?.trim()) next.carModel = "Car model is required";
    if (!form.vinNumber?.trim()) next.vinNumber = "VIN number is required";
    if (!form.plateNumber?.trim()) next.plateNumber = "Plate number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Fetch models for a brandId; coerce response to array
  const fetchModelsByBrand = async (brandId: number, opts?: { keepModel?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/brand-models/by-brand/${brandId}`);
      if (!res.ok) throw new Error("Failed to load brand models");
      const anyJson = await res.json();
      const list: BrandModel[] = Array.isArray(anyJson)
        ? anyJson
        : (Array.isArray((anyJson as any)?.data) ? (anyJson as any).data : []);
      setModels(list);

      // Keep specified model or pick the first one
      if (opts?.keepModel) {
        setForm((f) => ({ ...f, carModel: opts.keepModel! }));
      } else {
        const first = list[0];
        const firstLabel = (first?.modelName || first?.carModel || "") ?? "";
        setForm((f) => ({ ...f, carModel: firstLabel }));
      }
    } catch (e) {
      console.error(e);
      setModels([]);
      setForm((f) => ({ ...f, carModel: "" }));
    }
  };

  // Load brands initially
  useEffect(() => {
    (async () => {
      try {
        const bRes = await fetch(`${BASE_URL}/api/brands`);
        if (bRes.ok) {
          const bData: Brand[] = await bRes.json();
          setBrands(bData);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load car record when editing, preselect brand & model
  useEffect(() => {
    if (mode !== "edit" || !carId) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cars/${carId}`);
        if (!res.ok) throw new Error("Failed to load car");
        const car = await res.json();

        // Also fetch brandName (optional)
        let brandName: string | undefined = undefined;
        try {
          const b = await fetch(`${BASE_URL}/api/brands/${car.brandId}`);
          if (b.ok) {
            const brand: Brand = await b.json();
            brandName = brand.brandName;
          }
        } catch {}

        setForm({
          carId: car.carId,
          userId: car.userId ?? userId,
          brandId: car.brandId ?? null,
          brandName,
          carModel: car.carModel ?? "",
          vinNumber: car.vinNumber ?? "",
          plateNumber: car.plateNumber ?? "",
        });

        // Preload models for this brand and keep the current model if present
        if (car.brandId) {
          await fetchModelsByBrand(car.brandId, { keepModel: car.carModel });
        } else {
          setModels([]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [mode, carId, userId]);

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (mode === "edit" && form.carId) {
        // UPDATE existing car
        const payload = {
          carId: form.carId,
          userId: form.userId,
          brandId: form.brandId!, // guaranteed by validate()
          carModel: form.carModel,
          vinNumber: form.vinNumber,
          plateNumber: form.plateNumber,
        };

        const res = await fetch(`${BASE_URL}/api/cars/${form.carId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to save");
        onSaved(); // parent shows toast + closes modal + refreshes list

      } else if (mode === "add") {
        // CREATE new car
        const payload = {
          userId: form.userId,
          brandId: form.brandId!, // guaranteed by validate()
          carModel: form.carModel,
          vinNumber: form.vinNumber,
          plateNumber: form.plateNumber,
        };

        const res = await fetch(`${BASE_URL}/api/cars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        onSaved(); // same UX as edit: toast + close + reload
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="my-6 rounded-lg">
      <h2 className="text-blue-500 font-semibold mb-4">Car details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car Brand */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Your car brand</label>
          <div className="relative">
            <select
              value={form.brandId === null ? "" : String(form.brandId)}
              onChange={(e) => {
                const next = e.target.value ? Number(e.target.value) : null;
                // reset model, then fetch models for the selected brand
                setForm((f) => ({ ...f, brandId: next, carModel: "" }));
                if (next) fetchModelsByBrand(next);
              }}
              className="w-full p-3 pr-10 border rounded-[12px] text-gray-700 appearance-none"
              aria-invalid={!!errors.brandId}
            >
              <option value="">Selection</option>
              {brands.map((b, i) => (
                <option key={`brand-${b.brandId}-${i}`} value={String(b.brandId)}>
                  {b.brandName}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
        </div>

        {/* Car Model (depends on Brand) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Your car model</label>
          <div className="relative">
            <select
              value={form.carModel}
              onChange={(e) => setForm((f) => ({ ...f, carModel: e.target.value }))}
              className="w-full p-3 pr-10 border rounded-[12px] text-gray-700 appearance-none"
              aria-invalid={!!errors.carModel}
            >
              <option value="">Selection</option>
              {Array.isArray(models) &&
                models.map((m, i) => {
                  const label = m.modelName || m.carModel || "";
                  return (
                    <option key={`model-${m.id}-${i}`} value={label}>
                      {label}
                    </option>
                  );
                })}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.carModel && <p className="mt-1 text-sm text-red-600">{errors.carModel}</p>}
        </div>

        {/* VIN Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">VIN number</label>
          <input
            type="text"
            placeholder="Car’s VIN Number"
            className="w-full p-3 border rounded-[12px] text-gray-700 placeholder-gray-400"
            value={form.vinNumber}
            onChange={(e) => setForm((f) => ({ ...f, vinNumber: e.target.value }))}
            aria-invalid={!!errors.vinNumber}
          />
          {errors.vinNumber && <p className="mt-1 text-sm text-red-600">{errors.vinNumber}</p>}
        </div>

        {/* Plate Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Your plate number</label>
          <input
            type="text"
            placeholder="Ex: ABC-123"
            className="w-full p-3 border rounded-[12px] text-gray-700 placeholder-gray-400"
            value={form.plateNumber}
            onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
            aria-invalid={!!errors.plateNumber}
          />
          {errors.plateNumber && <p className="mt-1 text-sm text-red-600">{errors.plateNumber}</p>}
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-4">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-[8px] text-gray-700">
          Cancel
        </button>
        <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-[8px]">
          Save
        </button>
      </div>
    </div>
  );
};
