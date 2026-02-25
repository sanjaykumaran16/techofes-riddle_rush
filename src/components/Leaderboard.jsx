import React from "react";

export default function Leaderboard({ teams }) {
  const sorted = [...teams].sort((a, b) => {
    if (b.position !== a.position) return b.position - a.position;
    if (a.wrongAttempts !== b.wrongAttempts)
      return a.wrongAttempts - b.wrongAttempts;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3 rounded-xl bg-slate-800/80 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
        Leaderboard
      </h2>
      <div className="flex flex-col gap-1.5 text-xs md:text-sm">
        {sorted.map((team, index) => (
          <div
            key={team.id}
            className={[
              "flex items-center justify-between rounded-lg border px-2 py-1.5 md:px-3 md:py-2",
              "border-slate-700 bg-slate-900/80"
            ].join(" ")}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <span className="w-5 text-center text-xs text-slate-400 md:w-6 md:text-sm">
                #{index + 1}
              </span>
              <div
                className="h-3 w-3 rounded-full border border-slate-900 md:h-4 md:w-4"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-xs font-semibold text-slate-100 md:text-sm">
                {team.name || "Team"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[0.7rem] text-slate-300 md:text-xs">
              <span>Pos {team.position + 1}</span>
              <span>Wrong {team.wrongAttempts}</span>
              <span>Turns left {Math.max(0, 8 - team.turnsTaken)}</span>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-slate-400 md:text-sm">
            Leaderboard will appear once teams are added.
          </p>
        )}
      </div>
    </div>
  );
}

