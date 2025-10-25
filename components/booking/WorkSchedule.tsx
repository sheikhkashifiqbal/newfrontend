'use client';

import React, { useEffect, useMemo, useState } from 'react';

/* ---------- Types from your API ---------- */
type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type ApiDay = {
  workId: number;
  branchId: number;
  workingDay: DayKey;
  from: string;
  to: string;
  status: 'active' | 'inactive';
};

type DayConfig = { key: DayKey; label: string };

const DAYS: DayConfig[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const TIME_OPTIONS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00',
];

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* ---------- Small iOS-like toggle ---------- */
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({
  checked,
  onChange,
  disabled,
}) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={cx(
      'relative inline-flex h-6 w-[43px] items-center rounded-full transition-colors',
      checked ? 'bg-[#6EDE8A]' : 'bg-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
    aria-pressed={checked}
    aria-disabled={disabled}
  >
    <span
      className={cx(
        'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
        checked ? 'translate-x-5' : 'translate-x-1'
      )}
    />
  </button>
);

/* ---------- Time select (From/To) ---------- */
const TimeSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  label?: string;
}> = ({ value, onChange, options, disabled, label }) => (
  <div className="flex items-center gap-2">
    {label ? <span className="text-xs text-gray-500 w-10">{label}</span> : null}
    <div className="relative w-full">
      <select
        className={cx(
          "appearance-none min-w-[120px] w-full rounded-[12px] bg-transparent border py-2.5 px-4 pr-10 text-sm text-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
          disabled && "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

type DayUi = ApiDay & {
  options: string[];
};

const WorkSchedule: React.FC = () => {
  const [days, setDays] = useState<DayUi[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  /* ✅ Step 1: Determine branch_id properly */
  const getValidBranchId = (): number | null => {
    try {
      const selectedBranch = localStorage.getItem('selected_branch');
      if (selectedBranch) {
        localStorage.setItem('branch_id', selectedBranch);
        return Number(selectedBranch);
      }

      const authRaw = localStorage.getItem('auth_response');
      if (!authRaw) {
        window.location.href = '/';
        return null;
      }

      const parsed = JSON.parse(authRaw);
      const authBranchId = parsed?.branch_id;

      // Every time check auth_response for validity
      if (authBranchId) {
        localStorage.setItem('branch_id', String(authBranchId));
        return Number(authBranchId);
      } else {
        window.location.href = '/';
        return null;
      }
    } catch {
      window.location.href = '/';
      return null;
    }
  };

  /* -------- Fetch work days -------- */
  useEffect(() => {
    const fetchDays = async () => {
      const branchId = getValidBranchId();
      if (!branchId) return;

      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${BASE_URL}/api/work-days/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiDay[] = await res.json();

        const mapByKey = new Map<DayKey, ApiDay>();
        json.forEach((d) => mapByKey.set(d.workingDay, d));

        const ordered: DayUi[] = DAYS.map(({ key }) => {
          const d = mapByKey.get(key as DayKey)!;
          return { ...d, options: TIME_OPTIONS };
        });

        setDays(ordered);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load work days.');
      } finally {
        setLoading(false);
      }
    };

    fetchDays();
  }, []);

  /* -------- PUT helpers (update server + local state) -------- */
  const updateServer = async (workId: number, body: Partial<Pick<ApiDay, 'from' | 'to' | 'status'>>) => {
    const res = await fetch(`${BASE_URL}/api/work-days/${workId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  const patchLocal = (workId: number, patch: Partial<ApiDay>) => {
    setDays((prev) =>
      prev.map((d) => (d.workId === workId ? { ...d, ...patch, options: TIME_OPTIONS } : d))
    );
  };

  const onChangeFrom = async (workId: number, next: string) => {
    try {
      patchLocal(workId, { from: next });
      await updateServer(workId, { from: next });
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update "from".');
    }
  };

  const onChangeTo = async (workId: number, next: string) => {
    try {
      patchLocal(workId, { to: next });
      await updateServer(workId, { to: next });
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update "to".');
    }
  };

  const onToggle = async (workId: number, on: boolean) => {
    const nextStatus: ApiDay['status'] = on ? 'active' : 'inactive';
    try {
      patchLocal(workId, { status: nextStatus });
      await updateServer(workId, { status: nextStatus });
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update status.');
    }
  };

  /* -------- Render -------- */
  const content = useMemo(() => {
    if (loading) return <div>Loading work days…</div>;
    if (err) return <div className="text-red-600">{err}</div>;
    if (!days.length) return <div>No work days found.</div>;

    return (
      <div className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4 pb-20">
        {DAYS.map(({ key, label }) => {
          const d = days.find((x) => x.workingDay === key)!;
          const enabled = d.status === 'active';
          return (
            <div key={key} className={cx('rounded-2xl bg-white p-6', !enabled && 'opacity-70')}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Toggle checked={enabled} onChange={(v) => onToggle(d.workId, v)} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <TimeSelect
                  label="From"
                  disabled={!enabled}
                  value={d.from}
                  onChange={(v) => onChangeFrom(d.workId, v)}
                  options={TIME_OPTIONS}
                />
                <TimeSelect
                  label="To"
                  disabled={!enabled}
                  value={d.to}
                  onChange={(v) => onChangeTo(d.workId, v)}
                  options={TIME_OPTIONS}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [days, loading, err]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#495057]">Working days</h3>
      </div>
      {content}
    </div>
  );
};

export default WorkSchedule;
