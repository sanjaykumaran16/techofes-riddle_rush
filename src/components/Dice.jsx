import React from "react";

export default function Dice({ value, rolling, onRoll, disabled }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-800/80 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
        Dice
      </h2>
      <div
        className={[
          "flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-slate-600 bg-slate-900 text-4xl font-bold md:h-24 md:w-24 md:text-5xl",
          rolling ? "animate-pulse" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={onRoll}
        disabled={disabled || rolling}
        className={[
          "w-full rounded-lg px-4 py-2 text-base font-semibold md:text-lg",
          "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
          "disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        ].join(" ")}
      >
        {rolling ? "Rolling..." : "Roll Dice"}
      </button>
    </div>
  );
}

