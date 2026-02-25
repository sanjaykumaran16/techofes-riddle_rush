import React, { useMemo, useState } from "react";
import { HARD_RIDDLES } from "../data/riddles.js";

export default function SuddenDeath({ teams, onWinnerSelected }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const riddle = useMemo(() => {
    const idx = Math.floor(Math.random() * HARD_RIDDLES.length);
    return HARD_RIDDLES[idx];
  }, []);

  const toggleTeam = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [winnerId, setWinnerId] = useState("");

  const handleConfirmWinner = () => {
    const team = teams.find((t) => t.id === winnerId);
    if (!team) return;
    onWinnerSelected(team);
  };

  const tiedTeams = useMemo(() => {
    if (!teams.length) return [];
    const sorted = [...teams].sort((a, b) => {
      if (b.position !== a.position) return b.position - a.position;
      if (a.wrongAttempts !== b.wrongAttempts)
        return a.wrongAttempts - b.wrongAttempts;
      return 0;
    });
    const top = sorted[0];
    return sorted.filter(
      (t) =>
        t.position === top.position && t.wrongAttempts === top.wrongAttempts
    );
  }, [teams]);

  return (
    <div className="mt-6 rounded-2xl border border-purple-500/60 bg-slate-900/90 p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold text-purple-200 mb-3">
        Sudden Death Mode
      </h2>
      <p className="text-sm md:text-base text-slate-200 mb-3">
        Select tied teams, reveal the riddle on the projector, and mark the first team to answer correctly as the winner.
      </p>

      <div className="mb-4">
        <h3 className="text-sm md:text-base font-semibold text-slate-100 mb-2">
          Suggested tied teams
        </h3>
        <div className="flex flex-wrap gap-2">
          {tiedTeams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => toggleTeam(team.id)}
              className={[
                "rounded-full border px-3 py-1 text-xs md:text-sm font-semibold",
                selectedIds.includes(team.id)
                  ? "border-purple-400 bg-purple-500/20 text-purple-100"
                  : "border-slate-600 bg-slate-800 text-slate-100"
              ].join(" ")}
            >
              {team.name}
            </button>
          ))}
          {tiedTeams.length === 0 && (
            <span className="text-xs text-slate-400">
              No clear tie detected – you can still choose any teams below.
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm md:text-base font-semibold text-slate-100 mb-2">
          Riddle
        </h3>
        <div className="rounded-xl bg-slate-800/80 p-4 text-base md:text-lg text-slate-50">
          {riddle.question}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm md:text-base font-semibold text-slate-100 mb-2">
          Mark winning team
        </h3>
        <select
          value={winnerId}
          onChange={(e) => setWinnerId(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm md:text-base text-slate-100"
        >
          <option value="">Select winner...</option>
          {(selectedIds.length ? teams.filter((t) => selectedIds.includes(t.id)) : teams).map(
            (team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            )
          )}
        </select>
      </div>

      <button
        type="button"
        onClick={handleConfirmWinner}
        disabled={!winnerId}
        className={[
          "rounded-lg px-4 py-2 text-sm md:text-base font-semibold",
          "bg-purple-500 text-slate-900 hover:bg-purple-400",
          "disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        ].join(" ")}
      >
        Confirm Final Winner
      </button>
    </div>
  );
}

