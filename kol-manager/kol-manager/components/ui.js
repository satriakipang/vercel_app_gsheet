"use client";

import { useEffect } from "react";

export function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-mute">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-mute hover:bg-canvas hover:text-ink"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-ink-line bg-canvas/60 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </label>
  );
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <select className="field" value={value} onChange={onChange} {...rest}>
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )
      )}
    </select>
  );
}

export function Pill({ children, color }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={
        color
          ? { color, backgroundColor: color + "18" }
          : { color: "#39424B", backgroundColor: "#ECEDEF" }
      }
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, action, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="font-display text-base font-bold">{title}</div>
      {children && <p className="max-w-sm text-sm text-ink-mute">{children}</p>}
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, accent }) {
  return (
    <div className="card px-4 py-3.5">
      <div className="eyebrow">{label}</div>
      <div
        className="num mt-1.5 text-2xl font-semibold leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-ink-mute">{sub}</div>}
    </div>
  );
}

export function SectionHead({ title, count, right }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="font-display text-base font-bold">
        {title}
        {count != null && (
          <span className="num ml-2 text-sm font-medium text-ink-mute">{count}</span>
        )}
      </h2>
      {right}
    </div>
  );
}
