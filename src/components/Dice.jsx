import React from "react";

export default function Dice({ value, onMove, disabled }) {
  const buttons = [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-800/80 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
        Steps
      </h2>
      <p className="text-xs md:text-sm text-slate-300 text-center">
        Choose how many squares to move (1–6).
      </p>
      <div className="grid w-full grid-cols-6 gap-2">
        {buttons.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onMove?.(n)}
            className={[
              "flex items-center justify-center rounded-lg px-2 py-2 text-sm md:text-base font-semibold",
              "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
              "disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="text-xs md:text-sm text-slate-400">
        Last chosen:{" "}
        <span className="font-semibold text-slate-100">{value}</span>
      </div>
    </div>
  );
}

