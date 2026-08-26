"use client";

const ICONS = {
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z",
  directory:
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0v1H4v-1Z",
  pipeline: "M3 5h18M6 12h12M10 19h4",
  campaign: "M4 10v4h4l5 4V6L8 10H4Zm12.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z",
  deliverables:
    "M4 5h16v14H4zM8 9h8M8 13h8M8 17h5",
  performance: "M4 19V5m0 14h16M8 15l3.5-4L15 14l4-6",
};

export const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "directory", label: "KOL Directory" },
  { id: "pipeline", label: "Pipeline" },
  { id: "campaign", label: "Campaign" },
  { id: "deliverables", label: "Deliverables" },
  { id: "performance", label: "Performance" },
];

function Icon({ id }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[id]} />
    </svg>
  );
}

export default function Sidebar({ view, setView, demo }) {
  return (
    <>
      {/* Rail — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between bg-ink px-3 py-5 text-white lg:flex">
        <div>
          <div className="px-2.5 pb-6">
            <div className="font-display text-lg font-extrabold tracking-tight">
              KOL Manager
            </div>
            <div className="font-data text-[10px] uppercase tracking-[0.16em] text-white/40">
              rate card &amp; pipeline
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((n) => {
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-jade text-white"
                      : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon id={n.id} />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="px-2.5 text-[11px] leading-relaxed text-white/35">
          {demo ? (
            <>
              Mode demo — data contoh di memori.
              <br />
              Isi env var untuk tersambung ke Sheet.
            </>
          ) : (
            <>Tersambung ke Google Sheets.</>
          )}
        </div>
      </aside>

      {/* Tab strip — mobile */}
      <div className="sticky top-0 z-30 bg-ink px-3 py-2.5 text-white lg:hidden">
        <div className="flex items-baseline justify-between px-1 pb-2">
          <span className="font-display text-base font-extrabold">KOL Manager</span>
          {demo && (
            <span className="font-data text-[10px] uppercase tracking-wider text-white/40">
              demo
            </span>
          )}
        </div>
        <div className="no-bar -mx-1 flex gap-1 overflow-x-auto px-1">
          {NAV.map((n) => {
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active ? "bg-jade text-white" : "bg-white/10 text-white/70"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
