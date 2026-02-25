import React from "react";

export default function TeamPanel({
  teams,
  currentTeamId,
  onUpdateTeam,
  gameStarted
}) {
  // Allow simple editing of team name and color before the game begins.
  const handleChange = (id, field, value) => {
    if (gameStarted) return;
    const team = teams.find((t) => t.id === id);
    if (!team) return;
    onUpdateTeam(id, { ...team, [field]: value });
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

