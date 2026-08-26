"use client";

export default function Table({ columns, rows, onRowClick, empty }) {
  if (!rows.length) return empty || null;

  return (
    <>
      {/* Tabel — layar lebar */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-line">
              {columns.map((c) => (
                <th
                  key={c.k}
                  className={`eyebrow px-4 py-2.5 text-left font-medium ${
                    c.align === "right" ? "text-right" : ""
                  }`}
                >
                  {c.l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRowClick?.(r)}
                className="cursor-pointer border-b border-ink-line/60 last:border-0 hover:bg-canvas/70"
              >
                {columns.map((c) => (
                  <td
                    key={c.k}
                    className={`px-4 py-3 align-middle ${
                      c.align === "right" ? "text-right" : ""
                    } ${c.mono ? "num" : ""}`}
                  >
                    {c.render ? c.render(r) : r[c.k] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kartu — layar sempit */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => onRowClick?.(r)}
            className="card px-4 py-3 text-left"
          >
            {columns.map((c, i) => (
              <div
                key={c.k}
                className={
                  i === 0
                    ? "mb-2 font-display text-[15px] font-bold"
                    : "flex justify-between gap-4 py-0.5 text-[13px]"
                }
              >
                {i === 0 ? (
                  c.render ? c.render(r) : r[c.k]
                ) : (
                  <>
                    <span className="text-ink-mute">{c.l}</span>
                    <span className={c.mono ? "num text-right" : "text-right"}>
                      {c.render ? c.render(r) : r[c.k] || "—"}
                    </span>
                  </>
                )}
              </div>
            ))}
          </button>
        ))}
      </div>
    </>
  );
}
