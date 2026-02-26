import React, { useEffect, useState } from "react";

export default function TeamPanel({
  teams,
  currentTeamId,
  onUpdateTeam,
  gameStarted,
  boardSize = 70
}) {
  // Allow simple editing of team name and color before the game begins.
  const handleChange = (id, field, value) => {
    if (gameStarted) return;
    const team = teams.find((t) => t.id === id);
    if (!team) return;
    onUpdateTeam(id, { ...team, [field]: value });
  };

  const [posDrafts, setPosDrafts] = useState({});

  useEffect(() => {
    setPosDrafts((prev) => {
      const next = { ...prev };
      for (const t of teams) {
        if (next[t.id] == null) next[t.id] = String((t.position ?? 0) + 1);
      }
      // Drop drafts for removed teams
      for (const key of Object.keys(next)) {
        if (!teams.some((t) => t.id === key)) delete next[key];
      }
      return next;
    });
  }, [teams]);

  const commitPosition = (teamId) => {
    const raw = posDrafts[teamId];
    const parsed = Number.parseInt(String(raw ?? ""), 10);
    if (!Number.isFinite(parsed)) {
      const team = teams.find((t) => t.id === teamId);
      setPosDrafts((p) => ({ ...p, [teamId]: String((team?.position ?? 0) + 1) }));
      return;
    }

    const clampedSquare = Math.max(1, Math.min(boardSize, parsed));
    const nextPosition = clampedSquare - 1;
    onUpdateTeam(teamId, { position: nextPosition });
    setPosDrafts((p) => ({ ...p, [teamId]: String(clampedSquare) }));
  };

  return (
    <div className="space-y-3 rounded-xl bg-slate-800/80 p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
        Teams
      </h2>
      <div className="flex flex-col gap-2">
        {teams.map((team) => {
          const isCurrent = team.id === currentTeamId;
          return (
            <div
              key={team.id}
              className={[
                "flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 md:px-3 md:py-2",
                "border-slate-600 bg-slate-900/70",
                isCurrent ? "ring-2 ring-cyan-400/80" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className="h-4 w-4 rounded-full border border-slate-900 md:h-5 md:w-5"
                  style={{ backgroundColor: team.color }}
                />
                <input
                  type="text"
                  value={team.name}
                  disabled={gameStarted}
                  onChange={(e) =>
                    handleChange(team.id, "name", e.target.value)
                  }
                  className="w-24 rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-50 outline-none ring-0 md:w-32 md:text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-[0.7rem] text-slate-300 md:text-xs">
                <span>Pos {team.position + 1}</span>
                <span className="hidden md:inline text-slate-500">|</span>
                <label className="flex items-center gap-1">
                  <span className="text-slate-400">Set</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={boardSize}
                    value={posDrafts[team.id] ?? String(team.position + 1)}
                    onChange={(e) =>
                      setPosDrafts((p) => ({ ...p, [team.id]: e.target.value }))
                    }
                    onBlur={() => commitPosition(team.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitPosition(team.id);
                      if (e.key === "Escape") {
                        setPosDrafts((p) => ({
                          ...p,
                          [team.id]: String(team.position + 1)
                        }));
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-14 rounded bg-slate-800 px-1 py-0.5 text-[0.7rem] text-slate-50 outline-none ring-0 md:text-xs"
                    title={`Type a square number (1-${boardSize}) and press Enter`}
                  />
                </label>
                <span>Wrong {team.wrongAttempts}</span>
                <span>
                  Turns {team.turnsTaken}/10
                </span>
              </div>
            </div>
          );
        })}
        {teams.length === 0 && (
          <p className="text-xs text-slate-400 md:text-sm">
            Add up to 10 teams before starting the game.
          </p>
        )}
      </div>
    </div>
  );
}

