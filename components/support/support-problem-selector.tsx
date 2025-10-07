'use client'
import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useEffect, useMemo, useState} from 'react';

type Problem = { problemId: number; question: string };
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_PROBLEMS = `${BASE_URL}/api/problems`;

export interface SupportProblemSelectorProps {
  value?: number | string | null;               // current value (problemId)
  onChange: (problemId: number | null) => void; // notify parent
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  // If your project uses a custom select component, you can pass a render override
  // render?: (args: { problems: Problem[]; value?: number|string|null; onChange: (v:number|null)=>void; loading:boolean; error?:string|null }) => JSX.Element;
}


interface ISupportProblemSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void;
	value?: string;
}

export default function SupportProblemSelector({
  value,
  onChange,
  className,
  disabled,
  placeholder = 'Select a problem',
  // render,
}: SupportProblemSelectorProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_PROBLEMS);
        if (!res.ok) throw new Error(`Failed to load problems: ${res.status}`);
        const json = await res.json();

        // Normalize results to {problemId, question}
        const list: Problem[] = Array.isArray(json)
          ? json
              .map((it: any) => {
                const id = typeof it?.problemId === 'number' ? it.problemId : Number.parseInt(String(it?.id ?? it?.problemId), 10);
                const q = String(it?.question ?? it?.title ?? '');
                if (!Number.isFinite(id) || !q) return null;
                return { problemId: id, question: q };
              })
              .filter(Boolean) as Problem[]
          : [];
        if (alive) setProblems(list);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Failed to load problems');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // prefer numeric value inside
  const normalizedValue: number | null = useMemo(() => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (!v) return onChange(null);
    const id = Number.parseInt(v, 10);
    onChange(Number.isFinite(id) ? id : null);
  };

  // If you want to render via a custom control, uncomment:
  // if (render) return render({ problems, value, onChange, loading, error });

  return (
    <select
      className={`w-full border rounded p-2 bg-white ${className ?? ''}`}
      value={normalizedValue ?? ''}
      onChange={handleChange}
      disabled={disabled || loading}
      aria-invalid={!!error}
    >
      <option value="" disabled>
        {loading ? 'Loading problems…' : placeholder}
      </option>
      {problems.map((p) => (
        <option key={p.problemId} value={p.problemId}>
          {p.question}
        </option>
      ))}
    </select>
  );
}
